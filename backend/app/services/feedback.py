from sqlalchemy.orm import Session

from app.models import EmotionFeedback, JournalEntry, utc_now
from app.services.weekly_insights import invalidate_weekly_insights


def save_feedback(db: Session, entry: JournalEntry, reported_emotion: str) -> EmotionFeedback:
    feedback = entry.feedback
    if feedback is None:
        feedback = EmotionFeedback(entry_id=entry.id, reported_emotion=reported_emotion)
    else:
        feedback.reported_emotion = reported_emotion
        feedback.updated_at = utc_now()
    db.add(feedback)
    invalidate_weekly_insights(db, entry)
    db.commit()
    db.refresh(feedback)
    return feedback
