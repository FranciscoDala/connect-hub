from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.sql import func
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.categories.models import Category

class Post(Base):
    __tablename__ = "posts"
    __table_args__ = {"extend_existing": True}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), unique=True, index=True, nullable=True)
    tipo: Mapped[str] = mapped_column(String(50), default="noticia")
    descricao: Mapped[str] = mapped_column(Text, default="")
    conteudo: Mapped[str] = mapped_column(Text, default="")

    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)
    categoria: Mapped[Category | None] = relationship(back_populates="posts")

    media_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_files: Mapped[List[dict] | None] = mapped_column(JSONB, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="published")
    destaque: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[List[str] | None] = mapped_column(JSONB, nullable=True)

    # NOVOS CONTADORES - batem com frontend
    views: Mapped[int] = mapped_column(Integer, default=0)
    shares_count: Mapped[int] = mapped_column(Integer, default=0)

    author_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, server_default=func.now())

    # relacionamento comentarios
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = {"extend_existing": True}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    post: Mapped["Post"] = relationship("Post", back_populates="comments")

    nome: Mapped[str] = mapped_column(String(120), default="Anónimo")
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
