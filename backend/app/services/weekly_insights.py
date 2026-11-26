import hashlib
import json
import re
from collections import Counter
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models import EmotionPrediction, JournalEntry, User, WeeklyInsight, utc_now

UTC = timezone.utc
REFLECTION_FORMAT_VERSION = 4
def content_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _aware_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def week_bounds(week_of: date, timezone_name: str) -> tuple[date, date, datetime, datetime]:
    zone = ZoneInfo(timezone_name)
    start = week_of - timedelta(days=week_of.weekday())
    end = start + timedelta(days=6)
    start_utc = datetime.combine(start, time.min, tzinfo=zone).astimezone(UTC)
    end_utc = datetime.combine(start + timedelta(days=7), time.min, tzinfo=zone).astimezone(UTC)
    return start, end, start_utc, end_utc


def _report(entry: JournalEntry) -> str | None:
    return entry.feedback.reported_emotion if entry.feedback else entry.self_reported_mood


def _collect_week(db: Session, user: User, week_start: date, week_end: date, start_utc: datetime, end_utc: datetime, timezone_name: str) -> dict:
    entries = list(db.scalars(
        select(JournalEntry)
        .options(selectinload(JournalEntry.feedback))
        .where(JournalEntry.user_id == user.id, JournalEntry.created_at >= start_utc, JournalEntry.created_at < end_utc)
        .order_by(JournalEntry.created_at.desc(), JournalEntry.id.desc())
    ).all())
    ids = [entry.id for entry in entries]
    latest_predictions: dict = {}
    if ids:
        predictions = db.scalars(
            select(EmotionPrediction)
            .where(EmotionPrediction.entry_id.in_(ids))
            .order_by(EmotionPrediction.created_at.desc(), EmotionPrediction.id.desc())
        ).all()
        entries_by_id = {entry.id: entry for entry in entries}
        for prediction in predictions:
            entry = entries_by_id[prediction.entry_id]
            if prediction.entry_id not in latest_predictions and prediction.content_version == entry.content_version and prediction.content_hash == content_digest(entry.content):
                latest_predictions[prediction.entry_id] = prediction

    mood_counts: Counter[str] = Counter()
    estimate_counts: Counter[str] = Counter()
    source_rows = []
    for entry in entries:
        report = _report(entry)
        if report:
            mood_counts[report] += 1
        prediction = latest_predictions.get(entry.id)
        if prediction:
            estimate_counts[prediction.top_label] += 1
        source_rows.append({
            "id": str(entry.id),
            "title": entry.title,
            "created_at": _aware_utc(entry.created_at).isoformat(),
            "content_version": entry.content_version,
            "content_hash": content_digest(entry.content),
            "self_reported_mood": entry.self_reported_mood,
            "reported_emotion": entry.feedback.reported_emotion if entry.feedback else None,
            "prediction_id": str(prediction.id) if prediction else None,
            "prediction_label": prediction.top_label if prediction else None,
        })

    statistics = {
        "reflection_format_version": REFLECTION_FORMAT_VERSION,
        "entry_count": len(entries),
        "reported_entry_count": sum(mood_counts.values()),
        "reported_moods": dict(sorted(mood_counts.items())),
        "analyzed_entry_count": sum(estimate_counts.values()),
        "ai_estimates": dict(sorted(estimate_counts.items())),
        # Kept as an empty field so older clients can safely read regenerated insights.
        # Raw word frequency is not a reliable or human way to infer what mattered.
        "recurring_keywords": [],
    }
    serialized_sources = json.dumps(source_rows, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    fingerprint = hashlib.sha256(f"human-reflection-v{REFLECTION_FORMAT_VERSION}\0".encode() + serialized_sources.encode("utf-8")).hexdigest()
    return {
        "week_start": week_start,
        "week_end": week_end,
        "timezone": timezone_name,
        "entries": entries,
        "statistics": statistics,
        "source_fingerprint": fingerprint,
        "source_entry_ids": [str(entry.id) for entry in entries],
    }


def _entry_anchor(entry: JournalEntry) -> str:
    title = re.sub(r"\s+", " ", (entry.title or "").strip())
    if title and title.lower() not in {"untitled", "untitled entry", "journal entry"}:
        if len(title) > 72:
            title = (title[:69].rsplit(" ", 1)[0] or title[:69]) + "…"
        return f"“{title}”"
    content = re.sub(r"\s+", " ", (entry.content or "").strip())
    if content:
        first_sentence = re.split(r"(?<=[.!?])\s+", content, maxsplit=1)[0]
        excerpt = first_sentence
        if len(excerpt) > 78:
            excerpt = (excerpt[:75].rsplit(" ", 1)[0] or excerpt[:75]) + "…"
        return f"“{excerpt}”"
    day = entry.created_at.strftime("%b %d").replace(" 0", " ")
    return f"your entry from {day}"


def _reflection_prompts(entries: list[JournalEntry]) -> list[str]:
    if not entries:
        return []
    anchors = [_entry_anchor(entry) for entry in entries[:5]]
    prompts = [
        "In {entry}, what feels most important to you as you read it back?",
        "What do you wish someone understood about the moment you described in {entry}?",
        "When you read {entry} again, is there anything you see differently now?",
        "What did you need most around the time you wrote {entry}?",
        "What, if anything, would you like to carry forward from {entry}?",
    ]
    return [prompt.format(entry=anchors[index % len(anchors)]) for index, prompt in enumerate(prompts)]


def _summary(statistics: dict, entries: list[JournalEntry], week_start: date, week_end: date) -> tuple[str, list[str]]:
    entry_count = statistics["entry_count"]
    start_label = week_start.strftime("%b %d").replace(" 0", " ")
    end_label = week_end.strftime("%b %d").replace(" 0", " ")
    date_label = f"{start_label}, {week_start.year}–{end_label}, {week_end.year}" if week_start.year != week_end.year else f"{start_label}–{end_label}, {week_end.year}"
    sentences = [f"You made space to write in {entry_count} {('entry' if entry_count == 1 else 'entries')} during {date_label}."]
    moods = statistics["reported_moods"]
    if moods:
        mood_names = [label.replace("_", " ") for label in moods]
        mood_list = mood_names[0] if len(mood_names) == 1 else ", ".join(mood_names[:-1]) + f" and {mood_names[-1]}"
        sentences.append(f"In {sum(moods.values())} {('entry' if sum(moods.values()) == 1 else 'entries')}, you chose to describe how you felt, including {mood_list}.")
    else:
        sentences.append("You didn’t add mood check-ins this week, so this reflection leaves room for your own interpretation.")
    return " ".join(sentences), _reflection_prompts(entries)


def _supporting_entries(entries: list[JournalEntry]) -> list[dict]:
    return [{"id": entry.id, "title": entry.title, "created_at": entry.created_at} for entry in entries[:20]]


def _insight_read(insight: WeeklyInsight, data: dict, stale: bool | None = None) -> dict:
    source_ids = set(insight.source_entry_ids or [])
    return {
        "id": insight.id,
        "week_start": insight.week_start,
        "week_end": insight.week_end,
        "timezone": insight.timezone,
        "status": "stale" if stale is True else insight.status,
        "entry_count": insight.entry_count,
        "minimum_entry_count": settings.weekly_insight_min_entries,
        "summary": insight.summary,
        "statistics": insight.statistics,
        "reflection_prompts": insight.reflection_prompts,
        "supporting_entries": _supporting_entries([entry for entry in data["entries"] if str(entry.id) in source_ids]),
        "generated_at": insight.generated_at,
    }


def get_weekly_insight(db: Session, user: User, week_of: date, timezone_name: str) -> dict:
    start, end, start_utc, end_utc = week_bounds(week_of, timezone_name)
    data = _collect_week(db, user, start, end, start_utc, end_utc, timezone_name)
    insight = db.scalar(select(WeeklyInsight).where(WeeklyInsight.user_id == user.id, WeeklyInsight.week_start == start))
    if insight is None:
        return {
            "id": None, "week_start": start, "week_end": end, "timezone": timezone_name,
            "status": "not_generated", "entry_count": data["statistics"]["entry_count"],
            "minimum_entry_count": settings.weekly_insight_min_entries, "summary": None,
            "statistics": data["statistics"], "reflection_prompts": [],
            "supporting_entries": _supporting_entries(data["entries"]), "generated_at": None,
        }
    if (insight.statistics or {}).get("reflection_format_version", 0) < REFLECTION_FORMAT_VERSION:
        return generate_weekly_insight(db, user, week_of, timezone_name)
    is_stale = insight.status == "stale" or insight.source_fingerprint != data["source_fingerprint"] or insight.timezone != timezone_name
    if is_stale and insight.status != "stale":
        insight.status = "stale"
        insight.updated_at = utc_now()
        db.commit()
    return _insight_read(insight, data, is_stale)


def generate_weekly_insight(db: Session, user: User, week_of: date, timezone_name: str) -> dict:
    start, end, start_utc, end_utc = week_bounds(week_of, timezone_name)
    data = _collect_week(db, user, start, end, start_utc, end_utc, timezone_name)
    entry_count = data["statistics"]["entry_count"]
    summary, prompts = _summary(data["statistics"], data["entries"], start, end) if entry_count >= settings.weekly_insight_min_entries else (None, [])
    status = "ready" if entry_count >= settings.weekly_insight_min_entries else "insufficient_data"
    insight = db.scalar(select(WeeklyInsight).where(WeeklyInsight.user_id == user.id, WeeklyInsight.week_start == start))
    if insight is None:
        insight = WeeklyInsight(user_id=user.id, week_start=start)
        db.add(insight)
    insight.week_start = start
    insight.week_end = end
    insight.timezone = timezone_name
    insight.summary = summary
    insight.statistics = data["statistics"]
    insight.reflection_prompts = prompts
    insight.source_fingerprint = data["source_fingerprint"]
    insight.source_entry_ids = data["source_entry_ids"]
    insight.entry_count = entry_count
    insight.status = status
    insight.generated_at = utc_now()
    insight.updated_at = utc_now()
    db.commit()
    db.refresh(insight)
    return _insight_read(insight, data)


def get_insight_history(db: Session, user: User, limit: int, before: date | None) -> dict:
    statement = select(WeeklyInsight).where(WeeklyInsight.user_id == user.id)
    if before:
        statement = statement.where(WeeklyInsight.week_start < before)
    statement = statement.order_by(WeeklyInsight.week_start.desc()).limit(limit + 1)
    rows = list(db.scalars(statement).all())
    has_more = len(rows) > limit
    rows = rows[:limit]
    items = []
    for insight in rows:
        start, end, start_utc, end_utc = week_bounds(insight.week_start, insight.timezone)
        data = _collect_week(db, user, start, end, start_utc, end_utc, insight.timezone)
        stale = insight.status == "stale" or insight.source_fingerprint != data["source_fingerprint"]
        if stale and insight.status != "stale":
            insight.status = "stale"
            insight.updated_at = utc_now()
        items.append(_insight_read(insight, data, stale))
    if rows:
        db.commit()
    next_before = rows[-1].week_start if has_more and rows else None
    return {"items": items, "next_before": next_before}


def invalidate_weekly_insights(db: Session, entry: JournalEntry) -> None:
    if not entry.created_at:
        return
    created_at = _aware_utc(entry.created_at)
    insights = db.scalars(select(WeeklyInsight).where(WeeklyInsight.user_id == entry.user_id, WeeklyInsight.status != "stale")).all()
    for insight in insights:
        local_date = created_at.astimezone(ZoneInfo(insight.timezone)).date()
        if insight.week_start <= local_date <= insight.week_end:
            insight.status = "stale"
            insight.updated_at = utc_now()
