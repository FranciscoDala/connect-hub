from fastapi import APIRouter, Depends, UploadFile, File
from app.shared.deps import get_current_admin
from app.core.upload_Imagem import upload_media

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

@router.post("")
async def upload(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    # já valida tamanho, tipo e sobe pro cloudinary
    result = await upload_media(file, folder="connect-hub/posts")
    return {
        "url": result["url"],
        "type": result["type"], # image | video | audio | doc
        "public_id": result["public_id"]
    }

@router.post("/apps/{app_id}")
async def upload_app_media(app_id: str, file: UploadFile = File(...), admin=Depends(get_current_admin)):
    result = await upload_media(file, folder=f"connect-hub/apps/{app_id}")
    return result
