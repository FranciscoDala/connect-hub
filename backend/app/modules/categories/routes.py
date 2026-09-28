from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid, re
from app.db.session import get_db
from app.shared.deps import get_current_admin
from app.modules.categories.models import Category
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.nome).all()

@router.get("/{cat_id}", response_model=CategoryResponse)
def get_category(cat_id: uuid.UUID, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    return cat

@router.post("", response_model=CategoryResponse)
def create_category(data: CategoryCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    final_slug = data.slug or slugify(data.nome)
    # verifica duplicado por nome ou slug
    if db.query(Category).filter((Category.slug == final_slug) | (Category.nome == data.nome)).first():
        raise HTTPException(400, "Categoria ou slug já existe")

    cat = Category(
        nome=data.nome,
        slug=final_slug,
        descricao=data.descricao,
        cor=data.cor
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: uuid.UUID, data: CategoryUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")

    update_data = data.model_dump(exclude_unset=True)
    # se mudou nome e não mandou slug, regenera
    if "nome" in update_data and "slug" not in update_data:
        update_data["slug"] = slugify(update_data["nome"])

    for k, v in update_data.items():
        setattr(cat, k, v)

    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
def delete_category(cat_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    db.delete(cat)
    db.commit()
    return {"ok": True, "deleted": str(cat_id)}
