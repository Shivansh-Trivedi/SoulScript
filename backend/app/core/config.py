from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://soulscript:soulscript@localhost:5432/soulscript"
    app_env: str = "development"
    frontend_origin: str = "http://127.0.0.1:5173"
    session_cookie_name: str = "soulscript_session"
    csrf_cookie_name: str = "soulscript_csrf"
    session_ttl_hours: int = 336
    min_password_length: int = 12
    max_password_length: int = 128
    emotion_model_id: str = "j-hartmann/emotion-english-distilroberta-base"
    emotion_model_revision: str = "0e1cd914e3d46199ed785853e12b57304e04178b"
    emotion_analysis_maximum: int = 10
    emotion_analysis_window_seconds: int = 3600
    weekly_insight_min_entries: int = Field(default=3, ge=1, le=100)

    @property
    def secure_cookies(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_origin.rstrip("/")]
        if self.app_env.lower() != "production":
            for origin in (
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
            ):
                if origin not in origins:
                    origins.append(origin)
        return origins

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

