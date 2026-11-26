from collections import Counter
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import EmotionPrediction, JournalEntry, User, UserPreferences
from app.services.analytics import _load_entries
from app.services.emotion import content_digest

THEME_BY_EMOTION = {
    "joy": "mood-joy",
    "sadness": "mood-sadness",
    "anger": "mood-anger",
    "fear": "mood-fear",
    "disgust": "mood-disgust",
    "surprise": "mood-surprise",
    "neutral": "mood-neutral",
}
LEGACY_THEME_ALIASES = {
    "lavender": "mood-fear",
    "sage": "mood-disgust",
    "ocean": "mood-sadness",
    "sunset": "mood-joy",
}


def _current_emotion(db: Session, user: User, timezone_name: str) -> str | None:
    today = datetime.now(ZoneInfo(timezone_name)).date()
    _, predictions = _load_entries(db, user, today - timedelta(days=29), today, timezone_name)
    if not predictions:
        return None
    counts = Counter(prediction.top_label for prediction in predictions.values())
    highest = max(counts.values())
    leaders = {emotion for emotion, count in counts.items() if count == highest}
    if len(leaders) == 1:
        return next(iter(leaders))
    # When the 30-day totals tie, use the most recently analyzed entry among the leaders.
    return max(
        (prediction for entry_id, prediction in predictions.items() if prediction.top_label in leaders),
        key=lambda prediction: (prediction.created_at, prediction.id),
    ).top_label


def _latest_estimate(db: Session, user: User) -> str | None:
    rows = db.execute(
        select(EmotionPrediction, JournalEntry.content, JournalEntry.content_version)
        .join(JournalEntry, JournalEntry.id == EmotionPrediction.entry_id)
        .where(JournalEntry.user_id == user.id)
        .order_by(EmotionPrediction.created_at.desc(), EmotionPrediction.id.desc())
    )
    for prediction, content, content_version in rows:
        if prediction.content_version == content_version and prediction.content_hash == content_digest(content):
            return prediction.top_label
    return None


def _read_preferences(db: Session, user: User, preferences: UserPreferences) -> dict:
    latest_emotion = _current_emotion(db, user, preferences.timezone)
    latest_estimate = _latest_estimate(db, user)
    selected_theme = LEGACY_THEME_ALIASES.get(preferences.selected_theme, preferences.selected_theme)
    resolved_theme = (
        selected_theme if preferences.theme_mode == "manual"
        else THEME_BY_EMOTION.get(latest_emotion, "lavender") if preferences.theme_mode == "auto"
        else "default"
    )
    return {
        "theme_mode": preferences.theme_mode,
        "selected_theme": selected_theme,
        "timezone": preferences.timezone,
        "resolved_theme": resolved_theme,
        "latest_emotion": latest_emotion,
        "latest_estimate": latest_estimate,
    }


def get_preferences(db: Session, user: User) -> dict:
    preferences = db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
    if preferences is None:
        preferences = UserPreferences(user_id=user.id)
        db.add(preferences)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            preferences = db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
        db.refresh(preferences)
    return _read_preferences(db, user, preferences)


def update_preferences(db: Session, user: User, changes: dict) -> dict:
    preferences = db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
    if preferences is None:
        preferences = UserPreferences(user_id=user.id)
        db.add(preferences)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            preferences = db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
    for key, value in changes.items():
        if value is not None:
            setattr(preferences, key, value)
    db.commit()
    db.refresh(preferences)
    return _read_preferences(db, user, preferences)
