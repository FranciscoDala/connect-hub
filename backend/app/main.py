from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os

app = FastAPI(title="Connect Hub API", version="1.0.0", description="API Enterprise da Connect")

# Ajuste CORS pra aceitar teu frontend
origins = [
    "https://connect-uuo9.onrender.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"], # em prod deixa ["*"] por enquanto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"status": "enterprise ready", "env": "production"}

@app.get("/api/v1/posts")
def list_posts():
    return [{"id":1,"tipo":"trabalho","titulo":"Primeiro post Connect","descricao":"Feed inicial"}]

@app.get("/api/v1/apps")
def list_apps():
    return [{"id":"faturaxpress","nome":"FaturaXpress","url":"/apps/faturaxpress","status":"online"}]
