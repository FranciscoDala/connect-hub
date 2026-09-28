from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CategoryCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = Field(None, max_length=120, description="Se vazio, gera do nome")
    descricao: Optional[str] = Field(None, max_length=255)
    cor: Optional[str] = Field(default="#7c3aed", description="Hex color")

class CategoryUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=100)
    slug: Optional[str] = Field(None, max_length=120)
    descricao: Optional[str] = None
    cor: Optional[str] = None

class CategoryResponse(BaseModel):
    id: uuid.UUID
    nome: str
    slug: str
    descricao: Optional[str] = None
    cor: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
