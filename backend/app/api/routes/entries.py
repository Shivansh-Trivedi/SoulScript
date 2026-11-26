from datetime import date
from typing import Literal
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.security import enforce_csrf
from app.core.config import settings
from app.core.rate_limit import limit_auth_attempts
from app.database import get_db
from app.models import User
from app.schemas import EmotionFeedbackRead, EmotionFeedbackWrite, EntryCreate, EntryListItem, EntryPage, EntryRead, EntryUpdate
from app.services.journal import create_entry, delete_entry, get_owned_entry, list_entries, update_entry
from app.services.emotion import ModelUnavailable, analyze_entry, get_prediction_history, prediction_read
from app.schemas import EmotionHistoryRead, EmotionPredictionRead
from app.services.feedback import save_feedback

router = APIRouter(prefix="/api/entries", tags=["journal"])


def validate_timezone(timezone_name: str) -> str:
    try:
        ZoneInfo(timezone_name)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Invalid IANA timezone") from exc
    return timezone_name


@router.post("", response_model=EntryRead, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    payload: EntryCreate,
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    return create_entry(db, user, title=payload.title, content=payload.content, mood=payload.self_reported_mood)


@router.get("", response_model=EntryPage)
def get_journal_entries(
    q: str | None = Query(default=None, max_length=100),
    start_date: date | None = Query(default=None, alias="from"),
    end_date: date | None = Query(default=None, alias="to"),
    timezone_name: str = Query(default="UTC", alias="timezone", max_length=64),
    sort: Literal["newest", "oldest"] = "newest",
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = Query(default=None, max_length=512),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="The start date must be on or before the end date")
    validate_timezone(timezone_name)
    try:
        return list_entries(db, user, query_text=q, start_date=start_date, end_date=end_date, timezone_name=timezone_name, sort=sort, limit=limit, cursor=cursor)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/{entry_id}", response_model=EntryRead)
def get_journal_entry(entry_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    history = get_prediction_history(db, entry)
    return {**{key: getattr(entry, key) for key in ("id", "title", "content", "self_reported_mood", "content_version", "created_at", "updated_at")}, "latest_prediction": prediction_read(history[0], entry) if history else None, "feedback": entry.feedback}


@router.post("/{entry_id}/analyze", response_model=EmotionPredictionRead)
def analyze_journal_entry(
    entry_id: UUID,
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    limit_auth_attempts(request, "emotion_analysis", maximum=settings.emotion_analysis_maximum, window_seconds=settings.emotion_analysis_window_seconds)
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    try:
        prediction = analyze_entry(db, entry)
    except ModelUnavailable as exc:
        # Deliberately avoid logging the input text or model exception details.
        raise HTTPException(status_code=503, detail="Emotion analysis is temporarily unavailable. Your entry is still saved.") from exc
    return prediction_read(prediction, entry)


@router.get("/{entry_id}/emotions", response_model=EmotionHistoryRead)
def get_journal_emotions(entry_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    history = get_prediction_history(db, entry)
    reads = [prediction_read(prediction, entry) for prediction in history]
    return {"entry_id": entry.id, "latest": reads[0] if reads else None, "history": reads}


@router.put("/{entry_id}/feedback", response_model=EmotionFeedbackRead)
def put_journal_feedback(
    entry_id: UUID,
    payload: EmotionFeedbackWrite,
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    entry = get_owned_entry(db, user, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return save_feedback(db, entry, payload.reported_emotion)


@router.patch("/{entry_id}", response_model=EntryRead)
def patch_journal_entry(
    entry_id: UUID,
    payload: EntryUpdate,
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    changes = payload.model_dump(exclude_unset=True)
    entry = update_entry(db, user, entry_id, changes)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_journal_entry(
    entry_id: UUID,
    request: Request,
    response: Response,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    if not delete_entry(db, user, entry_id):
        raise HTTPException(status_code=404, detail="Entry not found")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
