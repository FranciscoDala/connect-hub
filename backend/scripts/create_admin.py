import os, sys
from dotenv import load_dotenv

# carrega .env antes de importar session
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

sys.path.append(os.path.dirname(__file__))

from app.db.session import SessionLocal
from app.modules.users.models import User
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

email = "admin@connect.ao"
password = "admin123"

user = db.query(User).filter(User.email == email).first()
if user:
    print(f"Já existe: {email}")
else:
    # Se seu User tem role, descomenta a linha de baixo
    # Se não tem, usa só is_active
    u = User(
        email=email,
        name="Admin",
        hashed_password=pwd.hash(password),
        is_active=True,
        # role="admin",  # <-- só se você adicionou essa coluna
    )
    # Se tiver is_superuser no seu model:
    # u.is_superuser = True

    db.add(u)
    db.commit()
    print(f"Admin criado: {email} / {password}")

db.close()
