from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# não cria na importação, cria sob demanda
_engine = None
_SessionLocal = None

def get_engine():
    global _engine
    if _engine is None:
        db_url = settings.DATABASE_URL
        if not db_url:
            raise ValueError("DATABASE_URL vazia - verifica backend/.env na raiz")
        if db_url.startswith("postgresql+asyncpg://"):
            db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
        if "psycopg2" not in db_url and "postgresql://" in db_url:
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        _engine = create_engine(db_url, pool_pre_ping=True)
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# compatibilidade - pra quem importa engine direto
engine = property(lambda self: get_engine())
SessionLocal = get_session_local()

def get_db():
    Session = get_session_local()
    db = Session()
    try:
        yield db
    finally:
        db.close()

# Pra alembic ainda conseguir engine = ...
# cria de verdade aqui mas só se tiver URL
try:
    if settings.DATABASE_URL:
        engine = get_engine()
        SessionLocal = get_session_local()
    else:
        engine = None
        SessionLocal = None
except:
    engine = None
    SessionLocal = None
