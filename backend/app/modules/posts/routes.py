from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from app.db.session import get_db
from app.shared.deps import get_current_admin
from app.modules.posts.models import Post, Category
from app.modules.posts.schemas import (
    PostCreate, PostUpdate, PostResponse,
    CategoryCreate, CategoryResponse
)
from app.core.upload_Imagem import upload_media

router = APIRouter(prefix="/api/v1", tags=["posts"])

# ========== CATEGORIES ==========
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.nome).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    if db.query(Category).filter(Category.slug == data.slug).first():
        raise HTTPException(400, "Slug já existe")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    db.delete(cat)
    db.commit()
    return {"ok": True}

# ========== UPLOAD ==========
@router.post("/upload")
async def upload_post_media(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    """
    Sobe imagem, vídeo, áudio ou pdf para Cloudinary
    Retorna {url, type, public_id, format}
    """
    return await upload_media(file, folder="connect-hub/posts")

# ========== POSTS ==========
@router.get("/posts", response_model=List[PostResponse])
def list_posts(
    db: Session=Depends(get_db),
    tipo: Optional[str] = None,
    category_id: Optional[uuid.UUID] = None,
    status: Optional[str] = Query(None),
    q: Optional[str] = None,
    destaque: Optional[bool] = None,
    limit: int = Query(50, le=100),
    offset: int = 0
):
    query = db.query(Post)
    if tipo:
        query = query.filter(Post.tipo == tipo)
    if category_id:
        query = query.filter(Post.category_id == category_id)
    if status:
        query = query.filter(Post.status == status)
    if destaque is not None:
        query = query.filter(Post.destaque == destaque)
    if q:
        query = query.filter(Post.titulo.ilike(f"%{q}%"))
    return query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post não encontrado")
    return post

@router.post("/posts", response_model=PostResponse)
def create_post(data: PostCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = Post(**data.model_dump(), author_id=admin.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: uuid.UUID, data: PostUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post não encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return post

@router.delete("/posts/{post_id}")
def delete_post(post_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post não encontrado")
    db.delete(post)
    db.commit()
    return {"ok": True}
