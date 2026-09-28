from pathlib import Path
from typing import List
import os
import json
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Tenta achar backend/.env de qualquer lugar que você rodar
CURRENT_FILE = Path(__file__).resolve()
POSSIBLE_ENVS = [
    CURRENT_FILE.parent.parent.parent / ".env", # backend/.env
    CURRENT_FILE.parent.parent / ".env", # app/.env
    Path.cwd() / ".env", #./.env
    Path.cwd() / "backend" / ".env", #./backend/.env
]

ENV_FILE = None
for p in POSSIBLE_ENVS:
    if p.exists():
        ENV_FILE = p
        load_dotenv(str(p), override=True)
        break

# fallback: carrega.env do cwd também
load_dotenv(override=True)

def parse_cors(v: str) -> List[str]:
    if not v:
        return []
    v = v.strip()
    if v.startswith("["):
        return json.loads(v)
    return [i.strip() for i in v.split(",") if i.strip()]

class Settings(BaseSettings):
    PORT: int = 10000
    BASE_URL: str = "https://connect-backend-iern.onrender.com"
    ALLOWED_ORIGINS: str = "https://connect-uuo9.onrender.com,http://localhost:3000,http://localhost:3001,http://localhost:8000"

    DATABASE_URL: str = "" # deixa vazio pra não quebrar na importação
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
        return parse_cors(self.ALLOWED_ORIGINS)

    @property
    def get_secret(self) -> str:
        return self.JWT_SECRET or self.SECRET_KEY or "dev-secret-troca-em-prod-32-chars-minimo"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        # se veio vazio do.env, tenta pegar do os.getenv
        if not v:
            v = os.getenv("DATABASE_URL", "")
        if not v:
            # erro com caminho exato onde procurou
            tried = ", ".join(str(p) for p in POSSIBLE_ENVS)
            raise ValueError(f"DATABASE_URL vazia. Procurei em: {tried}. Cria um.env com DATABASE_URL")

        v = v.replace("postgresql+asyncpg://", "postgresql://")
        if "postgresql+psycopg2://" not in v and v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        v = v.replace("&channel_binding=require", "").replace("?channel_binding=require", "?")
        v = v.replace("?channel_binding=require", "").replace("&&", "&")
        if "sslmode=require" not in v:
            v += ("&" if "?" in v else "?") + "sslmode=require"
        return v

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

settings = Settings()
