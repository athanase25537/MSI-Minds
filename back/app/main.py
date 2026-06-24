from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.game_routes import router
from .db import engine
from .models.db_models import Base

# Créer les tables au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fanoron-telo Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")