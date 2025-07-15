from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict

from . import models, schemas, crud
from .database import engine, Base, get_db

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinCoach VN API", version="0.1.0")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory token store (demo only!)
TOKENS: Dict[str, int] = {}


# ---------------- Auth -----------------
@app.post("/register", response_model=schemas.AuthResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    db_user = crud.create_user(db, user)
    token = f"token-{db_user.id}"
    TOKENS[token] = db_user.id
    return schemas.AuthResponse(access_token=token)


@app.post("/login", response_model=schemas.AuthResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, req.username)
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"token-{user.id}"
    TOKENS[token] = user.id
    return schemas.AuthResponse(access_token=token)


# Dependency to get current user

def get_current_user(token: str = Depends(lambda: ""), db: Session = Depends(get_db)):
    # token comes from Authorization header "Bearer <token>"
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    user_id = TOKENS.get(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -------------- Jar endpoints -------------

@app.get("/jars", response_model=Dict[str, schemas.Jar])
def list_jars(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    jars = crud.get_jars(db, current_user.id)
    return {jar.name: jar for jar in jars}


@app.patch("/jars/{name}", response_model=schemas.Jar)
def update_jar(name: str, body: schemas.JarUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    jar = crud.update_jar_allocation(db, current_user.id, name, body.allocation_percent)
    if not jar:
        raise HTTPException(status_code=404, detail="Jar not found")
    return jar


# ------------- Transaction ingestion & retrieval ---------------

# Simple keyword mapping -> jar name
KEYWORD_JAR_MAP = {
    "tuition": "Education",
    "school": "Education",
    "coffee": "Play",
    "cafe": "Play",
    "restaurant": "Play",
    "rent": "Necessity",
    "grocery": "Necessity",
    "supermarket": "Necessity",
    "donation": "Give",
    "charity": "Give",
    "investment": "Financial Freedom",
    "stock": "Financial Freedom",
    "saving": "Long-Term Savings",
    "deposit": "Long-Term Savings",
}


def classify_transaction(description: str) -> str:
    desc_lower = description.lower()
    for keyword, jar in KEYWORD_JAR_MAP.items():
        if keyword in desc_lower:
            return jar
    return "Necessity"  # default jar


@app.post("/transactions", response_model=schemas.Transaction)
def add_transaction(tx: schemas.TransactionCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    jar_name = classify_transaction(tx.description)
    record = crud.create_transaction(db, current_user.id, tx, jar_name)
    # Award points for each classified tx
    crud.add_points(db, current_user.id, 1)
    return record


@app.get("/transactions", response_model=Dict[int, schemas.Transaction])
def list_transactions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = crud.get_transactions(db, current_user.id)
    return {tx.id: tx for tx in txs}


# -------------- Gamification -----------------

@app.get("/points", response_model=schemas.WisdomPoint)
def get_wisdom_points(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    points = crud.get_points(db, current_user.id)
    return schemas.WisdomPoint(points=points)


# -------------- Insights (Mock RAG) -----------------

from pathlib import Path
from sentence_transformers import SentenceTransformer, util
import torch

MODEL_NAME = "all-MiniLM-L6-v2"

kb_dir = Path(__file__).parent / "knowledge_base"
kb_files = list(kb_dir.glob("*.txt"))
_documents = [f.read_text() for f in kb_files]
_titles = [f.stem for f in kb_files]

_embedder = SentenceTransformer(MODEL_NAME)
_doc_embeddings = _embedder.encode(_documents, convert_to_tensor=True)


@app.post("/insights")
def insights(query: str):
    query_emb = _embedder.encode(query, convert_to_tensor=True)
    cos_scores = util.cos_sim(query_emb, _doc_embeddings)[0]
    top_idx = int(torch.argmax(cos_scores))
    answer = _documents[top_idx][:500]  # return first 500 chars of best doc
    return {"answer": answer, "source": _titles[top_idx]}