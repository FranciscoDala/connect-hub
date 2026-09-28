from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid, re

from app.db.session import get_db
from app.shared.deps import get_current_admin
from app.modules.posts.models import Post, Comment
from app.modules.categories.models import Category
from app.modules.posts.schemas import (
    PostCreate, PostUpdate, PostResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    CommentCreate, CommentResponse
)
from app.core.upload_Imagem import upload_media

router = APIRouter(prefix="/api/v1", tags=["posts"])

def slugify(text: str) -> str:
    text = text.lower()
    # remove acentos simples para URL limpa
    text = re.sub(r'[áàâãä]', 'a', text)
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[íìîï]', 'i', text)
    text = re.sub(r'[óòôõö]', 'o', text)
    text = re.sub(r'[úùûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def to_post_response(post: Post, db: Session):
    count = db.query(Comment).filter(Comment.post_id == post.id).count()
    data = PostResponse.from_orm_with_counts(post, comments_count=count)
    return data

# ========== CATEGORIES ==========
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.nome).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    final_slug = data.slug or slugify(data.nome)
    if db.query(Category).filter(Category.slug == final_slug).first():
        raise HTTPException(400, "Slug já existe")
    cat = Category(nome=data.nome, slug=final_slug, descricao=data.descricao, cor=data.cor)
    db.add(cat); db.commit(); db.refresh(cat)
    return cat

@router.put("/categories/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: uuid.UUID, data: CategoryUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat: raise HTTPException(404, "Categoria não encontrada")
    for k, v in data.model_dump(exclude_unset=True).items():
        if v is not None: setattr(cat, k, v)
    if data.nome and not data.slug: cat.slug = slugify(data.nome)
    db.commit(); db.refresh(cat)
    return cat

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat: raise HTTPException(404, "Categoria não encontrada")
    db.delete(cat); db.commit()
    return {"ok": True}

# ========== UPLOAD ==========
@router.post("/upload")
async def upload_post_media(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    return await upload_media(file, folder="connect-hub/posts")

# ========== POSTS - LISTAGEM ==========
@router.get("/posts", response_model=List[PostResponse])
def list_posts(
    db: Session=Depends(get_db),
    tipo: Optional[str]=None,
    category_id: Optional[uuid.UUID]=None,
    status: Optional[str]=Query(None),
    q: Optional[str]=None,
    destaque: Optional[bool]=None,
    limit: int=Query(50, le=100),
    offset: int=0
):
    query = db.query(Post)
    if tipo: query = query.filter(Post.tipo == tipo)
    if category_id: query = query.filter(Post.category_id == category_id)
    if status: query = query.filter(Post.status == status)
    if destaque is not None: query = query.filter(Post.destaque == destaque)
    if q: query = query.filter(Post.titulo.ilike(f"%{q}%"))
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return [to_post_response(p, db) for p in posts]

# ========== POSTS - POR SLUG (TEM QUE VIR ANTES DO {post_id}) ==========
@router.get("/posts/slug/{slug}", response_model=PostResponse)
def get_post_by_slug(slug: str, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        # tenta sem acento ou id curto
        post = db.query(Post).filter(Post.slug.ilike(f"%{slug}%")).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    return to_post_response(post, db)

# ========== POSTS - POR ID ==========
@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    return to_post_response(post, db)

@router.post("/posts", response_model=PostResponse)
def create_post(data: PostCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    final_slug = data.slug or slugify(data.titulo)
    if db.query(Post).filter(Post.slug == final_slug).first():
        final_slug = f"{final_slug}-{uuid.uuid4().hex[:4]}"
    post = Post(**data.model_dump(exclude={"slug"}), slug=final_slug, author_id=admin.id)
    db.add(post); db.commit(); db.refresh(post)
    return to_post_response(post, db)

@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: uuid.UUID, data: PostUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    payload = data.model_dump(exclude_unset=True)
    # se mudar título e não mandar slug, regenera
    if "titulo" in payload and not payload.get("slug"):
        payload["slug"] = slugify(payload["titulo"])
    for k, v in payload.items():
        setattr(post, k, v)
    db.commit(); db.refresh(post)
    return to_post_response(post, db)

@router.delete("/posts/{post_id}")
def delete_post(post_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    db.delete(post); db.commit()
    return {"ok": True}

# ========== VIEWS & SHARES - PÚBLICO ==========
@router.post("/posts/{post_id}/view")
def add_view(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.views = (post.views or 0) + 1
    db.commit()
    return {"views": post.views}

# alias pra compatibilidade com frontend antigo
@router.post("/posts/{post_id}/views")
def add_views_alias(post_id: uuid.UUID, db: Session=Depends(get_db)):
    return add_view(post_id, db)

@router.post("/posts/{post_id}/share")
def add_share(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.shares_count = (post.shares_count or 0) + 1
    db.commit()
    return {"shares_count": post.shares_count}

# view por slug também (usado pela page nova)
@router.post("/posts/slug/{slug}/view")
def add_view_by_slug(slug: str, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.views = (post.views or 0) + 1
    db.commit()
    return {"views": post.views}

# ========== COMMENTS ==========
@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def list_comments(post_id: uuid.UUID, db: Session=Depends(get_db)):
    return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(post_id: uuid.UUID, data: CommentCreate, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    c = Comment(post_id=post_id, nome=data.nome or "Anónimo", conteudo=data.conteudo)
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c: raise HTTPException(404, "Comentário não encontrado")
    db.delete(c); db.commit()
    return {"ok": True}
