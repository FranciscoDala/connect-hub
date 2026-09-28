from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
import uuid

class CategoryCreate(BaseModel):
    nome: str = Field(..., max_length=100)
    slug: Optional[str] = Field(None, max_length=120)
    descricao: Optional[str] = None
    cor: Optional[str] = None

class CategoryUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    cor: Optional[str] = None

class CategoryResponse(BaseModel):
    id: uuid.UUID
    nome: str
    slug: str
    descricao: Optional[str] = None
    cor: Optional[str] = None
    created_at: datetime
    class Config: from_attributes = True

class PostCreate(BaseModel):
    titulo: str = Field(..., max_length=300)
    slug: Optional[str] = None
    tipo: str = Field(default="noticia")
    descricao: Optional[str] = ""
    conteudo: Optional[str] = ""
    category_id: Optional[uuid.UUID] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: str = Field(default="published")
    destaque: bool = False
    tags: Optional[List[str]] = None

class PostUpdate(BaseModel):
    titulo: Optional[str] = None
    slug: Optional[str] = None
    tipo: Optional[str] = None
    descricao: Optional[str] = None
    conteudo: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: Optional[str] = None
    destaque: Optional[bool] = None
    tags: Optional[List[str]] = None

class PostResponse(BaseModel):
    id: uuid.UUID
    titulo: str
    slug: Optional[str] = None
    tipo: str
    descricao: str
    conteudo: str
    category_id: Optional[uuid.UUID] = None
    categoria: Optional[CategoryResponse] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: str
    destaque: bool
    tags: Optional[List[str]] = None
    author_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    class Config: from_attributes = True
