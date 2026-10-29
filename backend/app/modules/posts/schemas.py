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
    client_id: Optional[str] = None

class CommentUpdate(BaseModel):
    nome: Optional[str] = None
    conteudo: Optional[str] = None

class CommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    nome: str
    conteudo: str
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

class ReactionCreate(BaseModel):
    type: str = Field(..., pattern="^(like|dislike)$")
    client_id: str = Field(..., min_length=2)

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
    link_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: str = Field(default="published")
    destaque: bool = False
    tags: Optional[List[str]] = None
    preco: Optional[float] = None
    preco_promocional: Optional[float] = None
    estoque: Optional[int] = 0
    sku: Optional[str] = None
    unidade: Optional[str] = "un"
    em_promocao: bool = False
    status_plataforma: Optional[str] = Field(default="em_desenvolvimento")
    em_utilizacao: bool = False
    # evento
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local_evento: Optional[str] = None
    cidade: Optional[str] = None
    endereco: Optional[str] = None
    link_mapa: Optional[str] = None
    link_inscricao: Optional[str] = None
    modalidade: Optional[str] = "presencial"
    capacidade: Optional[int] = 0
    organizador: Optional[str] = None
    status_evento: Optional[str] = Field(default="ativo")  # ativo | cancelado | adiado | esgotado

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
    link_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: Optional[str] = None
    destaque: Optional[bool] = None
    tags: Optional[List[str]] = None
    preco: Optional[float] = None
    preco_promocional: Optional[float] = None
    estoque: Optional[int] = None
    sku: Optional[str] = None
    unidade: Optional[str] = None
    em_promocao: Optional[bool] = None
    status_plataforma: Optional[str] = None
    em_utilizacao: Optional[bool] = None
    # evento
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local_evento: Optional[str] = None
    cidade: Optional[str] = None
    endereco: Optional[str] = None
    link_mapa: Optional[str] = None
    link_inscricao: Optional[str] = None
    modalidade: Optional[str] = None
    capacidade: Optional[int] = None
    inscritos_count: Optional[int] = None
    organizador: Optional[str] = None
    status_evento: Optional[str] = None  # ativo | cancelado | adiado | esgotado

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
    link_url: Optional[str] = None
    media_files: Optional[Any] = None
    status: str
    destaque: bool
    tags: Optional[List[str]] = None
    author_id: Optional[uuid.UUID] = None
    views: int = 0
    views_count: int = 0
    shares_count: int = 0
    shares: int = 0
    likes_count: int = 0
    dislikes_count: int = 0
    comments_count: int = 0
    preco: Optional[float] = None
    preco_promocional: Optional[float] = None
    estoque: int = 0
    sku: Optional[str] = None
    unidade: str = "un"
    em_promocao: bool = False
    status_plataforma: str = "em_desenvolvimento"
    em_utilizacao: bool = False
    # evento
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local_evento: Optional[str] = None
    cidade: Optional[str] = None
    endereco: Optional[str] = None
    link_mapa: Optional[str] = None
    link_inscricao: Optional[str] = None
    modalidade: Optional[str] = None
    capacidade: Optional[int] = None
    inscritos_count: int = 0
    organizador: Optional[str] = None
    status_evento: Optional[str] = None
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
            link_url=post.link_url,
            media_files=post.media_files,
            status=post.status,
            destaque=post.destaque,
            tags=post.tags,
            author_id=post.author_id,
            views=post.views or 0,
            views_count=post.views or 0,
            shares_count=post.shares_count or 0,
            shares=post.shares_count or 0,
            likes_count=post.likes_count or 0,
            dislikes_count=post.dislikes_count or 0,
            comments_count=comments_count,
            preco=float(post.preco) if post.preco else None,
            preco_promocional=float(post.preco_promocional) if post.preco_promocional else None,
            estoque=post.estoque or 0,
            sku=post.sku,
            unidade=post.unidade or "un",
            em_promocao=post.em_promocao or False,
            status_plataforma=post.status_plataforma or "em_desenvolvimento",
            em_utilizacao=post.em_utilizacao or False,
            data_inicio=post.data_inicio,
            data_fim=post.data_fim,
            local_evento=getattr(post, 'local_evento', None),
            cidade=getattr(post, 'cidade', None),
            endereco=getattr(post, 'endereco', None),
            link_mapa=getattr(post, 'link_mapa', None),
            link_inscricao=getattr(post, 'link_inscricao', None),
            modalidade=getattr(post, 'modalidade', None),
            capacidade=getattr(post, 'capacidade', None),
            inscritos_count=getattr(post, 'inscritos_count', 0) or 0,
            organizador=getattr(post, 'organizador', None),
            status_evento=getattr(post, 'status_evento', 'ativo') or 'ativo',
            created_at=post.created_at,
            updated_at=post.updated_at,
            published_at=post.published_at
        )
