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

class CommentCreate(BaseModel):
    nome: Optional[str] = "Anónimo"
    conteudo: str

class CommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    nome: str
    conteudo: str
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

    # campos que o frontend espera
    views: int = 0
    views_count: int = 0
    shares_count: int = 0
    shares: int = 0
    comments_count: int = 0

    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config: from_attributes = True

    @classmethod
    def from_orm_with_counts(cls, post, comments_count: int = 0):
        return cls(
            id=post.id,
            titulo=post.titulo,
            slug=post.slug,
            tipo=post.tipo,
            descricao=post.descricao,
            conteudo=post.conteudo,
            category_id=post.category_id,
            categoria=post.categoria,
            media_url=post.media_url,
            media_type=post.media_type,
            thumbnail_url=post.thumbnail_url,
            media_files=post.media_files,
            status=post.status,
            destaque=post.destaque,
            tags=post.tags,
            author_id=post.author_id,
            views=post.views or 0,
            views_count=post.views or 0,
            shares_count=post.shares_count or 0,
            shares=post.shares_count or 0,
            comments_count=comments_count,
            created_at=post.created_at,
            updated_at=post.updated_at,
            published_at=post.published_at
        )
