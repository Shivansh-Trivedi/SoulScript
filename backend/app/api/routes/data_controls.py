from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import current_user
from app.core.security import clear_auth_cookies, enforce_csrf, verify_password
from app.database import get_db
from app.models import JournalEntry, User, UserPreferences, WeeklyInsight
from app.schemas import AccountDeletionConfirm

router = APIRouter(prefix="/api", tags=["privacy and data"])


def _iso(value):
    return value.isoformat() if value is not None else None


@router.post("/export")
def export_user_data(
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    preferences = db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
    entries = db.scalars(
        select(JournalEntry)
        .options(selectinload(JournalEntry.predictions), selectinload(JournalEntry.feedback))
        .where(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.asc(), JournalEntry.id.asc())
    ).all()
    insights = db.scalars(
        select(WeeklyInsight)
        .where(WeeklyInsight.user_id == user.id)
        .order_by(WeeklyInsight.week_start.asc())
    ).all()

    payload = {
        "format": "soulscript-user-data",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {"id": str(user.id), "email": user.email, "created_at": _iso(user.created_at)},
        "preferences": None if preferences is None else {
            "theme_mode": preferences.theme_mode,
            "selected_theme": preferences.selected_theme,
            "timezone": preferences.timezone,
            "updated_at": _iso(preferences.updated_at),
        },
        "journal_entries": [
            {
                "id": str(entry.id),
                "title": entry.title,
                "content": entry.content,
                "self_reported_mood": entry.self_reported_mood,
                "content_version": entry.content_version,
                "created_at": _iso(entry.created_at),
                "updated_at": _iso(entry.updated_at),
                "emotion_feedback": None if entry.feedback is None else {
                    "reported_emotion": entry.feedback.reported_emotion,
                    "created_at": _iso(entry.feedback.created_at),
                    "updated_at": _iso(entry.feedback.updated_at),
                },
                "emotion_predictions": [
                    {
                        "id": str(prediction.id),
                        "model_name": prediction.model_name,
                        "model_version": prediction.model_version,
                        "top_label": prediction.top_label,
                        "scores": prediction.scores,
                        "content_version": prediction.content_version,
                        "created_at": _iso(prediction.created_at),
                    }
                    for prediction in sorted(entry.predictions, key=lambda value: (value.created_at, str(value.id)))
                ],
            }
            for entry in entries
        ],
        "weekly_insights": [
            {
                "id": str(insight.id),
                "week_start": insight.week_start.isoformat(),
                "week_end": insight.week_end.isoformat(),
                "timezone": insight.timezone,
                "status": insight.status,
                "entry_count": insight.entry_count,
                "summary": insight.summary,
                "statistics": insight.statistics,
                "reflection_prompts": insight.reflection_prompts,
                "generated_at": _iso(insight.generated_at),
            }
            for insight in insights
        ],
    }
    return JSONResponse(
        content=payload,
        headers={"Content-Disposition": 'attachment; filename="soulscript-export.json"'},
    )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: AccountDeletionConfirm,
    request: Request,
    response: Response,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The current password is incorrect")
    db.delete(user)
    db.commit()
    clear_auth_cookies(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
