from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import uuid, re

from app.db.session import get_db
from app.shared.deps import get_current_admin
from app.core.security import sanitize_html, sanitize_text, sanitize_url
from app.modules.posts.models import Post, Comment, PostReaction, FichaInformativa, CAMPOS_FICHA_INFORMATIVA
from app.modules.categories.models import Category
from app.modules.posts.schemas import (
    PostCreate, PostUpdate, PostResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    CommentCreate, CommentUpdate, CommentResponse,
    ReactionCreate,
    FichaCreate, FichaUpdate, FichaResponse
)
from app.core.upload_Imagem import upload_media, upload_multiple_media

router = APIRouter(prefix="/api/v1", tags=["posts"])

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
    count = db.query(Comment).filter(Comment.post_id == post.id).count()
    return PostResponse.from_orm_with_counts(post, comments_count=count)

# NOVO: limpa galeria - tira vazios, duplicados, limita a 10 fotos
def limpar_galeria(galeria) -> List[str]:
    if not galeria:
        return []
    limpa: List[str] = []
    for url in galeria:
        if not url:
            continue
        u = sanitize_url(str(url).strip())
        if u and u not in limpa:
            limpa.append(u)
    return limpa[:10]

# ===== NOVO: SKU AUTOMÁTICO E SÓ LEITURA - CON-001, CON-002... =====
# O frontend mostra o campo mas travado (readOnly). O backend é que gera.
# Na criação: ignora qualquer SKU que venha do frontend e gera um novo.
# Na edição: ignora sempre o SKU que vier, mantém o antigo. Só gera se o produto antigo estiver sem SKU.
SKU_PREFIXO = "CON-"

def gerar_proximo_sku(db: Session) -> str:
    # Procura o maior número já usado em CON-XXX, mesmo que o produto tenha sido apagado o número não volta a ser usado
    # porque procuramos o MAX de todos os que existem. Se apagares o último, o próximo continua a seguir.
    skus = db.query(Post.sku).filter(Post.sku.isnot(None), Post.sku.like(f"{SKU_PREFIXO}%")).all()
    maior = 0
    for (sku_val,) in skus:
        if not sku_val:
            continue
        m = re.search(r"(\d+)\s*$", str(sku_val).strip())
        if m:
            try:
                n = int(m.group(1))
                if n > maior:
                    maior = n
            except:
                pass
    # Garante que não gera um SKU que já existe (segurança extra)
    proximo = maior + 1
    while True:
        candidato = f"{SKU_PREFIXO}{proximo:03d}"
        existe = db.query(Post).filter(Post.sku == candidato).first()
        if not existe:
            return candidato
        proximo += 1

# ========= CATEGORIES - CORRIGIDO E SEGURO =========
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.nome).all()

