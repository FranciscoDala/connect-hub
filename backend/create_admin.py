from pathlib import Path
import sys

# garante que backend/ está no path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# carrega.env ANTES de importar app
from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env", override=True)

from app.db.session import SessionLocal
from app.modules.users.models import User
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

email = "admin@connect.ao"
password = "admin123"

try:
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"Já existe: {email}")
    else:
        u = User(
            email=email,
            name="Admin",
            hashed_password=pwd.hash(password),
            is_active=True,
        )
        db.add(u)
        db.commit()
        print(f"✅ Admin criado: {email} / {password}")
finally:
    db.close()
