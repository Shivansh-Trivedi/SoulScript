import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, String, Text, Uuid, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    sessions: Mapped[list["UserSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    entries: Mapped[list["JournalEntry"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped["UserPreferences | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    weekly_insights: Mapped[list["WeeklyInsight"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user: Mapped[User] = relationship(back_populates="sessions")


class JournalEntry(Base):
    __tablename__ = "journal_entries"
    __table_args__ = (Index("ix_entries_user_created_at", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    self_reported_mood: Mapped[str | None] = mapped_column(String(48), nullable=True)
    content_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    predictions: Mapped[list["EmotionPrediction"]] = relationship(back_populates="entry", cascade="all, delete-orphan", order_by="EmotionPrediction.created_at")
    feedback: Mapped["EmotionFeedback | None"] = relationship(back_populates="entry", cascade="all, delete-orphan", uselist=False)
    user: Mapped[User] = relationship(back_populates="entries")


class EmotionPrediction(Base):
    __tablename__ = "emotion_predictions"
    __table_args__ = (Index("ix_predictions_entry_created_at", "entry_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), index=True, nullable=False)
    model_name: Mapped[str] = mapped_column(String(180), nullable=False)
    model_version: Mapped[str] = mapped_column(String(120), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    content_version: Mapped[int] = mapped_column(Integer, nullable=False)
    top_label: Mapped[str] = mapped_column(String(48), nullable=False)
    scores: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    entry: Mapped[JournalEntry] = relationship(back_populates="predictions")


class EmotionFeedback(Base):
    __tablename__ = "emotion_feedback"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), unique=True, nullable=False)
    reported_emotion: Mapped[str] = mapped_column(String(48), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    entry: Mapped[JournalEntry] = relationship(back_populates="feedback")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme_mode: Mapped[str] = mapped_column(String(16), default="default", nullable=False)
    selected_theme: Mapped[str] = mapped_column(String(24), default="lavender", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    user: Mapped[User] = relationship(back_populates="preferences")


class WeeklyInsight(Base):
    __tablename__ = "weekly_insights"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_weekly_insights_user_week"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    week_end: Mapped[date] = mapped_column(Date, nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    statistics: Mapped[dict] = mapped_column(JSON, nullable=False)
    reflection_prompts: Mapped[list] = mapped_column(JSON, nullable=False)
    source_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    source_entry_ids: Mapped[list] = mapped_column(JSON, nullable=False)
    entry_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    user: Mapped[User] = relationship(back_populates="weekly_insights")
