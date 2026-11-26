from collections import Counter
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import EmotionPrediction, JournalEntry, User
from app.services.emotion import content_digest
from app.services.journal import _as_utc, _date_range_clause

UTC = timezone.utc
REPORT_TO_MODEL = {
    "anger": "anger", "frustrated": "anger",
    "disgust": "disgust",
    "fear": "fear", "anxious": "fear",
    "joy": "joy", "happy": "joy", "excited": "joy", "hopeful": "joy", "grateful": "joy", "relieved": "joy",
    "neutral": "neutral", "calm": "neutral", "tired": "neutral",
    "sadness": "sadness", "sad": "sadness",
    "surprise": "surprise",
}


def _load_entries(db: Session, user: User, start_date: date, end_date: date, timezone_name: str):
    statement = select(JournalEntry).options(selectinload(JournalEntry.feedback)).where(JournalEntry.user_id == user.id)
    for clause in _date_range_clause(start_date, end_date, timezone_name):
        statement = statement.where(clause)
    entries = list(db.scalars(statement).all())
    if not entries:
        return entries, {}

    entry_by_id = {entry.id: entry for entry in entries}
    predictions = db.scalars(
        select(EmotionPrediction)
        .where(EmotionPrediction.entry_id.in_(entry_by_id))
        .order_by(EmotionPrediction.created_at.desc(), EmotionPrediction.id.desc())
    ).all()
    latest_current: dict = {}
    for prediction in predictions:
        entry = entry_by_id[prediction.entry_id]
        if prediction.entry_id not in latest_current and prediction.content_version == entry.content_version and prediction.content_hash == content_digest(entry.content):
            latest_current[prediction.entry_id] = prediction
    return entries, latest_current


def _report(entry: JournalEntry) -> str | None:
    return entry.feedback.reported_emotion if entry.feedback else entry.self_reported_mood


def _day(entry: JournalEntry, timezone_name: str) -> date:
    zone = ZoneInfo(timezone_name)
    created = entry.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=UTC)
    return created.astimezone(zone).date()


def mood_distribution(db: Session, user: User, start_date: date, end_date: date, timezone_name: str) -> dict:
    entries, predictions = _load_entries(db, user, start_date, end_date, timezone_name)
    reported_counts = Counter(report for entry in entries if (report := _report(entry)))
    estimate_counts = Counter(prediction.top_label for prediction in predictions.values())
    reported_total = sum(reported_counts.values())
    analyzed_total = sum(estimate_counts.values())

    def distribution_for(counts: Counter, total: int) -> list[dict]:
        return [
            {"mood": mood, "count": count, "percentage": round(count / total * 100, 1)}
            for mood, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
        ]

    reported_distribution = distribution_for(reported_counts, reported_total)
    ai_distribution = distribution_for(estimate_counts, analyzed_total)
    mixed_emotion_entries = []
    for entry in sorted(entries, key=lambda value: (value.created_at, str(value.id)), reverse=True):
        prediction = predictions.get(entry.id)
        if prediction is None:
            continue
        scores = [(str(mood).lower(), max(0.0, float(score))) for mood, score in (prediction.scores or {}).items()]
        score_total = sum(score for _, score in scores)
        if score_total <= 0 or len(scores) < 2:
            continue
        scores.sort(key=lambda item: (-item[1], item[0]))
        top_scores = [
            {"mood": mood, "percentage": round(score / score_total * 100, 1)}
            for mood, score in scores[:2]
        ]
        mixed_emotion_entries.append({
            "entry_id": str(entry.id),
            "title": entry.title or "Untitled entry",
            "created_at": entry.created_at,
            "top_scores": top_scores,
            "other_percentage": round(max(0.0, 100 - sum(item["percentage"] for item in top_scores)), 1),
        })
        if len(mixed_emotion_entries) >= 5:
            break
    return {
        "from": start_date,
        "to": end_date,
        "timezone": timezone_name,
        "total_entries": len(entries),
        "reported_entries": reported_total,
        "unreported_entries": len(entries) - reported_total,
        # `distribution` remains an alias for the self-reported series for existing clients.
        "distribution": reported_distribution,
        "reported_distribution": reported_distribution,
        "ai_distribution": ai_distribution,
        "analyzed_entries": analyzed_total,
        "unanalyzed_entries": len(entries) - analyzed_total,
        "mixed_emotion_entries": mixed_emotion_entries,
    }


