from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class CreateAdminIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    token: str
    email: str
    role: str
