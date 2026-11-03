from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.db.session import get_db
from app.modules.auth.models import User
from app.core.config import settings

security = HTTPBearer()
SECRET_KEY = settings.JWT_SECRET or settings.SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM


def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if not SECRET_KEY:
        raise HTTPException(500, "JWT_SECRET não configurado")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(401, "Token inválido")
    except JWTError:
        raise HTTPException(401, "Token expirado ou inválido")

    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    if str(getattr(user, "role", "")).lower() != "admin":
        raise HTTPException(403, "Acesso restrito a administradores")
    return user
