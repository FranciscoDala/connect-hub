from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    APP_NAME: str = "Connect Hub API"
    DATABASE_URL: str = "sqlite:///./connect.db"
    SECRET_KEY: str = "troca-essa-chave-muito-secreta-123"
    class Config:
        env_file = ".env"
settings = Settings()
