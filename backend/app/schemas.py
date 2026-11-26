import uuid
from datetime import date, datetime
from typing import Any
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.core.config import settings

EmotionLabel = Literal["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise", "other", "prefer_not_to_say"]
ThemeMode = Literal["default", "manual", "auto"]
ThemeName = Literal[
    "lavender", "sage", "ocean", "sunset",
    "mood-joy", "mood-sadness", "mood-anger", "mood-fear",
    "mood-disgust", "mood-surprise", "mood-neutral",
]
ResolvedTheme = Literal[
    "default", "lavender", "sage", "ocean", "sunset",
    "mood-joy", "mood-sadness", "mood-anger", "mood-fear",
    "mood-disgust", "mood-surprise", "mood-neutral",
]
WeeklyInsightStatus = Literal["not_generated", "ready", "insufficient_data", "stale"]


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=settings.min_password_length, max_length=settings.max_password_length)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        return value.strip().lower() if isinstance(value, str) else value


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserProfile


class EntryCreate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    content: str = Field(min_length=1, max_length=20000)
    self_reported_mood: str | None = Field(default=None, max_length=48)

    @field_validator("title", "content", "self_reported_mood", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("content")
    @classmethod
    def require_nonblank_content(cls, value: str) -> str:
        if not value:
            raise ValueError("Entry content cannot be blank")
        return value

    @field_validator("title", "self_reported_mood")
    @classmethod
    def blank_to_none(cls, value: str | None) -> str | None:
        return value or None


class EntryUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    content: str | None = Field(default=None, max_length=20000)
    self_reported_mood: str | None = Field(default=None, max_length=48)

    @field_validator("title", "content", "self_reported_mood", mode="before")
    @classmethod
    def trim_patch_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update")
        if "content" in self.model_fields_set and (self.content is None or not self.content):
            raise ValueError("Entry content cannot be blank")
        if self.title == "":
            self.title = None
        if self.self_reported_mood == "":
            self.self_reported_mood = None
        return self


class EntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str | None
    content: str
    self_reported_mood: str | None
    content_version: int
    latest_prediction: dict | None = None
    feedback: "EmotionFeedbackRead | None" = None
    created_at: datetime
    updated_at: datetime


class EmotionPredictionRead(BaseModel):
    id: uuid.UUID
    model_name: str
    model_version: str
    top_label: str
    scores: dict[str, float]
    created_at: datetime
    content_version: int
    stale: bool


class EmotionFeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reported_emotion: EmotionLabel
    created_at: datetime
    updated_at: datetime


class EmotionHistoryRead(BaseModel):
    entry_id: uuid.UUID
    latest: EmotionPredictionRead | None
    history: list[EmotionPredictionRead]


class EmotionFeedbackWrite(BaseModel):
    reported_emotion: EmotionLabel


class UserPreferencesRead(BaseModel):
    theme_mode: ThemeMode
    selected_theme: ThemeName
    timezone: str
    resolved_theme: ResolvedTheme
    latest_emotion: str | None = None
    latest_estimate: str | None = None


class UserPreferencesPatch(BaseModel):
    theme_mode: ThemeMode | None = None
    selected_theme: ThemeName | None = None
    timezone: str | None = Field(default=None, min_length=1, max_length=64)

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ValueError("Use a valid IANA timezone") from exc
        return value

    @model_validator(mode="after")
    def require_preference_change(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one preference to update")
        if any(getattr(self, field) is None for field in self.model_fields_set):
            raise ValueError("Preference values cannot be null")
        return self


class AccountDeletionConfirm(BaseModel):
    current_password: str = Field(min_length=1, max_length=settings.max_password_length)
    confirmation: Literal["DELETE MY ACCOUNT"]


class EntryListItem(BaseModel):
    id: uuid.UUID
    title: str | None
    excerpt: str
    self_reported_mood: str | None
    latest_prediction: dict | None = None
    created_at: datetime
    updated_at: datetime


class EntryPage(BaseModel):
    items: list[EntryListItem]
    next_cursor: str | None


class WeeklySupportingEntry(BaseModel):
    id: uuid.UUID
    title: str | None
    created_at: datetime


class WeeklyInsightRead(BaseModel):
    id: uuid.UUID | None
    week_start: date
    week_end: date
    timezone: str
    status: WeeklyInsightStatus
    entry_count: int
    minimum_entry_count: int
    summary: str | None
    statistics: dict[str, Any]
    reflection_prompts: list[str]
    supporting_entries: list[WeeklySupportingEntry]
    generated_at: datetime | None


class WeeklyInsightHistory(BaseModel):
    items: list[WeeklyInsightRead]
    next_before: date | None
