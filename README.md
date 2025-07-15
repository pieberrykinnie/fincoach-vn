# FinCoach VN – AI Financial Coach (6-Jar Money Management)

FinCoach VN is a hackathon-ready MVP that demonstrates an **AI-powered financial coach** for young Vietnamese customers.  It combines a React (Vite) front-end with a FastAPI back-end to showcase the core flows described in our VPBank Technology Hackathon 2025 proposal:

* 6-Jar income allocation & real-time balances
* Smart transaction classification (rule-based in the MVP)
* Pro-active alerts & wisdom-point gamification
* Retrieval-Augmented Generation (RAG) proof-of-concept for financial guidance

> **NOTE** This repository focuses on functional clarity for the hackathon demo and is _not_ production-grade.  Security, scalability, and DevOps hardening are outlined in the `docs/` folder for a post-hackathon roadmap.

---

## Project Structure

```text
|── backend/               # FastAPI application
│   ├── main.py            # Entrypoint – API routes
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic request / response models
│   ├── crud.py            # Database helpers
│   ├── database.py        # DB connection (SQLite for demo)
│   ├── requirements.txt   # Python dependencies
│   └── knowledge_base/    # Small doc set for RAG demo
│
└── frontend/              # Vite + React + TypeScript web-app
    ├── src/
    │   ├── App.tsx        # Single-page dashboard
    │   └── …              # Vite scaffolding
    └── package.json       # NPM dependencies
```

## Quick-start (Local)

### 1. Back-end

```bash
# From project root
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

# Start FastAPI with hot-reload (port 8000)
uvicorn backend.main:app --reload
```

### 2. Front-end

```bash
cd frontend
npm install
npm run dev   # Launches Vite dev server on port 5173 (default)
```

Visit `http://localhost:5173` → register a user → explore the dashboard.

## Key API End-points (FastAPI)

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| POST   | `/register`       | Create a new user & return bearer token |
| POST   | `/login`          | Authenticate existing user |
| GET    | `/jars`           | List all 6 jars with allocation & balances |
| PATCH  | `/jars/{name}`    | Update allocation percent for a jar |
| POST   | `/transactions`   | Add & auto-classify a transaction |
| GET    | `/transactions`   | List user transactions |
| GET    | `/points`         | Current wisdom points |
| POST   | `/insights`       | Ask a financial question (RAG POC) |

Full OpenAPI docs available at `http://localhost:8000/docs` once the server is running.

## Extending further

Detailed architecture diagrams, AWS deployment notes, security considerations, and future AI roadmap live in **`docs/`** (generated from the original proposal).

* Cloud formation templates for a fully serverless variant (API Gateway → Lambda → DynamoDB) – _sketched_
* Bedrock integration plan for Vietnamese Large Language Models – _outlined_
* VPBank core-banking API contract assumptions – _documented_

---

Feel free to fork & iterate – we welcome pull requests and feedback!
