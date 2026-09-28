from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from typing import List
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cor: Mapped[str | None] = mapped_column(String(20), nullable=True) # ex: #ff0000
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    posts: Mapped[List["Post"]] = relationship(back_populates="categoria")

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # básicos
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), unique=True, index=True, nullable=True)
    tipo: Mapped[str] = mapped_column(String(50), default="noticia") # noticia, video, imagem, audio, documento
    descricao: Mapped[str] = mapped_column(Text, default="")
    conteudo: Mapped[str] = mapped_column(Text, default="")

    # categoria
    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)
    categoria: Mapped["Category | None"] = relationship(back_populates="posts")

    # media
    media_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_files: Mapped[dict | None] = mapped_column(JSONB, nullable=True) # [{url, type, size}]

    # controle
    status: Mapped[str] = mapped_column(String(20), default="published")
    destaque: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    # autor
    author_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # datas
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, server_default=func.now())
