from datetime import date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.security import enforce_csrf
from app.database import get_db
from app.models import User
from app.schemas import WeeklyInsightHistory, WeeklyInsightRead
from app.services.preferences import get_preferences
from app.services.weekly_insights import generate_weekly_insight, get_insight_history, get_weekly_insight

router = APIRouter(prefix="/api/insights", tags=["weekly insights"])


def _timezone(user: User, db: Session, timezone_name: str | None) -> str:
    if timezone_name is None:
        return get_preferences(db, user)["timezone"]
    try:
        ZoneInfo(timezone_name)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Invalid IANA timezone") from exc
    return timezone_name


def _week_of(timezone_name: str, week_of: date | None) -> date:
    return week_of or datetime.now(ZoneInfo(timezone_name)).date()


@router.get("/weekly", response_model=WeeklyInsightRead)
def read_weekly_insight(
    week_of: date | None = Query(default=None),
    timezone_name: str | None = Query(default=None, alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    timezone_name = _timezone(user, db, timezone_name)
    return get_weekly_insight(db, user, _week_of(timezone_name, week_of), timezone_name)


@router.post("/weekly/generate", response_model=WeeklyInsightRead)
def post_weekly_insight(
    request: Request,
    week_of: date | None = Query(default=None),
    timezone_name: str | None = Query(default=None, alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    timezone_name = _timezone(user, db, timezone_name)
    return generate_weekly_insight(db, user, _week_of(timezone_name, week_of), timezone_name)


@router.get("/history", response_model=WeeklyInsightHistory)
def read_insight_history(
    limit: int = Query(default=12, ge=1, le=52),
    before: date | None = Query(default=None),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    return get_insight_history(db, user, limit, before)
