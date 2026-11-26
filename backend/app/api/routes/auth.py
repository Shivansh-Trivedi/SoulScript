from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import current_session, current_user
from app.core.rate_limit import limit_auth_attempts
from app.core.security import (
    clear_auth_cookies,
    create_session,
    enforce_allowed_origin,
    enforce_csrf,
    hash_password,
    set_auth_cookies,
    verify_password,
)
from app.database import get_db
from app.models import User, UserSession
from app.schemas import AuthResponse, Credentials, UserProfile

router = APIRouter(prefix="/api", tags=["authentication"])


@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: Credentials, request: Request, response: Response, db: Session = Depends(get_db)):
    enforce_allowed_origin(request)
    limit_auth_attempts(request, "register", maximum=5, window_seconds=3600)
    email = str(payload.email).strip().lower()
    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    raw_session_token, _ = create_session(db, user)
    csrf_token = set_auth_cookies(response, raw_session_token)
    response.headers["X-CSRF-Token"] = csrf_token
    return AuthResponse(user=UserProfile.model_validate(user))


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: Credentials, request: Request, response: Response, db: Session = Depends(get_db)):
    enforce_allowed_origin(request)
    limit_auth_attempts(request, "login", maximum=10, window_seconds=900)
    email = str(payload.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    raw_session_token, _ = create_session(db, user)
    csrf_token = set_auth_cookies(response, raw_session_token)
    response.headers["X-CSRF-Token"] = csrf_token
    return AuthResponse(user=UserProfile.model_validate(user))


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    session: UserSession = Depends(current_session),
    db: Session = Depends(get_db),
):
    enforce_csrf(request)
    session.revoked_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()
    clear_auth_cookies(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserProfile)
def me(user: User = Depends(current_user)):
    return user
