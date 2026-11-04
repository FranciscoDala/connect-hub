import uuid
import io
import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryImage
from fastapi import HTTPException, UploadFile
from app.core.config import settings
import imghdr
from typing import List

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

ALLOWED = {
    "image": {"jpg", "jpeg", "png", "webp", "gif"},
    "video": {"mp4", "mov", "avi", "webm", "mkv"},
    "audio": {"mp3", "wav", "ogg", "m4a", "aac"},
    "doc": {"pdf", "doc", "docx"}
}

MAX_SIZE = {
    "image": 10 * 1024 * 1024, # 10MB
    "video": 200 * 1024 * 1024, # 200MB
    "audio": 50 * 1024 * 1024, # 50MB
    "doc": 20 * 1024 * 1024
}

def _get_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    for t, exts in ALLOWED.items():
        if ext in exts:
            return t
    return "doc"

async def upload_media(file: UploadFile, folder: str = "connect-hub/posts") -> dict:
    if not file.filename:
        raise HTTPException(400, "Arquivo sem nome")

    contents = await file.read()
    if not contents or len(contents) < 10:
        raise HTTPException(400, "Arquivo vazio")

    media_type = _get_type(file.filename)
    max_allowed = MAX_SIZE[media_type]

    if len(contents) > max_allowed:
        raise HTTPException(400, f"Arquivo muito grande para {media_type}. Máx {max_allowed//1024//1024}MB")

    # valida imagem
    if media_type == "image":
        kind = imghdr.what(None, h=contents)
        if kind not in ALLOWED["image"] and kind!= "jpeg":
            raise HTTPException(400, "Imagem inválida")

    public_id = f"{uuid.uuid4().hex}_{file.filename.rsplit('.',1)[0][:40]}"

    resource_type = "video" if media_type in ["video", "audio"] else "auto"

    try:
        res = cloudinary.uploader.upload(
            io.BytesIO(contents),
            folder=folder,
            public_id=public_id,
            resource_type=resource_type,
            overwrite=True,
            access_mode="public",
            use_filename=False,
            unique_filename=True,
        )
        return {
            "url": res.get("secure_url"),
            "public_id": res.get("public_id"),
            "type": media_type,
            "bytes": res.get("bytes"),
            "format": res.get("format")
        }
    except Exception as e:
        raise HTTPException(502, f"Falha upload Cloudinary: {e}")

# ===== NOVO: UPLOAD MÚLTIPLO PARA GALERIA DO PRODUTO =====
async def upload_multiple_media(files: List[UploadFile], folder: str = "connect-hub/posts") -> List[dict]:
    """Sobe várias fotos de uma vez e devolve lista de {url, public_id, type...}"""
    if not files:
        return []

    resultados: List[dict] = []
    for file in files:
        # ignora input vazio do form (quando o user não escolheu foto)
        if not file or not file.filename:
            continue
        resultado = await upload_media(file, folder=folder)
        resultados.append(resultado)

    return resultados

async def upload_multiple_images(files: List[UploadFile], folder: str = "connect-hub/posts") -> List[str]:
    """Sobe várias fotos e devolve só a lista de urls - é o que vai para o campo galeria"""
    resultados = await upload_multiple_media(files, folder=folder)
    return [r["url"] for r in resultados if r.get("url")]

# mantém compatibilidade com teu código antigo
async def upload_image(file: UploadFile, folder: str = "produtos") -> str:
    result = await upload_media(file, folder=f"faturaxpress/{folder}")
    return result["url"]

async def upload_comprovante(file: UploadFile, company_id: str) -> str:
    result = await upload_media(file, folder=f"faltas/{company_id}")
    return result["url"]
