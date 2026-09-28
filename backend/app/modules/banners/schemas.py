from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from.models import BannerPosicao

class BannerCreate(BaseModel):
    titulo: str
    imagem_url: str
    link_url: Optional[str] = None
    posicao: BannerPosicao = BannerPosicao.home_topo
    ativo: bool = True
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None

    @field_validator('data_inicio', 'data_fim', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "" or v == "": return None
        return v

class BannerUpdate(BaseModel):
    titulo: Optional[str] = None
    imagem_url: Optional[str] = None
    link_url: Optional[str] = None
    posicao: Optional[BannerPosicao] = None
    ativo: Optional[bool] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None

    @field_validator('data_inicio', 'data_fim', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "" or v == "": return None
        return v

class BannerResponse(BaseModel):
    id: UUID
    titulo: str
    imagem_url: str
    link_url: Optional[str] = None
    posicao: BannerPosicao
    ativo: bool
    views: int
    clicks: int
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True