# NOVO - Busca categoria por slug (isso que faltava e causava 404)
@router.get("/categories/slug/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    clean_slug = slug.lower().strip()
    cat = db.query(Category).filter(func.lower(Category.slug) == clean_slug).first()
    if not cat:
        cat = db.query(Category).filter(Category.slug.ilike(f"%{clean_slug}%")).first()
    if not cat:
        cat = db.query(Category).filter(func.lower(Category.nome).ilike(f"%{clean_slug}%")).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    return cat

# NOVO - Lista posts de uma categoria por slug
@router.get("/categories/slug/{slug}/posts", response_model=List[PostResponse])
def list_posts_by_category_slug(slug: str, db: Session = Depends(get_db), limit: int = Query(50, le=100), offset: int = 0):
    clean_slug = slug.lower().strip()
    cat = db.query(Category).filter(func.lower(Category.slug) == clean_slug).first()
    if not cat:
        cat = db.query(Category).filter(Category.slug.ilike(f"%{clean_slug}%")).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    posts = db.query(Post).filter(Post.category_id == cat.id).filter(func.lower(Post.status) == "published").order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return [to_post_response(p, db) for p in posts]

# Fallback genérico por slug ou id (tem que ficar DEPOIS das rotas /slug/)
@router.get("/categories/{slug_or_id}", response_model=CategoryResponse)
def get_category_generic(slug_or_id: str, db: Session = Depends(get_db)):
    # tenta por ID se for UUID válido
    try:
        uid = uuid.UUID(slug_or_id)
        cat = db.query(Category).filter(Category.id == uid).first()
        if cat:
            return cat
    except:
        pass
    clean = slug_or_id.lower().strip()
    cat = db.query(Category).filter(func.lower(Category.slug) == clean).first()
    if not cat:
        cat = db.query(Category).filter(Category.slug.ilike(f"%{clean}%")).first()
    if not cat:
        raise HTTPException(404, "Categoria não encontrada")
    return cat

@router.post("/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    nome = sanitize_text(data.nome, max_length=100)
    slug = sanitize_text(data.slug or slugify(nome), max_length=120)
    descricao = sanitize_text(data.descricao, max_length=500) if data.descricao else None
    final_slug = slug or slugify(nome)
    if db.query(Category).filter(Category.slug == final_slug).first():
        raise HTTPException(400, "Slug já existe")
    cat = Category(nome=nome, slug=final_slug, descricao=descricao, cor=data.cor)
    db.add(cat); db.commit(); db.refresh(cat)
    return cat

@router.put("/categories/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: uuid.UUID, data: CategoryUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat: raise HTTPException(404, "Categoria não encontrada")
    for k, v in data.model_dump(exclude_unset=True).items():
        if v is None:
            continue
        if k in {"nome", "slug", "descricao"}:
            if k == "nome":
                setattr(cat, k, sanitize_text(v, max_length=100))
            elif k == "slug":
                setattr(cat, k, sanitize_text(v, max_length=120))
            else:
                setattr(cat, k, sanitize_text(v, max_length=500))
        else:
            setattr(cat, k, v)
    if data.nome and not data.slug: cat.slug = slugify(sanitize_text(data.nome, max_length=100))
    db.commit(); db.refresh(cat)
    return cat

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat: raise HTTPException(404, "Categoria não encontrada")
    db.delete(cat); db.commit()
    return {"ok": True}

# UPLOAD
@router.post("/upload")
async def upload_post_media(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    return await upload_media(file, folder="connect-hub/posts")

# NOVO: UPLOAD MÚLTIPLO - para galeria do produto
@router.post("/upload-multiple")
async def upload_post_media_multiple(files: List[UploadFile] = File(...), admin=Depends(get_current_admin)):
    resultados = await upload_multiple_media(files, folder="connect-hub/posts")
    return {"files": resultados, "urls": [r["url"] for r in resultados if r.get("url")]}

# POSTS LIST
@router.get("/posts", response_model=List[PostResponse])
def list_posts(db: Session=Depends(get_db), tipo: Optional[str]=None, category_id: Optional[uuid.UUID]=None, category_slug: Optional[str]=None, status: Optional[str]=Query(None), q: Optional[str]=None, destaque: Optional[bool]=None, limit: int=Query(50, le=100), offset: int=0, upcoming: Optional[bool]=None):
    query = db.query(Post)
    if tipo:
        tipos = [t.strip().lower() for t in tipo.split(",") if t.strip()]
        if len(tipos) > 1: query = query.filter(func.lower(Post.tipo).in_(tipos))
        else: query = query.filter(func.lower(Post.tipo) == tipos[0])
    if category_id: query = query.filter(Post.category_id == category_id)
    if category_slug:
        cat = db.query(Category).filter(func.lower(Category.slug) == category_slug.lower()).first()
        if cat:
            query = query.filter(Post.category_id == cat.id)
    if status: query = query.filter(func.lower(Post.status) == status.lower())
    if destaque is not None: query = query.filter(Post.destaque == destaque)
    if q: query = query.filter(Post.titulo.ilike(f"%{q}%"))
    if upcoming and tipo and 'evento' in tipo.lower():
        query = query.filter(Post.data_inicio >= func.now())
    if tipo and 'evento' in tipo.lower():
        query = query.order_by(Post.data_inicio.asc().nulls_last(), Post.created_at.desc())
    else:
        query = query.order_by(Post.created_at.desc())
    posts = query.offset(offset).limit(limit).all()
    return [to_post_response(p, db) for p in posts]

@router.get("/posts/slug/{slug}", response_model=PostResponse)
def get_post_by_slug(slug: str, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post: post = db.query(Post).filter(Post.slug.ilike(f"%{slug}%")).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    return to_post_response(post, db)

@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    return to_post_response(post, db)

@router.post("/posts", response_model=PostResponse)
def create_post(data: PostCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    titulo = sanitize_text(data.titulo, max_length=300)
    final_slug = sanitize_text(data.slug or slugify(titulo), max_length=350) or slugify(titulo)
    if db.query(Post).filter(Post.slug == final_slug).first():
        final_slug = f"{final_slug}-{uuid.uuid4().hex[:4]}"
    payload = data.model_dump(exclude={"slug", "ficha_informativa"})
    # SKU AUTOMÁTICO: ignora o que vier do frontend, o backend gera. O input no admin é só leitura.
    payload.pop("sku", None)
    payload["titulo"] = titulo
    payload["descricao"] = sanitize_text(payload.get("descricao"), max_length=2000) if payload.get("descricao") else ""
    payload["conteudo"] = sanitize_html(payload.get("conteudo")) if payload.get("conteudo") else ""
    payload["link_url"] = sanitize_url(payload.get("link_url")) if payload.get("link_url") else None
    payload["thumbnail_url"] = sanitize_url(payload.get("thumbnail_url")) if payload.get("thumbnail_url") else None
    payload["media_url"] = sanitize_url(payload.get("media_url")) if payload.get("media_url") else None
    if payload.get("tipo"): payload["tipo"] = payload["tipo"].lower()
    if payload.get("status"): payload["status"] = payload["status"].lower()
    if payload.get("status_evento"): payload["status_evento"] = payload["status_evento"].lower()
    # CORRIGIDO: 1ª foto da galeria SEMPRE é a capa - mesmo que venha outro thumbnail
    payload["galeria"] = limpar_galeria(payload.get("galeria"))
    if payload["galeria"] and payload.get("tipo") == "produto":
        payload["thumbnail_url"] = payload["galeria"][0]
        payload["media_url"] = payload["galeria"][0]
    # SKU AUTOMÁTICO: só gera para produto. Notícia / evento / etc. ficam sem SKU.
    if payload.get("tipo") == "produto":
        payload["sku"] = gerar_proximo_sku(db)
    else:
        payload["sku"] = None
    post = Post(**payload, slug=final_slug, author_id=admin.id)
    db.add(post); db.commit(); db.refresh(post)
    # NOVO: grava a ficha que tu enviaste no cadastro
    if data.ficha_informativa:
        for item in data.ficha_informativa:
            db.add(FichaInformativa(post_id=post.id, campo=sanitize_text(item.campo, max_length=100), valor=sanitize_text(item.valor, max_length=2000)))
        db.commit(); db.refresh(post)
    return to_post_response(post, db)

@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: uuid.UUID, data: PostUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    payload = data.model_dump(exclude_unset=True, exclude={"ficha_informativa"})
    # SKU SÓ LEITURA: ignora sempre o SKU que vier do frontend na edição. Nunca deixa editar.
    payload.pop("sku", None)
    if "titulo" in payload and payload["titulo"] is not None:
        payload["titulo"] = sanitize_text(payload["titulo"], max_length=300)
        if not payload.get("slug"):
            payload["slug"] = slugify(payload["titulo"])
    if "descricao" in payload:
        payload["descricao"] = sanitize_text(payload.get("descricao"), max_length=2000) if payload.get("descricao") else ""
    if "conteudo" in payload:
        payload["conteudo"] = sanitize_html(payload.get("conteudo")) if payload.get("conteudo") else ""
    if "link_url" in payload and payload.get("link_url"):
        payload["link_url"] = sanitize_url(payload["link_url"])
    if "thumbnail_url" in payload and payload.get("thumbnail_url"):
        payload["thumbnail_url"] = sanitize_url(payload["thumbnail_url"])
    if "media_url" in payload and payload.get("media_url"):
        payload["media_url"] = sanitize_url(payload["media_url"])
    if "tipo" in payload and payload["tipo"]: payload["tipo"] = payload["tipo"].lower()
    if "status" in payload and payload["status"]: payload["status"] = payload["status"].lower()
    if "status_evento" in payload and payload["status_evento"]: payload["status_evento"] = payload["status_evento"].lower()
    # CORRIGIDO: limpa galeria e 1ª foto SEMPRE vira a capa no editar também
    if "galeria" in payload:
        payload["galeria"] = limpar_galeria(payload.get("galeria"))
        tipo_final = payload.get("tipo") or (post.tipo or "").lower()
        if payload["galeria"] and tipo_final == "produto":
            payload["thumbnail_url"] = payload["galeria"][0]
            payload["media_url"] = payload["galeria"][0]
    for k, v in payload.items():
        if v is None:
            continue
        setattr(post, k, v)
    # SKU AUTOMÁTICO PARA ANTIGOS: se é produto e ainda está sem SKU (criado antes), gera agora na primeira edição.
    # Se já tem SKU, mantém o antigo, nunca muda.
    if (post.tipo or "").lower() == "produto" and not post.sku:
        post.sku = gerar_proximo_sku(db)
    db.commit()
    # NOVO: se enviares ficha, substitui a antiga
    if data.ficha_informativa is not None:
        db.query(FichaInformativa).filter(FichaInformativa.post_id == post_id).delete()
        for item in data.ficha_informativa:
            db.add(FichaInformativa(post_id=post_id, campo=sanitize_text(item.campo, max_length=100), valor=sanitize_text(item.valor, max_length=2000)))
        db.commit()
    db.refresh(post)
    return to_post_response(post, db)

@router.delete("/posts/{post_id}")
def delete_post(post_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    db.delete(post); db.commit()
    return {"ok": True}

# VIEWS & SHARES
@router.post("/posts/{post_id}/view")
def add_view(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.views = (post.views or 0) + 1
    db.commit()
    return {"views": post.views}

@router.post("/posts/{post_id}/views")
def add_views_alias(post_id: uuid.UUID, db: Session=Depends(get_db)):
    return add_view(post_id, db)

@router.post("/posts/slug/{slug}/view")
def add_view_by_slug(slug: str, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.views = (post.views or 0) + 1
    db.commit()
    return {"views": post.views}

@router.post("/posts/{post_id}/share")
def add_share(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.shares_count = (post.shares_count or 0) + 1
    db.commit()
    return {"shares_count": post.shares_count}

@router.post("/posts/{post_id}/reaction")
def react_post(post_id: uuid.UUID, data: ReactionCreate, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    existing = db.query(PostReaction).filter(PostReaction.post_id == post_id, PostReaction.client_id == data.client_id).first()
    if existing:
        if existing.type == data.type:
            db.delete(existing)
            if data.type == 'like': post.likes_count = max(0, (post.likes_count or 0) - 1)
            else: post.dislikes_count = max(0, (post.dislikes_count or 0) - 1)
            db.commit()
            return {"likes_count": post.likes_count, "dislikes_count": post.dislikes_count, "user_reaction": None}
        else:
            old = existing.type
            existing.type = data.type
            if old == 'like':
                post.likes_count = max(0, (post.likes_count or 0) - 1)
                post.dislikes_count = (post.dislikes_count or 0) + 1
            else:
                post.dislikes_count = max(0, (post.dislikes_count or 0) - 1)
                post.likes_count = (post.likes_count or 0) + 1
            db.commit()
            return {"likes_count": post.likes_count, "dislikes_count": post.dislikes_count, "user_reaction": data.type}
    else:
        r = PostReaction(post_id=post_id, client_id=data.client_id, type=data.type)
        db.add(r)
        if data.type == 'like': post.likes_count = (post.likes_count or 0) + 1
        else: post.dislikes_count = (post.dislikes_count or 0) + 1
        db.commit()
        return {"likes_count": post.likes_count, "dislikes_count": post.dislikes_count, "user_reaction": data.type}

@router.get("/posts/{post_id}/reaction")
def get_my_reaction(post_id: uuid.UUID, client_id: str, db: Session=Depends(get_db)):
    r = db.query(PostReaction).filter(PostReaction.post_id == post_id, PostReaction.client_id == client_id).first()
    return {"user_reaction": r.type if r else None}

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def list_comments(post_id: uuid.UUID, db: Session=Depends(get_db)):
    return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(post_id: uuid.UUID, data: CommentCreate, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    nome = sanitize_text(data.nome or "Anónimo", max_length=120)
    conteudo = sanitize_text(data.conteudo, max_length=2000)
    c = Comment(post_id=post_id, nome=nome, conteudo=conteudo)
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.put("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(comment_id: uuid.UUID, data: CommentUpdate, db: Session=Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c: raise HTTPException(404, "Comentário não encontrado")
    if data.nome is not None: c.nome = sanitize_text(data.nome, max_length=120)
    if data.conteudo is not None: c.conteudo = sanitize_text(data.conteudo, max_length=2000)
    db.commit(); db.refresh(c)
    return c

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: uuid.UUID, db: Session=Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c: raise HTTPException(404, "Comentário não encontrado")
    db.delete(c); db.commit()
    return {"ok": True}

@router.delete("/posts/{post_id}/comments/{comment_id}")
def delete_comment_by_post(post_id: uuid.UUID, comment_id: uuid.UUID, db: Session=Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id, Comment.post_id == post_id).first()
    if not c: raise HTTPException(404, "Comentário não encontrado")
    db.delete(c); db.commit()
    return {"ok": True}

@router.patch("/posts/{post_id}/status-evento", response_model=PostResponse)
def update_status_evento(post_id: uuid.UUID, status_evento: str, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    allowed = ["ativo", "cancelado", "adiado", "esgotado"]
    se = status_evento.lower().strip()
    if se not in allowed:
        raise HTTPException(400, f"Status inválido. Use: {', '.join(allowed)}")
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    post.status_evento = se
    db.commit(); db.refresh(post)
    return to_post_response(post, db)

# ===== FICHA INFORMATIVA - NOVO =====
@router.get("/ficha-campos", response_model=List[str])
def list_campos_ficha():
    # lista dos 24 nomes pra o frontend mostrar no select do cadastro - sem valores
    return CAMPOS_FICHA_INFORMATIVA

@router.get("/posts/{post_id}/ficha", response_model=List[FichaResponse])
def list_ficha(post_id: uuid.UUID, db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    return db.query(FichaInformativa).filter(FichaInformativa.post_id == post_id).order_by(FichaInformativa.created_at.asc()).all()

@router.post("/posts/{post_id}/ficha", response_model=FichaResponse)
def add_ficha(post_id: uuid.UUID, data: FichaCreate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post não encontrado")
    f = FichaInformativa(post_id=post_id, campo=sanitize_text(data.campo, max_length=100), valor=sanitize_text(data.valor, max_length=2000))
    db.add(f); db.commit(); db.refresh(f)
    return f

@router.put("/ficha/{ficha_id}", response_model=FichaResponse)
def update_ficha(ficha_id: uuid.UUID, data: FichaUpdate, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    f = db.query(FichaInformativa).filter(FichaInformativa.id == ficha_id).first()
    if not f: raise HTTPException(404, "Ficha não encontrada")
    if data.campo is not None: f.campo = sanitize_text(data.campo, max_length=100)
    if data.valor is not None: f.valor = sanitize_text(data.valor, max_length=2000)
    db.commit(); db.refresh(f)
    return f

@router.delete("/ficha/{ficha_id}")
def delete_ficha(ficha_id: uuid.UUID, admin=Depends(get_current_admin), db: Session=Depends(get_db)):
    f = db.query(FichaInformativa).filter(FichaInformativa.id == ficha_id).first()
    if not f: raise HTTPException(404, "Ficha não encontrada")
    db.delete(f); db.commit()
    return {"ok": True}
