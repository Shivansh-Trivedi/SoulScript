from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.security import enforce_csrf
from app.database import get_db
from app.models import User
from app.schemas import UserPreferencesPatch, UserPreferencesRead
from app.services.preferences import get_preferences, update_preferences

router = APIRouter(prefix="/api/preferences", tags=["preferences"])


@router.get("", response_model=UserPreferencesRead)
def read_preferences(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return get_preferences(db, user)


@router.patch("", response_model=UserPreferencesRead)
def patch_preferences(
    payload: UserPreferencesPatch,
    request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    return update_preferences(db, user, payload.model_dump(exclude_unset=True))
