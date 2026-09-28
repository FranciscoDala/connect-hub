from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Importa models para o Alembic enxergar - ORDEM IMPORTA
# se falhar, o erro aparece na hora, não silencioso
import app.modules.users.models # noqa: F401
import app.modules.categories.models # noqa: F401
import app.modules.posts.models # noqa: F401
