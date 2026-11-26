from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserSession
from app.core.security import get_current_session, get_current_user


def current_session(request: Request, db: Session = Depends(get_db)) -> UserSession:
    return get_current_session(request, db)


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    return get_current_user(request, db)
