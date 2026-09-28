from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid, re
from app.db.session import get_db
from app.shared.deps import get_current_admin
from app.modules.categories.models import Category
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.modules.posts.models import Post
from app.modules.posts.schemas import PostResponse

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[áàâãä]', 'a', text)
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[íìîï]', 'i', text)
    text = re.sub(r'[óòôõö]', 'o', text)
    text = re.sub(r'[úùûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def to_post_response(post: Post, db: Session):
    from app.modules.posts.models import Comment
    count = db.query(Comment).filter(Comment.post_id == post.id).count()
    return PostResponse.from_orm_with_counts(post, comments_count=count)

@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.nome).all()

# TEM QUE VIR ANTES DO {cat_id} - SENÃO DÁ 422
@router.get("/slug/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        cat = db.query(Category).filter(Category.slug.ilike(f"%{slug}%")).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    return cat

@router.get("/slug/{slug}/posts", response_model=List[PostResponse])
def list_posts_by_category_slug(slug: str, db: Session = Depends(get_db), limit: int = Query(50, le=100), offset: int = 0, status: Optional[str] = "published"):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    query = db.query(Post).filter(Post.category_id == cat.id)
    if status:
        query = query.filter(Post.status == status)
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return [to_post_response(p, db) for p in posts]

@router.get("/{cat_id}", response_model=CategoryResponse)
def get_category(cat_id: uuid.UUID, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    return cat

@router.post("", response_model=CategoryResponse)
def create_category(data: CategoryCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    final_slug = data.slug or slugify(data.nome)
    if db.query(Category).filter((Category.slug == final_slug) | (Category.nome == data.nome)).first():
        raise HTTPException(400, "Categoria ou slug já existe")
    cat = Category(nome=data.nome, slug=final_slug, descricao=data.descricao, cor=data.cor)
    db.add(cat); db.commit(); db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: uuid.UUID, data: CategoryUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    update_data = data.model_dump(exclude_unset=True)
    if "nome" in update_data and "slug" not in update_data:
        update_data["slug"] = slugify(update_data["nome"])
    for k, v in update_data.items():
        setattr(cat, k, v)
    db.commit(); db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
def delete_category(cat_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    db.delete(cat); db.commit()
    return {"ok": True, "deleted": str(cat_id)}
