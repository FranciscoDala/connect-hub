from pathlib import Path
import sys
import uuid

# garante que backend/ está no path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# carrega .env ANTES de importar app
from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env", override=True)

from app.db.session import SessionLocal
from app.modules.auth.models import User  # <-- corrigido
import bcrypt  # <-- usando bcrypt direto, não passlib

db = SessionLocal()

email = "franciscodala@connect.com"
password = "killermk12"

try:
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"Já existe: {email}")
        # atualiza senha se já existe
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.hashed_password = hashed
        user.role = "admin"
        user.is_active = True
        db.commit()
        print(f"✅ Senha atualizada para: {password}")
    else:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        u = User(
            id=uuid.uuid4(),
            email=email,
            name="Francisco Dala",
            hashed_password=hashed,
            role="admin",
            is_active=True,
        )
        db.add(u)
        db.commit()
        print(f"✅ Admin criado: {email} / {password}")
finally:
    db.close()
