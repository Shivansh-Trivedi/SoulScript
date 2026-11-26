from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.database import get_db
from app.models import User
from app.services.analytics import journal_activity, mood_distribution, mood_trends, prediction_comparison

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _validate_range(start_date: date | None, end_date: date | None, timezone_name: str) -> tuple[date, date]:
    try:
        zone = ZoneInfo(timezone_name)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Invalid IANA timezone") from exc
    today = datetime.now(zone).date()
    last = end_date or today
    first = start_date or (last - timedelta(days=29))
    if first > last:
        raise HTTPException(status_code=422, detail="The start date must be on or before the end date")
    if (last - first).days > 365:
        raise HTTPException(status_code=422, detail="Analytics date ranges are limited to 366 days")
    return first, last


@router.get("/moods")
def get_mood_distribution(
    start_date: date | None = Query(default=None, alias="from"),
    end_date: date | None = Query(default=None, alias="to"),
    timezone_name: str = Query(default="UTC", alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    first, last = _validate_range(start_date, end_date, timezone_name)
    return mood_distribution(db, user, first, last, timezone_name)


@router.get("/trends")
def get_mood_trends(
    start_date: date | None = Query(default=None, alias="from"),
    end_date: date | None = Query(default=None, alias="to"),
    timezone_name: str = Query(default="UTC", alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    first, last = _validate_range(start_date, end_date, timezone_name)
    return mood_trends(db, user, first, last, timezone_name)


@router.get("/activity")
def get_journal_activity(
    start_date: date | None = Query(default=None, alias="from"),
    end_date: date | None = Query(default=None, alias="to"),
    timezone_name: str = Query(default="UTC", alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    first, last = _validate_range(start_date, end_date, timezone_name)
    return journal_activity(db, user, first, last, timezone_name)


@router.get("/comparison")
def get_prediction_comparison(
    start_date: date | None = Query(default=None, alias="from"),
    end_date: date | None = Query(default=None, alias="to"),
    timezone_name: str = Query(default="UTC", alias="timezone", max_length=64),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    first, last = _validate_range(start_date, end_date, timezone_name)
    return prediction_comparison(db, user, first, last, timezone_name)
