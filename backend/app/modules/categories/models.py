import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    descricao = Column(String(255), nullable=True)
    cor = Column(String(20), nullable=True)  # ex: #FF5733
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relacionamento reverso
    posts = relationship("Post", back_populates="category", lazy="selectin")

    def __repr__(self):
        return f"<Category {self.nome}>"
