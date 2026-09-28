import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.db.session import SessionLocal
from app.modules.auth.models import User
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

email = "admin@connect.ao"
password = "admin123" # troca depois no painel

if db.query(User).filter(User.email == email).first():
    print("Já existe")
else:
    u = User(email=email, hashed_password=pwd.hash(password), role="admin", is_active=True)
    db.add(u); db.commit()
    print(f"Admin criado: {email} / {password}")

db.close()
