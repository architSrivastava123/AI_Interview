# MockMate AI — Personalized Technical Mock Interview Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-2C3440?logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraphjs/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-Jest_&_Supertest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

An AI-powered technical mock interview platform that uses a candidate's resume, target role, previous performance, and domain knowledge base to conduct adaptive multi-turn interviews, evaluate answers, identify skill gaps, and generate actionable practice roadmaps.

---

## 🏗️ System Architecture

```text
                           React 18 + Vite (Client)
                                      │
                                      │ REST API (Bearer JWT)
                                      ▼
                             Node.js + Express (Server)
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
           Clerk                   MongoDB                AI Pipeline
       Authentication              Database                    │
                                                               │
                                               ┌───────────────┴───────────────┐
                                               │                               │
                                           LangGraph                       LangChain
                                      (Stateful Workflow)             (Chains & Schemas)
                                               │                               │
                                               └───────────────┬───────────────┘
                                                               │
                                                 ┌─────────────┴─────────────┐
                                                 ▼                           ▼
                                           Google Gemini                    RAG
                                            (LLM Model)                      │
                                                                       Embeddings
                                                                             │
                                                                        Vector Store
                                                                (Knowledge Base & Resumes)
```

---

## 📂 Project Structure

```text
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI & Domain Components (Dashboard, Interview, Reports, Resume)
│   │   ├── hooks/              # Custom React Hooks (useSpeechToText, Web Speech API)
│   │   ├── pages/              # Route Pages (Dashboard, Interview, Reports, Resumes, Recommendations)
│   │   ├── services/           # Axios REST API Services with Clerk Bearer Token Interceptors
│   │   ├── utils/              # Lightweight formatting utilities
│   │   ├── App.jsx             # React Router v6 Route Map
│   │   └── main.jsx            # Application Entry & ClerkProvider Setup
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── ai/                 # Gemini Client, Zod Schemas, LangChain Prompt Chains
│   │   ├── config/             # Environment Loader, DB Connection, Scoring Constants
│   │   ├── controllers/        # Interview, Resume, Report, Analytics, Recommendation Controllers
│   │   ├── engines/            # Pure Business Engines (Scoring, Speech, Skill Gap, Recommendations)
│   │   ├── graph/              # LangGraph Stateful Interview State Machine & Nodes
│   │   ├── middleware/         # Clerk Auth, Zod Validation, Centralized Error Handling
│   │   ├── models/             # Mongoose Models with Strict `clerkUserId` Scoping
│   │   ├── rag/                # Markdown/PDF Loaders, Gemini Embeddings, Cosine Vector Store
│   │   ├── routes/             # Express Route Definitions
│   │   ├── app.js              # Express App Configuration & Middleware Pipeline
│   │   └── server.js           # Server Bootstrap & DB Initialization
│   └── package.json
│
├── knowledge/                  # Curated Technical RAG Documents
│   ├── javascript/             # Event Loop, Closures, Async/Await
│   ├── react/                  # Hooks, State Management, Reconciliation & Virtual DOM
│   ├── node/                   # Event-Driven Architecture, Streams & Buffers
│   ├── express/                # Middleware Pipeline, REST API Design
│   ├── mongodb/                # Indexing & Query Optimization, Schema Relations
│   ├── rest-api/               # Status Codes, Authentication & JWT
│   ├── system-design/          # Caching & CDN, Microservices vs Monolith, DB Scaling
│   └── behavioral/             # STAR Method, Conflict Resolution
│
└── tests/                      # Automated Unit & Integration Test Suite
    ├── unit/                   # Scoring Engine, Speech Telemetry, Skill Gap, Vector Math, Adaptive Nodes
    └── integration/            # Express REST API Endpoints & Auth Middleware
```

---

## 🎯 Technologies & Why They Are Used

| Layer | Technology | Purpose in the Application |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS | High-performance, distraction-free developer interface with responsive routing and client state. |
| **Backend** | Node.js, Express.js | Modular REST API service handling authentication, interview orchestration, and data persistence. |
| **Database** | MongoDB & Mongoose | Flexible document model for user-owned resumes, multi-turn interview sessions, and vector chunks. |
| **Authentication**| Clerk (`@clerk/clerk-react` + `@clerk/express`) | Secure JWT authentication with strict `clerkUserId` database isolation boundaries. |
| **Orchestration** | **LangGraph** (`@langchain/langgraph`) | Stateful interview state machine managing multi-turn transitions and deterministic adaptive difficulty. |
| **AI Layer** | **LangChain** (`@langchain/google-genai`) | Prompt templating, structured Zod output parsing, and resilient fallback execution. |
| **RAG** | Vector Store & Gemini Embeddings (`text-embedding-004`) | Semantic similarity retrieval over candidate resumes and curated technical knowledge documents. |
| **LLM** | Google Gemini (`gemini-1.5-flash`) | Semantic answer evaluation, communication analysis, and executive report synthesis. |
| **Speech** | Web Speech API | Client-side speech-to-text with real-time Words Per Minute (WPM) and filler-word density tracking. |
| **Testing** | Jest, Supertest | Automated test coverage for pure scoring formulas, speech telemetry, and REST endpoints. |

