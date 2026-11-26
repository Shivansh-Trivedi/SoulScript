"""Local inference adapter and persistence helpers for emotion analysis."""

import hashlib
from threading import Lock

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import EmotionPrediction, JournalEntry
from app.models import utc_now
from app.services.weekly_insights import invalidate_weekly_insights

_pipeline = None
_pipeline_lock = Lock()


class ModelUnavailable(Exception):
    """The model could not be loaded or did not return valid output."""


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        with _pipeline_lock:
            if _pipeline is None:
                try:
                    from transformers import pipeline

                    _pipeline = pipeline(
                        "text-classification",
                        model=settings.emotion_model_id,
                        revision=settings.emotion_model_revision,
                        top_k=None,
                        truncation=True,
                        max_length=512,
                        device=-1,
                    )
                except Exception as exc:
                    raise ModelUnavailable from exc
    return _pipeline


def infer_emotions(text: str) -> dict[str, float]:
    """Return all model scores. Never log or include source text in failures."""
    try:
        results = _get_pipeline()(text)
        if results and isinstance(results[0], list):
            results = results[0]
        scores = {str(item["label"]).lower(): float(item["score"]) for item in results}
        if not scores or any(not 0 <= score <= 1 for score in scores.values()):
            raise ValueError("Invalid model output")
        return scores
    except ModelUnavailable:
        raise
    except Exception as exc:
        raise ModelUnavailable from exc


def content_digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def prediction_read(prediction: EmotionPrediction, entry: JournalEntry) -> dict:
    stale = prediction.content_version != entry.content_version or prediction.content_hash != content_digest(entry.content)
    return {
        "id": prediction.id,
        "model_name": prediction.model_name,
        "model_version": prediction.model_version,
        "top_label": prediction.top_label,
        "scores": prediction.scores,
        "created_at": prediction.created_at,
        "content_version": prediction.content_version,
        "stale": stale,
    }


def analyze_entry(db: Session, entry: JournalEntry) -> EmotionPrediction:
    scores = infer_emotions(entry.content)
    prediction = EmotionPrediction(
        entry_id=entry.id,
        model_name=settings.emotion_model_id,
        model_version=settings.emotion_model_revision,
        content_hash=content_digest(entry.content),
        content_version=entry.content_version,
        top_label=max(scores, key=scores.get),
        scores=scores,
        created_at=utc_now(),
    )
    db.add(prediction)
    invalidate_weekly_insights(db, entry)
    db.commit()
    db.refresh(prediction)
    return prediction


def get_prediction_history(db: Session, entry: JournalEntry) -> list[EmotionPrediction]:
    return list(db.scalars(
        select(EmotionPrediction)
        .where(EmotionPrediction.entry_id == entry.id)
        .order_by(EmotionPrediction.created_at.desc(), EmotionPrediction.id.desc())
    ).all())
