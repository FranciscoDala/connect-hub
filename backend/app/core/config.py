from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json
import os

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

    @property
    def ALLOWED_ORIGINS_LIST(self) -> List[str]:
        return parse_cors(self.ALLOWED_ORIGINS)

    DATABASE_URL: str = ""
    JWT_SECRET: str = ""
    SECRET_KEY: str = ""
    ENV: str = "dev"

    @property
    def get_secret(self) -> str:
        return self.JWT_SECRET or self.SECRET_KEY or "dev-secret-troca-em-prod-32-chars-minimo"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    def model_post_init(self, __context):
        # Normaliza URL aqui dentro - evita erro fora da classe
        if self.DATABASE_URL.startswith("postgresql+asyncpg://"):
            object.__setattr__(self, "DATABASE_URL", self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))

        # Validação só cobra 32 chars em PROD
        secret_len = len(self.get_secret)
        if self.ENV == "prod" and secret_len < 32:
            raise ValueError(f"SECRET muito curto em PROD: {secret_len} chars, mínimo 32")
        if secret_len < 8:
            raise ValueError(f"SECRET muito curto mesmo pra DEV: {secret_len} chars")

settings = Settings()