def mood_trends(db: Session, user: User, start_date: date, end_date: date, timezone_name: str) -> dict:
    entries, predictions = _load_entries(db, user, start_date, end_date, timezone_name)
    days: dict[date, dict] = {}
    current = start_date
    while current <= end_date:
        days[current] = {"date": current, "entries": 0, "reported": 0, "analyzed": 0, "reported_moods": Counter(), "predicted_emotions": Counter()}
        current += timedelta(days=1)
    for entry in entries:
        bucket = days[_day(entry, timezone_name)]
        bucket["entries"] += 1
        report = _report(entry)
        if report:
            bucket["reported"] += 1
            bucket["reported_moods"][report] += 1
        prediction = predictions.get(entry.id)
        if prediction:
            bucket["analyzed"] += 1
            bucket["predicted_emotions"][prediction.top_label] += 1
    return {
        "from": start_date,
        "to": end_date,
        "timezone": timezone_name,
        "days": [
            {**{key: value for key, value in bucket.items() if key not in ("reported_moods", "predicted_emotions")},
             "reported_moods": dict(bucket["reported_moods"]), "predicted_emotions": dict(bucket["predicted_emotions"])}
            for bucket in days.values()
        ],
    }


def journal_activity(db: Session, user: User, start_date: date, end_date: date, timezone_name: str) -> dict:
    entries, predictions = _load_entries(db, user, start_date, end_date, timezone_name)
    counts = Counter(_day(entry, timezone_name) for entry in entries)
    emotion_counts: dict[date, Counter] = {}
    emotion_latest: dict[date, dict[str, datetime]] = {}
    for entry in entries:
        prediction = predictions.get(entry.id)
        if prediction is None:
            continue
        day = _day(entry, timezone_name)
        emotion = str(prediction.top_label).lower()
        emotion_counts.setdefault(day, Counter())[emotion] += 1
        latest_for_day = emotion_latest.setdefault(day, {})
        analyzed_at = prediction.created_at
        if analyzed_at.tzinfo is None:
            analyzed_at = analyzed_at.replace(tzinfo=UTC)
        if emotion not in latest_for_day or analyzed_at > latest_for_day[emotion]:
            latest_for_day[emotion] = analyzed_at
    days = []
    current = start_date
    while current <= end_date:
        daily_emotions = emotion_counts.get(current, Counter())
        dominant_emotion = None
        if daily_emotions:
            highest_count = max(daily_emotions.values())
            tied_emotions = [emotion for emotion, count in daily_emotions.items() if count == highest_count]
            dominant_emotion = max(tied_emotions, key=lambda emotion: emotion_latest[current][emotion])
        days.append({"date": current, "count": counts[current], "dominant_emotion": dominant_emotion})
        current += timedelta(days=1)
    return {"from": start_date, "to": end_date, "timezone": timezone_name, "total_entries": len(entries), "days": days}


def prediction_comparison(db: Session, user: User, start_date: date, end_date: date, timezone_name: str) -> dict:
    entries, predictions = _load_entries(db, user, start_date, end_date, timezone_name)
    prediction_entries = 0
    report_entries = 0
    pairs: Counter[tuple[str, str]] = Counter()
    estimate_counts: Counter[str] = Counter()
    reports_without_prediction = 0
    predictions_without_report = 0
    excluded_labels = 0
    for entry in entries:
        report = _report(entry)
        prediction = predictions.get(entry.id)
        if prediction:
            prediction_entries += 1
            estimate_counts[prediction.top_label] += 1
        if report:
            report_entries += 1
        if prediction and not report:
            predictions_without_report += 1
        elif report and not prediction:
            reports_without_prediction += 1
        elif prediction and report:
            normalized_report = REPORT_TO_MODEL.get(report)
            if normalized_report is None:
                excluded_labels += 1
            else:
                pairs[(normalized_report, prediction.top_label)] += 1

    compared_count = sum(pairs.values())
    agreement_count = sum(count for (reported, predicted), count in pairs.items() if reported == predicted)
    matrix = [
        {"reported_emotion": reported, "predicted_emotion": predicted, "count": count}
        for (reported, predicted), count in sorted(pairs.items())
    ]
    return {
        "from": start_date,
        "to": end_date,
        "timezone": timezone_name,
        "prediction_entries": int(prediction_entries),
        "report_entries": int(report_entries),
        "compared_count": compared_count,
        "agreement_count": agreement_count,
        "agreement_rate": round(agreement_count / compared_count * 100, 1) if compared_count else None,
        "predictions_without_report": predictions_without_report,
        "reports_without_prediction": reports_without_prediction,
        "excluded_unmapped_reports": excluded_labels,
        "estimate_distribution": [
            {"mood": mood, "count": count}
            for mood, count in sorted(estimate_counts.items(), key=lambda item: (-item[1], item[0]))
        ],
        "matrix": matrix,
    }
