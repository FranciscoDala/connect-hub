from sqlalchemy import text
from app.db.session import engine
from app.db.base import Base

# AQUI que importa os models
import app.modules.users.models
import app.modules.categories.models
import app.modules.posts.models

print("🗑️ DROP SCHEMA...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
    conn.commit()

print("✨ CREATE ALL...")
Base.metadata.create_all(bind=engine)
print("✅ Feito")
