import uuid
import enum
from datetime import datetime
from uuid import UUID as PyUUID
from sqlalchemy import String, Boolean, Integer, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class BannerPosicao(str, enum.Enum):
    home_topo = "home_topo"
    home_meio = "home_meio"
    sidebar = "sidebar"
    dentro_post = "dentro_post"
    footer = "footer"

class Banner(Base):
    __tablename__ = "banners"
    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    imagem_url: Mapped[str] = mapped_column(String(500), nullable=False)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    posicao: Mapped[BannerPosicao] = mapped_column(SAEnum(BannerPosicao), nullable=False, default=BannerPosicao.home_topo)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    views: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    data_inicio: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    data_fim: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
