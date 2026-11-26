import hashlib
import secrets
from datetime import timedelta

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import User, UserSession, utc_now

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hasher.verify(hashed, password)
    except (InvalidHashError, VerificationError, VerifyMismatchError):
        return False


def new_opaque_token() -> str:
    return secrets.token_urlsafe(32)


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(db: Session, user: User) -> tuple[str, UserSession]:
    raw_token = new_opaque_token()
    session = UserSession(
        user_id=user.id,
        token_hash=token_digest(raw_token),
        expires_at=utc_now() + timedelta(hours=settings.session_ttl_hours),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return raw_token, session


def set_auth_cookies(response, session_token: str) -> str:
    csrf_token = new_opaque_token()
    max_age = settings.session_ttl_hours * 60 * 60
    cookie_options = {"max_age": max_age, "path": "/", "secure": settings.secure_cookies, "samesite": "lax"}
    response.set_cookie(settings.session_cookie_name, session_token, httponly=True, **cookie_options)
    response.set_cookie(settings.csrf_cookie_name, csrf_token, httponly=False, **cookie_options)
    return csrf_token


def clear_auth_cookies(response) -> None:
    response.delete_cookie(settings.session_cookie_name, path="/", secure=settings.secure_cookies, httponly=True, samesite="lax")
    response.delete_cookie(settings.csrf_cookie_name, path="/", secure=settings.secure_cookies, httponly=False, samesite="lax")


def enforce_allowed_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in settings.allowed_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Request origin is not allowed")


def enforce_csrf(request: Request) -> None:
    enforce_allowed_origin(request)
    cookie_token = request.cookies.get(settings.csrf_cookie_name)
    header_token = request.headers.get("x-csrf-token")
    if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")


def get_current_session(request: Request, db: Session) -> UserSession:
    raw_token = request.cookies.get(settings.session_cookie_name)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    session = db.scalar(select(UserSession).where(UserSession.token_hash == token_digest(raw_token)))
    expires_at = session.expires_at if session else None
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=utc_now().tzinfo)
    if session is None or session.revoked_at is not None or expires_at <= utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return session


def get_current_user(request: Request, db: Session) -> User:
    session = get_current_session(request, db)
    user = db.get(User, session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    request.state.auth_session = session
    return user