---

## 💡 Why These Technologies? (Interview Explanation)

> **"I built an AI-powered mock interview platform using React, Node.js and Express with MongoDB for persistence. Users authenticate through Clerk and can upload their resume and select a target role. I implemented RAG to retrieve relevant resume and technical knowledge before generating questions. LangChain manages the LLM and retrieval pipeline, while LangGraph manages the stateful interview workflow. Gemini generates and evaluates questions and answers. Based on the candidate's performance, the system dynamically adjusts interview difficulty and generates skill-gap recommendations."**

- **Why LangGraph?** An interview is inherently a stateful multi-step workflow. The next question depends on previous answers, evaluations, missing concepts, and adaptive difficulty. LangGraph models this cleanly as a state machine with conditional branching.
- **Why LangChain?** Centralizes prompt templates and enforces strict typed outputs via Zod validation schemas (`QuestionOutputSchema`, `EvaluationOutputSchema`, `ReportSynthesisSchema`).
- **Why RAG?** Prevents LLM hallucinations and tailors questions to the candidate's actual projects and technical stack while grounding evaluations in curated technical documentation.
- **Why Deterministic Scoring?** AI is used only for semantic evaluation (0–10 scale). Final composite scores are computed deterministically using weighted dimensions: **Technical (40%)**, **Fluency (20%)**, **Pace (15%)**, **Confidence (15%)**, and **Communication (10%)**.

---

## 🔄 Core Interview Workflow

```text
1. User Logs in with Clerk
2. Uploads Resume (parsed into chunks and embedded into Vector Store)
3. Selects Target Role (Frontend, Backend, Full Stack, System Design) & Experience Level
4. LangGraph initializes session -> Context Node retrieves relevant Resume & Technical RAG chunks
5. Question Node invokes LangChain + Gemini to generate Question 1
6. Candidate answers via voice (Web Speech API) or text
7. Speech metrics (WPM, filler word count/density) are calculated deterministically
8. Evaluation Node analyzes correctness, technical depth, and relevance with Gemini
9. Scoring Engine calculates composite score & Adaptive Node adjusts difficulty (Easy, Medium, Hard, Expert)
10. System generates next question or synthesizes final Executive Report + Skill Gaps + Practice Plans
```

---

## 📡 REST API Reference

All endpoints under `/api/*` require an `Authorization: Bearer <clerk_session_token>` header.

### Interviews
- `POST /api/interviews` — Create a new interview session.
- `GET /api/interviews` — List all interviews belonging to authenticated user.
- `GET /api/interviews/:id` — Get interview details, questions, and answers.
- `DELETE /api/interviews/:id` — Delete interview and associated data.
- `POST /api/interviews/:id/start` — Run LangGraph start node, generate Question 1.
- `POST /api/interviews/:id/answer` — Submit answer, run speech analysis & scoring.
- `POST /api/interviews/:id/next-question` — Adaptively generate next question.
- `POST /api/interviews/:id/complete` — Finish session, synthesize report & recommendations.

### Resumes & RAG
- `POST /api/resumes` — Upload PDF/text resume, extract skills, generate chunk embeddings.
- `GET /api/resumes` — List candidate resumes.
- `DELETE /api/resumes/:id` — Delete resume.

### Analytics & Reports
- `GET /api/analytics` — Get overall interview readiness, score trends, and active streak.
- `GET /api/reports` — List past interview diagnostic reports.
- `GET /api/reports/:id` — Get comprehensive report by interview ID.

### Recommendations
- `GET /api/recommendations` — List prioritized skill-gap practice actions.
- `PATCH /api/recommendations/:id/toggle` — Mark recommendation as completed.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Clerk Account (Publishable & Secret keys)
- Google Gemini API Key

### 2. Environment Setup

Create `.env` in the root directory (or in `server/` and `client/`):

```env
# Server (.env)
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mockmate?retryWrites=true&w=majority
GOOGLE_API_KEY=your_gemini_api_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLIENT_URL=http://localhost:5173

# Client (client/.env)
VITE_API_URL=/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

### 3. Installation

Install dependencies across the monorepo:

```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 4. Running the Development Server

```bash
# Runs Express backend on :5000 and Vite React frontend on :5173 concurrently
npm run dev
```

### 5. Running Automated Tests

```bash
# Runs full unit and API integration test suites
npm test
```

---

## 🧪 Testing Suite Overview

- `tests/unit/scoringEngine.test.js` — Validates non-linear technical rating normalization, WPM penalties, filler word density decay, and letter grade thresholds.
- `tests/unit/speechEngine.test.js` — Validates word count, WPM calculation, and filler word detection.
- `tests/unit/skillGapEngine.test.js` — Validates benchmark comparisons against target role profiles.
- `tests/unit/vectorStore.test.js` — Validates cosine similarity mathematics and top-K metadata filtering.
- `tests/unit/adaptiveDifficulty.test.js` — Validates deterministic difficulty stepping.
- `tests/integration/expressApi.test.js` — Validates Express endpoints, health checks, and Clerk 401 token authentication enforcement.
