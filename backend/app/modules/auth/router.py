from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from app.db.session import get_db
from app.modules.auth.models import User
from app.modules.auth.schemas import LoginIn, TokenOut
from app.core.config import settings # usa o settings central

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
EXPIRE_HOURS = 12

# pega do settings, já vem tipado como str
SECRET_KEY: str = settings.JWT_SECRET
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET não definido no .env")

def create_token(user: User):
    payload = {
        "sub": str(user.email),
        "role": str(user.role),
        "exp": datetime.utcnow() + timedelta(hours=EXPIRE_HOURS)
    }
    # agora SECRET_KEY é garantido str
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.is_active:
        raise HTTPException(401, "Credenciais inválidas")
    if not pwd_context.verify(data.password, str(user.hashed_password)):
        raise HTTPException(401, "Credenciais inválidas")

    token = create_token(user)
    return {"token": token, "email": str(user.email), "role": str(user.role)}
