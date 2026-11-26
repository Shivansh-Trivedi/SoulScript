<p align="center">
  <img src="frontend/src/assets/soulscript-logo.webp" alt="SoulScript" width="420">
</p>

<h1 align="center">SoulScript</h1>

<p align="center">A private journal for writing, reflection, and noticing emotional patterns over time.</p>

SoulScript is a full-stack journaling application. People can write and manage private entries, optionally request an AI estimate of the emotions expressed in an entry, record their own mood separately, and review patterns without treating an estimate as a verdict about how they feel.

## Product features

- **Private journal:** Create, edit, search, and delete personal entries. Entries can include an optional self-reported mood.
- **Optional emotion estimates:** Analyze a saved entry and view scores for seven emotion labels. Estimates are tied to the entry content version and become stale when the text changes.
- **Emotion-aware appearance:** Choose the standard SoulScript theme, a manual palette, or an automatic palette based on the latest current AI estimate.
- **Dashboard and analytics:** View writing activity, mood distribution, daily emotion trends, and comparisons between estimates and personal check-ins.
- **Emotion-colored activity bars:** Each date's bar keeps its height based on the number of entries and uses that date's most frequent current AI estimate for its color. Ties use the most recently analyzed tied estimate. Dates without a current estimate use the app theme color. Hover or keyboard focus reveals the date, estimate, and entry count.
- **Weekly reflections:** Review a week of saved writing through a summary and open-ended, entry-related reflection questions. A reflection can be refreshed when its source entries change.
- **Suggestions:** Open Suggestions from the main navigation for curated movies, articles, blogs, and videos related to the latest current estimate. Suggestions are optional, and journal content is not sent to suggestion sites.
- **Support prompt:** When a journal entry includes a direct first-person self-harm phrase alongside a current sadness or disgust signal, the app displays a supportive message with Tele-MANAS and India emergency contact numbers. The message explains that AI estimates may be wrong.
- **Data controls:** Export account data as JSON or delete the account and its live database records.

## Emotion model

The backend uses [`j-hartmann/emotion-english-distilroberta-base`](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base/tree/0e1cd914e3d46199ed785853e12b57304e04178b), a fine-tuned DistilRoBERTa-base text classifier. SoulScript pins revision `0e1cd914e3d46199ed785853e12b57304e04178b`; the model ID and revision are configurable with `EMOTION_MODEL_ID` and `EMOTION_MODEL_REVISION` in `backend/.env`.

The classifier returns scores for anger, disgust, fear, joy, neutral, sadness, and surprise. The backend runs Transformers inference on CPU and truncates input to 512 tokens. The model is loaded on the first analysis and its files are downloaded from Hugging Face and cached in the backend environment. Journal text is not sent to a third-party inference API.

The model card describes an English-language model trained on six datasets spanning social media, student self-reports, and television dialogue. It reports 66% accuracy on its balanced held-out evaluation split. That figure is not a guarantee for journal writing or an individual entry. The model can miss context, irony, mixed feelings, and language outside its training data. Its output describes patterns in text; it is not a diagnosis and does not replace a person's own report. The pinned model card does not specify a license, so review the model and dataset terms before distributing or commercially deploying the application.

The model's reported training details and evaluation are available in its [model card at the pinned revision](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base/blob/0e1cd914e3d46199ed785853e12b57304e04178b/README.md).

## Technology

- **Frontend:** React, React Router, and Vite.
- **Backend:** FastAPI and SQLAlchemy.
- **Database:** PostgreSQL by default; SQLite is supported for local development.
- **Authentication:** Server-side sessions, CSRF protections, and Argon2 password hashing.
- **Inference:** Transformers and PyTorch, running locally in the backend process.

## Repository structure

- `frontend/` — React application, styles, assets, and Vite configuration.
- `backend/app/` — API routes, database models, authentication, analytics, and services.
- `backend/alembic/` — database migrations.
- `backend/scripts/` — utility and model verification scripts.
- `docs/` — project documentation and supporting materials.
- `prd.md`, `design.md`, `implementation_plan.md` — product requirements, design, and implementation plan.

## Local development

### Requirements

- Node.js and npm
- Python 3.12 or newer
- PostgreSQL, or SQLite for a local-only database

### Configure and run the backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

The example backend configuration uses PostgreSQL. To use SQLite locally, set `DATABASE_URL=sqlite:///./soulscript_dev.db` in `backend/.env`. Then apply migrations and start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

The health endpoint is `http://127.0.0.1:8001/api/health`.

### Configure and run the frontend

In a second terminal from the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Vite serves the app at `http://127.0.0.1:5173` and proxies `/api` requests to `http://127.0.0.1:8001` by default. Set `VITE_API_PROXY_TARGET` in `frontend/.env` to use another backend address.

## Configuration

Backend settings are documented in `backend/.env.example`:

- `DATABASE_URL` — SQLAlchemy database URL.
- `EMOTION_MODEL_ID` and `EMOTION_MODEL_REVISION` — model checkpoint and pinned revision.
- `EMOTION_ANALYSIS_MAXIMUM` and `EMOTION_ANALYSIS_WINDOW_SECONDS` — per-client analysis rate limit.
- `WEEKLY_INSIGHT_MIN_ENTRIES` — minimum number of entries before a weekly reflection is available.
- `APP_ENV` and `FRONTEND_ORIGIN` — environment mode and allowed frontend origin.

## Data and privacy notes

AI analysis is requested for saved entries, and personal mood reports remain separate from model predictions. Prediction history records the model revision and the entry content version/hash used for analysis. Editing the entry text makes previous predictions stale; changing a title or mood report does not.

The JSON export includes the account profile, preferences, entries, mood reports, prediction history, and weekly reflections. It excludes password hashes and session credentials. Account deletion removes the account and its related records from the live database. Database snapshots made by an operator or hosting provider are outside the app's deletion mechanism and follow that provider's retention policy.
