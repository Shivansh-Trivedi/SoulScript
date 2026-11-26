# SoulScript

SoulScript is a private journaling website with optional AI-assisted emotion reflection. The product is built as a React/Vite frontend, a FastAPI backend, and PostgreSQL persistence.

## Project layout

- `frontend/` — React website and Vite development server.
- `backend/` — FastAPI application and database configuration.
- `docs/` — project specifications (the original Markdown documents remain at the repository root).

## Phase 0 status

The initial source structure and health endpoint are in place. Local execution requires Node.js/npm, Python dependencies, and a PostgreSQL server. See each app's `.env.example` for configuration. See `implementation_plan.md` for the product requirements and subsequent phases.

## Local development

1. Install Node.js (LTS), Python 3.12 or newer, and PostgreSQL for the target database.
2. Copy `frontend/.env.example` and `backend/.env.example` to `.env` files in their respective folders and configure the database URL. If PostgreSQL is not installed yet, SQLite can be used locally with `DATABASE_URL=sqlite:///./soulscript_dev.db`.
3. Install frontend dependencies with `npm install` in `frontend/`.
4. Install backend dependencies in a virtual environment from `backend/requirements.txt`.
5. Apply the schema with `alembic upgrade head` from `backend/`.
6. Start the API with `uvicorn app.main:app --reload` from `backend/`.
7. Start the website with `npm run dev` from `frontend/`.

The health endpoint is `GET /api/health`.

## Emotion analysis (Phase 4)

The backend runs the English-only `j-hartmann/emotion-english-distilroberta-base` model locally through Transformers and CPU PyTorch. The first analysis downloads the pinned model revision (about 329 MB of PyTorch weights) and caches it; each backend process loads it once on its first analysis. Expect the first request to take longer. Journal text is not sent to an inference API.

The model returns scores for anger, disgust, fear, joy, neutral, sadness, and surprise. The model card reports 66% accuracy on its balanced evaluation subset; this is not a guarantee about an individual entry or a clinical assessment. The public model card does not declare a license, so confirm distribution and commercial-use rights before deploying this model in a production product.

After applying migrations, open a saved entry and choose **Analyze entry**. Results and their model revision, timestamp, content version, and content hash are saved as prediction history. Editing entry text marks prior results stale; title or self-reported-mood edits do not. Inference failures leave saved journal entries intact. The analyze endpoint is limited to 10 requests per client IP per hour by default; adjust `EMOTION_ANALYSIS_MAXIMUM` and `EMOTION_ANALYSIS_WINDOW_SECONDS` in the backend environment if needed.

Model details: [Hugging Face model card](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base). It supports English text, was trained on six datasets containing Twitter, Reddit, student self-reports, and TV dialogue, and predicts seven labels. The model card lists no license.

To check model loading and representative predictions independently of the API, run `python -m scripts.verify_emotion_model` from `backend/`. It uses synthetic text and the pinned model revision; the initial run downloads the model if it is not cached.

## Feedback and appearance (Phase 5)

Emotion feedback is stored separately from model predictions, with one editable report per entry. Reports can use a model label, `other`, or `prefer_not_to_say`. User appearance preferences persist as `default`, `manual`, or `auto`; automatic palettes follow the latest explicitly analyzed prediction whose entry content is still current. Apply the new `0004_feedback_preferences` migration before using these features.

## Dashboard and analytics (Phase 6)

Analytics filter by each entry's creation date in the requested IANA timezone. `from` and `to` are inclusive local dates converted to UTC boundaries; the default is the most recent 30 days and requests are limited to 366 days. Mood distribution uses the latest explicit report for each entry (feedback overrides the original report). Trends can show report counts or each entry's latest current, non-stale prediction. Comparison includes only entries with both a current prediction and a report that can be mapped to a model label; calm/tired map to neutral, anxious to fear, frustrated to anger, happy/hopeful/excited/grateful/relieved to joy, and sad to sadness. “Other” and “Prefer not to say” are excluded from the agreement denominator.

## Weekly reflections (Phase 7)

Apply migration `0005_weekly_insights` before using weekly reflections. Weeks run Monday 00:00 through the following Monday 00:00 in the requested IANA timezone, with the end shown as Sunday. The default minimum is three entries and can be changed with `WEEKLY_INSIGHT_MIN_ENTRIES`. Reflections use deterministic templates, the moods a person chose to report, and open-ended questions. They do not infer meaning from repeated word counts or make claims about why an event happened. The API stores a source fingerprint and marks a saved week stale after an entry, feedback, prediction, or reflection format changes; refresh it to see the latest version.

## Privacy, export, and account deletion (Phase 8)

The Settings page can download a JSON copy of the signed-in user's profile, preferences, journal entries, mood reports, AI prediction history, and weekly reflections. Password hashes and session credentials are never exported. Account deletion requires the current password and the exact confirmation phrase; it removes the account and dependent records from the live database and deletes its sessions.

SoulScript does not create or manage database backup snapshots. If an operator or hosting provider creates backups, deleting an account from the live database does not rewrite those snapshots; they remain subject to that operator's documented backup-retention policy. Do not treat live deletion as immediate erasure from external backups.

