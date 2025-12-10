from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, SessionLocal, Base
from .routers import auth, categories, tasks, stats
from .seed import seed_categories

# Create tables
Base.metadata.create_all(bind=engine)

# Seed initial data
db = SessionLocal()
seed_categories(db)
db.close()

app = FastAPI(
    title="LifeRPG API",
    description="Gamifica tu vida con hábitos y rutinas estilo RPG",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:8105",
    "http://localhost:8100",
    "http://127.0.0.1:8105",
    "http://127.0.0.1:8100",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(tasks.router)
app.include_router(stats.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to LifeRPG API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
