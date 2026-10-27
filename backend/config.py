from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Default to PostgreSQL, with support for sqlite in lightweight automated unit tests
    DATABASE_URL: str = "postgresql+psycopg2://flashguard:flashguard@localhost:5432/flashguard"

    # Redis Distributed Inventory Cache & Atomic Locking
    REDIS_URL: str = "redis://localhost:6379/0"
    RESERVATION_TTL_SECONDS: int = 600  # 10-minute inventory reservation hold window

    # CORS origins
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"

    API_V1_PREFIX: str = "/api/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
