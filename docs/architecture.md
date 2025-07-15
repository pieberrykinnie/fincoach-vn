# Architecture Overview – FinCoach VN (MVP)

This document complements the main `README.md` and dives deeper into the **prototype** architecture delivered in this repository.

![Simplified Diagram](../docs/assets/fincoach-architecture.png)

## 1. Front-end (Vite + React + TypeScript)

| Concern              | Decision                                                                   |
| -------------------- | --------------------------------------------------------------------------- |
| SPA vs. MPA          | *Single-Page Application* – faster interaction and easy state management.   |
| Component library    | Native CSS for MVP; Tailwind/MUI can be added post-hackathon for polish.    |
| State management     | `useState` + `useEffect`; later upgrade to Redux/ Zustand if complexity grows. |
| Auth persistence     | Bearer token stored in `localStorage` (demo). Replace with secure cookies in prod. |
| Charts               | Recharts / Chart.js can be plugged in to visualise jar balances.            |

## 2. Back-end (FastAPI)

FastAPI gives us:

* Automatic OpenAPI / Swagger docs → quick validation during demo
* Async support for future performance needs
* First-class pydantic validation

### Key modules

| File                | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `models.py`         | SQLAlchemy ORM tables                    |
| `schemas.py`        | Pydantic I/O models                      |
| `crud.py`           | Reusable database helper functions       |
| `main.py`           | Route declarations + business logic      |
| `knowledge_base/`   | TXT docs used by the RAG demo            |

### Database – SQLite vs. DynamoDB

* SQLite keeps the demo fully self-contained (zero cloud deps).
* For a **serverless AWS** deployment the ORM layer is easily swapped with [`boto3` + DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.Python.01.html).  Table schemas are provided in `docs/dynamodb_schema.md`.

## 3. AI Layer (Retrieval-Augmented Generation)

| Step           | Implementation (MVP)                                          | Production consideration |
| -------------- | -------------------------------------------------------------- | ------------------------ |
| Embeddings     | `sentence-transformers/all-MiniLM-L6-v2`                       | Bedrock Titan / Claude   |
| Vector store   | In-memory tensor list                                          | Amazon OpenSearch k-NN   |
| Generation     | *Extractive* – returns best snippet                            | Bedrock LLM completion   |

## 4. Gamification Engine

A single helper in `crud.add_points()` increments **Wisdom Points** whenever a user performs a value-adding action:

* Creating an account → +10 pts (future enhancement)
* Adding a transaction → +1 pt  _(_implemented_)
* Staying under 80 % of jar budget → scheduled Lambda in cloud deployment (todo)

## 5. Security Notes

* **Passwords are stored plain-text in the MVP** – this is acceptable for an offline demo but _must_ be replaced with BCrypt hashing and proper JWT issuance for any public environment.
* CORS is locked to `localhost` origins only.
* The AI insight endpoint contains no user data – safe for public demo.

## 6. AWS Alignment

Although the code runs locally, every component has a clear AWS counterpart:

| Local Component | AWS Service Equivalent                      |
| --------------- | ------------------------------------------- |
| Vite static site| S3 + CloudFront (static hosting)            |
| FastAPI routes  | API Gateway + Lambda (Python runtime)       |
| SQLite          | DynamoDB                                    |
| In-memory vector| Amazon OpenSearch Service (serverless k-NN) |
| `sentence-transformers` | Amazon Bedrock embeddings / Llama   |

Terraform / AWS CDK snippets will be published after the hackathon to automate this mapping.

---

*Last updated:* {{DATE}}