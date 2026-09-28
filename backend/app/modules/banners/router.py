from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.shared.deps import get_current_admin
from.models import Banner, BannerPosicao
from.schemas import BannerCreate, BannerUpdate, BannerResponse

router = APIRouter(prefix="/api/v1/banners", tags=["Banners"])

@router.get("", response_model=List[BannerResponse])
def list_banners(
    posicao: Optional[BannerPosicao] = None,
    ativo: Optional[bool] = None,
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db)
):
    q = db.query(Banner)
    if posicao:
        q = q.filter(Banner.posicao == posicao)
    if ativo is not None:
        q = q.filter(Banner.ativo == ativo)
    return q.order_by(Banner.created_at.desc()).limit(limit).all()

@router.get("/{banner_id}", response_model=BannerResponse)
def get_banner(banner_id: UUID, db: Session = Depends(get_db)):
    b = db.query(Banner).filter(Banner.id == banner_id).first()
    if not b:
        raise HTTPException(404, "Banner não encontrado")
    return b

@router.post("", response_model=BannerResponse)
def create_banner(data: BannerCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    b = Banner(**data.model_dump())
    # garante defaults
    if b.views is None:
        b.views = 0
    if b.clicks is None:
        b.clicks = 0
    db.add(b)
    db.commit()
    db.refresh(b)
    return b

@router.put("/{banner_id}", response_model=BannerResponse)
def update_banner(banner_id: UUID, data: BannerUpdate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    b = db.query(Banner).filter(Banner.id == banner_id).first()
    if not b:
        raise HTTPException(404, "Banner não encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.commit()
    db.refresh(b)
    return b

@router.delete("/{banner_id}")
def delete_banner(banner_id: UUID, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    b = db.query(Banner).filter(Banner.id == banner_id).first()
    if not b:
        raise HTTPException(404, "Banner não encontrado")
    db.delete(b)
    db.commit()
    return {"ok": True, "deleted": str(banner_id)}

# ========== MÉTRICAS - PÚBLICO (sem admin) ==========
@router.post("/{banner_id}/view")
def add_view(banner_id: UUID, db: Session = Depends(get_db)):
    b = db.query(Banner).filter(Banner.id == banner_id).first()
    if not b:
        raise HTTPException(404, "Banner não encontrado")
    b.views = (b.views or 0) + 1
    db.commit()
    return {"ok": True, "views": b.views}

@router.post("/{banner_id}/click")
def add_click(banner_id: UUID, db: Session = Depends(get_db)):
    b = db.query(Banner).filter(Banner.id == banner_id).first()
    if not b:
        raise HTTPException(404, "Banner não encontrado")
    b.clicks = (b.clicks or 0) + 1
    db.commit()
    return {"ok": True, "clicks": b.clicks}

# alias pra frontend que já chama /views e /clicks
@router.post("/{banner_id}/views")
def add_view_alias(banner_id: UUID, db: Session = Depends(get_db)):
    return add_view(banner_id, db)

@router.post("/{banner_id}/clicks")
def add_click_alias(banner_id: UUID, db: Session = Depends(get_db)):
    return add_click(banner_id, db)
