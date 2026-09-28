import os
import sys
from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from alembic import context
from dotenv import load_dotenv

# 1. Carrega backend/.env ANTES de tudo
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

# 2. Faz alembic achar app/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 3. Importa Base DIRETO do arquivo, sem passar pelo __init__.py
from app.db.base import Base

# 4. IMPORTA OS MODELS REAIS DO SEU PROJETO
# Se der erro aqui, é porque a pasta não existe - me fala o nome
try:
    import app.modules.users.models
    import app.modules.posts.models
except ImportError:
    # fallback caso ainda esteja em modules/
    try:
        import app.modules.auth.models
        import app.modules.posts.models
    except:
        pass

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# --- FIX DEFINITIVO ---
_raw_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url") or ""
if not _raw_url:
    raise ValueError("DATABASE_URL não encontrada! Crie backend/.env na raiz")

# Limpa asyncpg e channel_binding e força psycopg2
_raw_url = _raw_url.replace("postgresql+asyncpg://", "postgresql://")
if "postgresql+psycopg2://" not in _raw_url:
    _raw_url = _raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)

_raw_url = _raw_url.replace("&channel_binding=require", "")
_raw_url = _raw_url.replace("?channel_binding=require", "?sslmode=require")
if "sslmode=require" not in _raw_url:
    sep = "&" if "?" in _raw_url else "?"
    _raw_url = f"{_raw_url}{sep}sslmode=require"

DATABASE_URL: str = _raw_url
config.set_main_option("sqlalchemy.url", DATABASE_URL)

def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
