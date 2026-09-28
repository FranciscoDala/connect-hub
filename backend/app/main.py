from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import time

# --- ROUTERS ---
from app.modules.auth.router import router as auth_router
from app.modules.categories.routes import router as categories_router
from app.modules.posts.routes import router as posts_router
from app.modules.banners.router import router as banners_router

# importa models pro Base.metadata / alembic
from app.db.base import Base
import app.modules.users.models
import app.modules.categories.models
import app.modules.posts.models
import app.modules.banners.models

ENV = os.getenv("ENV", "production")
IS_PROD = ENV == "production"

app = FastAPI(
    title="Connect Hub API",
    version="1.0.0",
    description="API Enterprise da Connect",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# --- MIDDLEWARES ---
app.add_middleware(GZipMiddleware, minimum_size=1000)

origins = [
    "https://connect-uuo9.onrender.com",
    "https://connect-backend-iern.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=600,
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if "server" in response.headers:
        del response.headers["server"]
    response.headers["X-Process-Time"] = str(time.time() - start)
    return response

# --- EXCEPTION HANDLERS ---
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if not IS_PROD or exc.status_code < 500 else "Erro interno"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Dados inválidos", "errors": exc.errors() if not IS_PROD else []}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERRO CRÍTICO: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Erro interno no servidor"})

# --- ROTAS ---
@app.get("/", include_in_schema=False)
def root():
    return {"status": "online", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"status": "enterprise ready", "env": ENV, "version": "1.0.0"}

# Registra routers - ORDEM IMPORTA
app.include_router(auth_router)         # /api/v1/auth/*
app.include_router(categories_router)   # /api/v1/categories
app.include_router(posts_router)        # /api/v1/posts + /api/v1/upload
app.include_router(banners_router)      # /api/v1/banners

@app.get("/api/v1/apps", tags=["apps"])
def list_apps():
    return [
        {"id":"faturaxpress","nome":"FaturaXpress","url":"/apps/faturaxpress","status":"online"},
        {"id":"connect-hub","nome":"Connect Hub","url":"/connect","status":"online"}
    ]
