import base64
import json
import uuid
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models import EmotionPrediction, JournalEntry, User, utc_now
from app.services.emotion import content_digest
from app.services.weekly_insights import invalidate_weekly_insights

UTC = timezone.utc


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def _encode_cursor(entry: JournalEntry) -> str:
    payload = json.dumps([_as_utc(entry.created_at).isoformat(), str(entry.id)], separators=(",", ":"))
    return base64.urlsafe_b64encode(payload.encode("utf-8")).decode("ascii").rstrip("=")


def _decode_cursor(cursor: str) -> tuple[datetime, uuid.UUID]:
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        created_at_text, entry_id_text = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
        created_at = datetime.fromisoformat(created_at_text)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        return created_at.astimezone(UTC), uuid.UUID(entry_id_text)
    except (ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("Invalid pagination cursor") from exc


def _date_range_clause(start_date: date | None, end_date: date | None, timezone_name: str):
    zone = ZoneInfo(timezone_name)
    clauses = []
    if start_date:
        start = datetime.combine(start_date, time.min, tzinfo=zone).astimezone(UTC)
        clauses.append(JournalEntry.created_at >= start)
    if end_date:
        end_exclusive = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=zone).astimezone(UTC)
        clauses.append(JournalEntry.created_at < end_exclusive)
    return clauses


def list_entries(
    db: Session,
    user: User,
    *,
    query_text: str | None,
    start_date: date | None,
    end_date: date | None,
    timezone_name: str,
    sort: str,
    limit: int,
    cursor: str | None,
) -> dict:
    statement = select(JournalEntry).where(JournalEntry.user_id == user.id)
    if query_text and query_text.strip():
        pattern = f"%{query_text.strip()}%"
        statement = statement.where(or_(JournalEntry.title.ilike(pattern), JournalEntry.content.ilike(pattern)))
    for clause in _date_range_clause(start_date, end_date, timezone_name):
        statement = statement.where(clause)

    if cursor:
        try:
            cursor_created_at, cursor_id = _decode_cursor(cursor)
        except ValueError as exc:
            raise ValueError("Invalid pagination cursor") from exc
        if sort == "newest":
            statement = statement.where(or_(JournalEntry.created_at < cursor_created_at, and_(JournalEntry.created_at == cursor_created_at, JournalEntry.id < cursor_id)))
        else:
            statement = statement.where(or_(JournalEntry.created_at > cursor_created_at, and_(JournalEntry.created_at == cursor_created_at, JournalEntry.id > cursor_id)))

    if sort == "oldest":
        statement = statement.order_by(JournalEntry.created_at.asc(), JournalEntry.id.asc())
    else:
        statement = statement.order_by(JournalEntry.created_at.desc(), JournalEntry.id.desc())
    rows = list(db.scalars(statement.limit(limit + 1)).all())
    has_more = len(rows) > limit
    page_rows = rows[:limit]
    latest_by_entry: dict[uuid.UUID, EmotionPrediction] = {}
    if page_rows:
        entry_ids = [entry.id for entry in page_rows]
        predictions = db.scalars(
            select(EmotionPrediction)
            .where(EmotionPrediction.entry_id.in_(entry_ids))
            .order_by(EmotionPrediction.created_at.desc(), EmotionPrediction.id.desc())
        ).all()
        for prediction in predictions:
            latest_by_entry.setdefault(prediction.entry_id, prediction)
    items = []
    for entry in page_rows:
        excerpt = " ".join(entry.content.split())
        if len(excerpt) > 180:
            excerpt = excerpt[:177].rstrip() + "…"
        prediction = latest_by_entry.get(entry.id)
        prediction_summary = None
        if prediction:
            is_stale = prediction.content_version != entry.content_version or prediction.content_hash != content_digest(entry.content)
            prediction_summary = {"label": prediction.top_label, "analyzed_at": prediction.created_at, "stale": is_stale}
        items.append({
            "id": entry.id,
            "title": entry.title,
            "excerpt": excerpt,
            "self_reported_mood": entry.self_reported_mood,
            "latest_prediction": prediction_summary,
            "created_at": entry.created_at,
            "updated_at": entry.updated_at,
        })
    next_cursor = _encode_cursor(page_rows[-1]) if has_more and page_rows else None
    return {"items": items, "next_cursor": next_cursor}


def get_owned_entry(db: Session, user: User, entry_id: uuid.UUID) -> JournalEntry | None:
    return db.scalar(select(JournalEntry).where(JournalEntry.id == entry_id, JournalEntry.user_id == user.id))


def create_entry(db: Session, user: User, *, title: str | None, content: str, mood: str | None) -> JournalEntry:
    entry = JournalEntry(user_id=user.id, title=title, content=content, self_reported_mood=mood)
    db.add(entry)
    db.flush()
    invalidate_weekly_insights(db, entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_entry(db: Session, user: User, entry_id: uuid.UUID, changes: dict) -> JournalEntry | None:
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        return None
    changed = False
    for field, value in changes.items():
        if getattr(entry, field) != value:
            if field == "content":
                entry.content_version += 1
            setattr(entry, field, value)
            changed = True
    if changed:
        entry.updated_at = utc_now()
        db.add(entry)
        invalidate_weekly_insights(db, entry)
        db.commit()
        db.refresh(entry)
    return entry


def delete_entry(db: Session, user: User, entry_id: uuid.UUID) -> bool:
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        return False
    invalidate_weekly_insights(db, entry)
    db.delete(entry)
    db.commit()
    return True
