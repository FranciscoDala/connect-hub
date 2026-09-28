from pathlib import Path
import os

# 1. Lê o.env MANUALMENTE - sem dotenv, sem frescura
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

print(f"[DEBUG] Tentando ler: {ENV_PATH} - existe? {ENV_PATH.exists()}")

if ENV_PATH.exists():
    text = ENV_PATH.read_text(encoding="utf-8-sig") # utf-8-sig remove BOM do Windows
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val
            if key == "DATABASE_URL":
                print(f"[DEBUG] DATABASE_URL carregada: {val[:60]}...")

# 2. Agora importa o resto
from typing import List
import json
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 10000
    BASE_URL: str = "https://connect-backend-iern.onrender.com"
    ALLOWED_ORIGINS: str = "https://connect-uuo9.onrender.com,http://localhost:3000,http://localhost:3001"
    DATABASE_URL: str = Field(default="")
    JWT_SECRET: str = ""
    SECRET_KEY: str = ""
    ENV: str = "dev"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    @property
    def ALLOWED_ORIGINS_LIST(self) -> List[str]:
        v = self.ALLOWED_ORIGINS.strip()
        if v.startswith("["):
            return json.loads(v)
        return [i.strip() for i in v.split(",") if i.strip()]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_url(cls, v: str) -> str:
        if not v:
            v = os.getenv("DATABASE_URL", "")
        if not v:
            raise ValueError(f"DATABASE_URL vazia mesmo após ler {ENV_PATH}. Conteúdo: {ENV_PATH.read_text()[:100] if ENV_PATH.exists() else 'SEM ARQUIVO'}")
        v = v.replace("postgresql+asyncpg://", "postgresql://")
        if "psycopg2" not in v and "postgresql://" in v:
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        v = v.replace("&channel_binding=require","").replace("?channel_binding=require","?")
        if "sslmode" not in v:
            v += ("&" if "?" in v else "?") + "sslmode=require"
        return v

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
