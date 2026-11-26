# SoulScript — Implementation Plan

**File:** `implementation_plan.md`  
**Document version:** 1.0  
**Based on:** SoulScript PRD v2.0 and `design.md`  
**Audience:** AI coding agent and solo developer  
**Implementation style:** Incremental, test-driven where practical, AI-assisted

> The PRD defines the product. `design.md` defines the visual behavior. This document defines the recommended build order and technical implementation approach. If a conflict is found, do not silently change product behavior: report it and preserve the PRD unless the project owner approves a change.

---

## 1. Implementation objective

Deliver a secure, responsive web application in which a user can:

1. Register and authenticate.
2. Create, view, edit, search, and delete private journal entries.
3. Request AI emotion analysis for saved entries.
4. Review predictions and submit their own emotion correction.
5. Choose automatic, manual, or default themes.
6. Review dashboard and historical analytics.
7. Generate and revisit weekly reflections.
8. Export and delete their data.
9. Use the deployed application from a browser.

The implementation should favor a **modular monolith**: one React frontend, one FastAPI backend, one PostgreSQL database, and a model inference service/module within the backend. Do not build microservices, queues, or distributed caching for the MVP unless real constraints require them.

---

## 2. Non-negotiable engineering rules

1. Never build all features in one large code-generation request.
2. Inspect the existing repository before creating or modifying files.
3. Implement one vertical slice at a time.
4. Do not overwrite working code without explaining why.
5. Do not introduce dependencies without a concrete need.
6. Do not hardcode secrets, credentials, user IDs, model results, or analytics values.
7. Every private backend query must be scoped to the authenticated user.
8. Save an entry before attempting model inference.
9. Preserve saved content when inference or network operations fail.
10. Mark an analysis stale when the analyzed entry content changes.
11. Keep AI predictions separate from user-reported feelings.
12. Build real empty, loading, error, and success states.
13. Run tests and manually verify each completed feature.
14. Commit working increments to Git.
15. Do not claim a feature is complete unless it has been tested or its unverified status is stated.

---

## 3. Locked MVP stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + Vite | SPA and user interface |
| Styling | Tailwind CSS + CSS variables | Responsive layout and theme engine |
| Routing | React Router | Public and protected navigation |
| Charts | Recharts | Analytics visualization |
| API client | Fetch wrapper or Axios | Centralized HTTP calls and errors |
| Backend | Python + FastAPI | REST APIs and business logic |
| Validation | Pydantic | Input and output schemas |
| ORM | SQLAlchemy | Database models and queries |
| Migrations | Alembic | Schema versioning |
| Database | PostgreSQL | Persistent application data |
| AI | Hugging Face Transformers | Pretrained emotion classification |
| Testing | Pytest | Backend unit and API tests |
| Frontend tests | Vitest + React Testing Library (recommended) | Component and UI behavior |
| Version control | Git + GitHub | History and collaboration |
| Cloud | Azure App Service, Azure Database for PostgreSQL; Blob Storage only if needed | Deployment and optional exports |

Use compatible, currently supported package versions. Pin dependencies after a working baseline is established. Do not assume a model/provider or cloud service is free; check availability and cost before deployment.

---

## 4. Architecture and code boundaries

### 4.1 High-level architecture

```text
Browser
  └── React + Vite
        ├── Pages and reusable components
        ├── Auth state
        ├── Theme state
        └── API service layer
              │ HTTPS / JSON
              ▼
        FastAPI application
          ├── API routers
          ├── Authentication / authorization
          ├── Pydantic schemas
          ├── Application services
          │    ├── Journal service
          │    ├── Emotion service
          │    ├── Analytics service
          │    ├── Insight service
          │    └── Export service
          ├── SQLAlchemy models/repositories
          └── PostgreSQL
```

For local model inference, load the model once per backend process or use a controlled lazy-load mechanism. Never reload a large model for every request.

### 4.2 Suggested repository structure

```text
soulscript/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── router.jsx
│   │   │   └── providers.jsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── navigation/
│   │   │   ├── journal/
│   │   │   ├── emotions/
│   │   │   ├── analytics/
│   │   │   └── insights/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   ├── entryService.js
│   │   │   ├── emotionService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── insightService.js
│   │   │   └── preferenceService.js
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── errors.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── PRD.md
│   ├── design.md
│   ├── implementation_plan.md
│   └── app_flow.md
├── .gitignore
└── README.md
```

Adjust names if needed, but keep presentation, API handling, business logic, and persistence responsibilities separate.

---

## 5. Implementation decisions that close PRD gaps

The following are recommended MVP decisions. They are not additional product features; they make ambiguous requirements implementable.

| Area | MVP decision |
|---|---|
| Authentication | Backend-managed opaque session cookie unless a managed provider is chosen. Store only session-token hashes in DB. |
| Registration | Successful registration automatically establishes a session and routes to Dashboard. |
| Login | Use a generic invalid-credentials message. |
| Password reset | Excluded from MVP unless a real email provider is configured. |
| Session storage | HttpOnly, Secure in production, appropriate SameSite, expiry, logout revocation. |
| CSRF | Protect cookie-authenticated state-changing requests with CSRF token and Origin checks. |
| Week boundary | Monday 00:00 to next Monday 00:00 in the user's configured timezone. Store the IANA timezone in user preferences; default to browser timezone on first use, with a safe fallback. |
| Date storage | Store timestamps in UTC; convert to/from user timezone for date-range aggregation. |
| Self-reported mood | Keep initial `journal_entries.self_reported_mood` separate from later `emotion_feedback.reported_emotion`. For comparison, use the latest explicit user report: feedback if present, otherwise the entry's initial self-reported mood. Document this rule in analytics. |
| Prediction history | Retain each completed analysis as a new prediction record. Mark predictions stale when content changes. Analytics uses latest non-stale prediction only. |
| Stale detection | Store a SHA-256 hash of analyzed content or a content version identifier; compare with current content. Do not rely only on timestamp precision. |
| Model execution | Synchronous/on-demand in MVP; preserve entry independently. A worker queue is future work if latency requires it. |
| Weekly insight | Deterministic/rule-based for MVP. No LLM required. |
| Weekly minimum data | Use a configurable threshold, initially 3 entries in a selected week. Return `insufficient_data` below threshold. This is a product threshold, not a scientifically validated standard. |
| Weekly regeneration | Upsert one current summary per user/week. Mark summary stale after entry/prediction/feedback changes in its period. |
| Export | Synchronous JSON download for small MVP datasets. Do not add export job APIs unless needed. |
| Caching | No dedicated cache initially. Use database indexes and aggregation queries. Add caching only after measuring repeated expensive queries. |
| Theme trigger | Theme mode and preference are global; automatic suggestion can be applied from the latest explicitly analyzed/current entry. Do not let opening an old entry unexpectedly change the global theme. |
| Topic extraction | Lightweight frequent-keyword approach for MVP; no claims of semantic topic understanding. |
| Timezone | Store an IANA timezone in user preferences or derive it from the browser and submit it consistently. |

If the project owner chooses a different behavior, update this table and related code/tests together.

---

## 6. Data model implementation

Use UUID primary keys, foreign keys, constraints, timestamps, and Alembic migrations.

### 6.1 `users`

Fields:
- `id` UUID PK.
- `email` normalized and unique.
- `password_hash` if local authentication.
- `created_at`, `updated_at`.

### 6.2 `sessions` (if backend-managed sessions)

Fields:
- `id` UUID PK.
- `user_id` FK.
- `token_hash` unique.
- `created_at`, `expires_at`, `revoked_at`.

Never persist raw cookie tokens.

### 6.3 `journal_entries`

Fields:
- `id` UUID PK.
- `user_id` FK, indexed.
- `title` nullable.
- `content` text.
- `self_reported_mood` nullable.
- `created_at`, `updated_at`.
- Optional `content_version` integer or content hash strategy.

Indexes:
- `(user_id, created_at DESC)`.
- Foreign-key index on `user_id`.

### 6.4 `emotion_predictions`

Fields:
- `id` UUID PK.
- `entry_id` FK, indexed.
- `model_name`.
- `model_version` nullable.
- `predicted_label`.
- `scores` JSONB.
- `analyzed_content_hash`.
- `analyzed_at`.

Keep historical predictions. Latest valid prediction is selected by timestamp/ID and must match current content hash to be non-stale.

### 6.5 `emotion_feedback`

Fields:
- `id` UUID PK.
- `entry_id` FK, indexed.
- `reported_emotion`.
- `created_at`, `updated_at`.

MVP rule: one current feedback record per entry (unique `entry_id`) that can be updated by the owner. If feedback history is desired, remove uniqueness and select latest record consistently.

### 6.6 `user_preferences`

Fields:
- `id` UUID PK.
- `user_id` unique FK.
- `theme_mode` enum/string: `auto`, `manual`, `default`.
- `selected_theme`.
- `adaptive_theme_enabled` boolean, or derive it from `theme_mode`; do not allow contradictory values.
- `timezone` IANA string.
- `updated_at`.

### 6.7 `weekly_insights`

Fields:
- `id` UUID PK.
- `user_id` FK.
- `week_start` date.
- `week_end` date.
- `summary` text.
- `statistics` JSONB.
- `reflection_prompts` JSONB.
- `source_fingerprint` or `source_updated_at`.
- `generated_at`.
- `status` such as `ready`, `insufficient_data`, `stale`.

Constraint: unique `(user_id, week_start)` for one current summary per user/week.

### 6.8 Deletion rules

- Deleting an entry removes its predictions and feedback.
- Deleting an entry marks relevant weekly summaries stale.
- Deleting a user removes preferences, entries, predictions, feedback, insights, and sessions, or schedules deletion in a clearly documented process.
- Respect actual backup-retention constraints; do not claim backups are erased immediately if they are not.

---

## 7. Backend implementation

### 7.1 Configuration

Create settings using environment variables. Required examples:

```env
DATABASE_URL=
SESSION_SECRET=
FRONTEND_ORIGIN=http://localhost:5173
ENVIRONMENT=development
MODEL_ID=j-hartmann/emotion-english-distilroberta-base
MODEL_REVISION=
MAX_ENTRY_CHARACTERS=
SESSION_TTL_HOURS=
```

Optional provider settings must be added only if used. Never commit real values.

### 7.2 FastAPI application

`main.py` should:
- Create the FastAPI app.
- Register routers.
- Configure CORS for exact allowed origin(s).
- Add safe exception handlers.
- Add a health endpoint.
- Configure startup/shutdown for resources such as model lifecycle if needed.

Do not place all business logic in route functions.

### 7.3 API routers

Recommended routers:
- `auth.py`
- `users.py`
- `entries.py`
- `emotions.py`
- `analytics.py`
- `insights.py`
- `preferences.py`
- `exports.py`

Each route should:
1. Parse and validate request.
2. Require correct authentication/authorization.
3. Call a service method.
4. Return a schema.
5. Map known errors to consistent HTTP status codes.

### 7.4 Services

- `auth_service.py`: registration, login, session create/revoke.
- `journal_service.py`: entry operations and ownership.
- `emotion_service.py`: text validation, model adapter, prediction persistence.
- `analytics_service.py`: aggregations and date ranges.
- `insight_service.py`: weekly aggregation, deterministic text, stale logic.
- `preference_service.py`: preference validation and persistence.
- `export_service.py`: user's export serialization.

### 7.5 Repository/database layer

Use SQLAlchemy sessions with a predictable lifecycle. Keep database sessions request-scoped. Use transactions for related writes. Avoid leaking ORM objects directly as API responses; serialize through Pydantic response schemas.

### 7.6 Error handling

Create consistent domain errors:
- `AuthenticationRequired`
- `ResourceNotFound`
- `ValidationProblem`
- `ModelUnavailable`
- `RateLimitExceeded`
- `Conflict`

Do not expose tracebacks or SQL messages to the client. Log request IDs and safe metadata, not raw journal content.

---

## 8. Frontend implementation

### 8.1 App startup sequence

1. Load app configuration.
2. Initialize router and global providers.
3. Call `GET /api/me`.
4. If valid, load preferences and show protected layout.
5. If unauthenticated, show public routes.
6. During session check, display a neutral loading screen rather than flashing protected content.

### 8.2 API client

Create one API client that:
- Uses configured base URL.
- Sends cookies (`credentials: "include"` when using cookie sessions).
- Adds CSRF token to state-changing requests as designed.
- Parses JSON or file responses.
- Normalizes error messages.
- Does not log sensitive request bodies.

### 8.3 State ownership

- Authentication state: provider/context or equivalent.
- Theme preferences/effective theme: one ThemeProvider.
- Page state: local component state or feature hook.
- Server data: use a deliberate fetching strategy; avoid duplicating stale server data in multiple global stores.
- Journal editor content: local state until saved; preserve on errors.

### 8.4 Suggested pages

- `LandingPage`
- `LoginPage`
- `RegisterPage`
- `DashboardPage`
- `JournalEditorPage`
- `JournalHistoryPage`
- `EntryDetailPage`
- `AnalyticsPage`
- `WeeklyInsightsPage`
- `SettingsPage`

### 8.5 Suggested hooks

- `useAuth`
- `useTheme`
- `useEntries`
- `useEntry`
- `useEmotionAnalysis`
- `useAnalytics`
- `useWeeklyInsights`
- `usePreferences`

Use hooks only when they improve reuse or isolate feature logic. Avoid overengineering.

---

## 9. API implementation checklist

Implement the API contract from the PRD. The table below is the build checklist.

| Method | Endpoint | Dependency / implementation notes |
|---|---|---|
| POST | `/api/auth/register` | Public; validate email/password; hash password; create user and session. |
| POST | `/api/auth/login` | Public; verify credentials; set secure session cookie; rate limit. |
| POST | `/api/auth/logout` | Authenticated; revoke session and clear cookie. |
| GET | `/api/me` | Authenticated; return safe user profile. |
| GET | `/api/entries` | Authenticated; user-scoped filtering, search, pagination, latest prediction summary. |
| POST | `/api/entries` | Authenticated; create entry using user ID from session. |
| GET | `/api/entries/{entry_id}` | Authenticated; owner-scoped detail. |
| PATCH | `/api/entries/{entry_id}` | Authenticated; owner-scoped partial update; mark analysis stale on content change. |
| DELETE | `/api/entries/{entry_id}` | Authenticated; owner-scoped cascade/cleanup; mark insight stale. |
| POST | `/api/entries/{entry_id}/analyze` | Authenticated; owner-scoped inference; persist model output and content hash. |
| GET | `/api/entries/{entry_id}/emotions` | Authenticated; owner-scoped prediction history/current result. |
| PUT | `/api/entries/{entry_id}/feedback` | Authenticated; owner-scoped current user feedback; do not overwrite prediction. |
| GET | `/api/analytics/moods` | Authenticated; aggregate current user's latest non-stale predictions. |
| GET | `/api/analytics/trends` | Authenticated; date buckets and timezone handling. |
| GET | `/api/analytics/activity` | Authenticated; entry counts by period. |
| GET | `/api/analytics/comparison` | Authenticated; compare prediction with latest user report, show denominator. |
| GET | `/api/insights/weekly` | Authenticated; get summary for week. |
| POST | `/api/insights/weekly/generate` | Authenticated; calculate and upsert deterministic weekly summary. |
| GET | `/api/insights/history` | Authenticated; paginated summary list. |
| GET | `/api/preferences` | Authenticated; return theme and timezone preferences. |
| PATCH | `/api/preferences` | Authenticated; validate and update preferences. |
| POST | `/api/export` | Authenticated; synchronous JSON export for MVP. |
| DELETE | `/api/me` | Authenticated + re-auth/confirmation; delete account and dependent data. |

Every endpoint requires:
- Pydantic validation.
- Correct response schema.
- Error handling.
- Ownership tests where applicable.
- No user ID trust from request body.
- Appropriate rate limiting for auth/export/inference.

---

## 10. Frontend implementation checklist

### 10.1 Global
- Public/protected layouts.
- Router and redirect handling.
- Auth session restoration.
- Theme provider.
- Reusable buttons, fields, cards, modal, toast, spinner/skeleton, empty state, and error state.
- Responsive sidebar/mobile navigation.

### 10.2 Landing and authentication
- Landing hero and feature summary.
- Register form.
- Login form.
- Client validation and server-error rendering.
- Session restore and logout.

### 10.3 Journal
- Create entry.
- Save and preserve on error.
- Optional self-reported mood.
- List/history.
- Search/date/emotion filter.
- Detail/edit/delete.
- Stale analysis indicator.
- Prediction card and feedback form.

### 10.4 Theme
- Theme token map.
- Automatic/manual/default modes.
- Preference persistence.
- No flash on initial load.
- Accessible contrast in palettes.

### 10.5 Dashboard and analytics
- Dashboard cards use real APIs.
- No mock values in production.
- Date filters are shared and consistent.
- All charts have labels and explanatory captions.
- Empty states are designed.

### 10.6 Weekly insights
- Week selector.
- Summary view.
- Generate/retry.
- Insufficient-data state.
- History list.
- Supporting entry links.

### 10.7 Settings
- Appearance preferences.
- Account details.
- Export.
- Delete entries/account.
- Privacy and AI disclosure.

---

## 11. Build order and detailed tasks

Do not skip phases. Each phase ends with a working checkpoint.

### Phase 0 — Repository and project setup

Tasks:
1. Inspect repository and current files.
2. Create Git repository if absent.
3. Create `frontend`, `backend`, and `docs`.
4. Add `.gitignore`.
5. Add root README placeholder.
6. Add `.env.example` files.
7. Initialize React + Vite.
8. Initialize FastAPI.
9. Configure PostgreSQL local connection.
10. Add a `/api/health` endpoint.

Deliverable: frontend and backend both run locally.

Verification:
- Frontend development server opens.
- Backend health endpoint returns `{"status":"healthy"}`.
- No secrets are tracked by Git.

### Phase 1 — Design system and app shell

Tasks:
1. Define CSS variables and typography.
2. Build Button, Input, Card, Badge, Modal, Toast, Loading, Empty, and Error components.
3. Build PublicLayout.
4. Build ProtectedLayout.
5. Build desktop sidebar and mobile navigation.
6. Add route placeholders for all pages.
7. Implement basic responsive behavior.

Deliverable: navigable, visually coherent shell using temporary content only.

Verification:
- Routes render.
- Active nav state works.
- Mobile navigation works.
- Keyboard focus is visible.

### Phase 2 — Database and authentication

Tasks:
1. Create SQLAlchemy base and session dependency.
2. Create User model.
3. Create Session model if using backend-managed sessions.
4. Configure Alembic.
5. Add initial migration.
6. Implement password hashing.
7. Implement register/login/logout/me.
8. Set secure cookie configuration.
9. Add CSRF strategy for state-changing cookie-authenticated requests.
10. Add protected route dependency.
11. Add frontend AuthProvider and route guards.
12. Test session restoration.

Deliverable: working registration, login, logout, and protected shell.

Verification:
- Two users can register.
- Invalid login fails safely.
- Refresh retains a valid session.
- Logout revokes session.
- Guest cannot access protected API.

### Phase 3 — Journal CRUD vertical slice

Tasks:
1. Create JournalEntry model and migration.
2. Create Pydantic schemas.
3. Implement create/list/detail/update/delete services and APIs.
4. Apply per-user ownership checks to every query.
5. Add pagination/search/date filters.
6. Build JournalEditor.
7. Build JournalHistory and EntryDetail pages.
8. Connect frontend service methods.
9. Add save/loading/error/success states.
10. Add delete confirmation modal.

Deliverable: complete private journal without AI.

Verification:
- Create entry, refresh, and retrieve.
- Edit and delete.
- Search and filter.
- Confirm User A cannot access User B's entry.

### Phase 4 — Emotion inference

Tasks:
1. Review model card, license, language, labels, size, and runtime.
2. Test model independently with representative sample texts.
3. Create model adapter/service.
4. Load model once per worker/process.
5. Add prediction model/table and migration.
6. Add analyze endpoint.
7. Add get-emotions endpoint.
8. Add content hash/version to predictions.
9. Add stale detection after content edits.
10. Build prediction card.
11. Add analysis progress and retry states.
12. Add rate limiting and safe inference errors.

Deliverable: saved entries can be analyzed.

Verification:
- Analysis is saved.
- Prediction includes model name, scores, and timestamp.
- Editing text makes prior result stale.
- Model failure does not remove entry.
- No raw journal text appears in ordinary logs.

### Phase 5 — Feedback and adaptive theme

Tasks:
1. Add EmotionFeedback model/table and migration.
2. Add feedback schema and endpoint.
3. Keep user report separate from AI prediction.
4. Define supported labels and “other/prefer not to say” behavior if included.
5. Add ThemeProvider.
6. Build theme token maps.
7. Implement auto/manual/default modes.
8. Load and persist preferences.
9. Build theme picker and preview.
10. Add feedback form to EntryDetail.

Deliverable: user can correct prediction and control appearance.

Verification:
- Feedback does not overwrite prediction.
- Manual theme remains selected.
- Default mode disables adaptation.
- Preference persists after relogin.
- All palettes remain readable.

### Phase 6 — Dashboard and analytics

Tasks:
1. Define analytics semantics and timezone behavior.
2. Implement mood distribution query/endpoint.
3. Implement trend aggregation.
4. Implement journal activity aggregation.
5. Implement prediction-versus-report comparison.
6. Add frontend chart components.
7. Build dashboard.
8. Build analytics page and date selector.
9. Add loading/empty/error states.
10. Verify all analytics use authenticated user scope.

Deliverable: dashboard and charts use real data.

Verification:
- Compare endpoint results with known database fixtures.
- Test empty and boundary date ranges.
- Test cross-user isolation.
- Ensure comparison denominator is correct.

### Phase 7 — Weekly insights

Tasks:
1. Add WeeklyInsight model and migration.
2. Define week boundary and timezone rules.
3. Define configurable minimum-entry threshold.
4. Implement aggregation service.
5. Implement recurring keyword extraction for MVP.
6. Implement deterministic summary templates.
7. Implement weekly get/generate/history endpoints.
8. Implement summary upsert and stale invalidation.
9. Build WeeklyInsights page.
10. Add supporting entry links and insufficient-data state.

Deliverable: user can generate and revisit weekly reflections.

Verification:
- Only entries within selected week are used.
- Only authenticated user's entries are used.
- Insufficient-data response is correct.
- Edited/deleted entries invalidate summary.
- Summary does not invent causes or events.

### Phase 8 — Settings, export, deletion

Tasks:
1. Implement preferences GET/PATCH.
2. Build settings appearance section.
3. Implement synchronous JSON export.
4. Exclude password hashes, session secrets, and internal credentials.
5. Ensure export includes only current user's records.
6. Implement account deletion confirmation/re-auth.
7. Delete dependent records and invalidate sessions.
8. Document backup retention behavior.
9. Build privacy and AI disclosure section.

Deliverable: user data controls work.

Verification:
- Export user A does not contain user B records.
- Deleted entry and dependent feedback/predictions are removed.
- Deleted account cannot reuse a session.
- Export contains no credentials.

### Phase 9 — Quality, security, and testing

Tasks:
1. Add unit tests for services.
2. Add integration tests for endpoints.
3. Add authorization regression tests.
4. Test validation and error status codes.
5. Test AI service unavailable.
6. Test analytics date boundaries.
7. Test stale predictions and summaries.
8. Test responsive page behavior.
9. Check keyboard navigation and color contrast.
10. Review logs, CORS, CSRF, cookies, rate limits, and secrets.
11. Run dependency/security checks appropriate to the toolchain.
12. Fix all P0 bugs.

Deliverable: release candidate.

Verification:
- All acceptance criteria pass.
- No known cross-user data leak.
- Critical paths are tested.

### Phase 10 — Deployment

Tasks:
1. Review cloud pricing and available student credits.
2. Provision production PostgreSQL.
3. Configure database access restrictions.
4. Configure secrets/environment variables.
5. Deploy FastAPI.
6. Apply Alembic migrations.
7. Deploy Vite frontend.
8. Configure frontend API base URL and exact CORS origin.
9. Configure HTTPS and health checks.
10. Verify registration, journal, analysis, analytics, insights, export, and deletion.
11. Review backups and cleanup unused cloud resources.

Deliverable: public demo URL.

Verification:
- Production workflow succeeds from a clean browser session.
- Secrets are not exposed in frontend bundle.
- Data persists.
- Cross-user authorization remains enforced.

### Phase 11 — Capstone documentation

Tasks:
1. Finalize README.
2. Create system architecture diagram.
3. Create ER diagram.
4. Document API routes.
5. Record test cases and results.
6. Evaluate emotion model using suitable labeled data.
7. Document model limitations.
8. Capture synthetic-data screenshots.
9. Prepare five-minute demo path.
10. Clearly distinguish implemented features from future work.

Deliverable: submission-ready project package.

---

## 12. Testing plan

### 12.1 Backend unit tests
- Email normalization.
- Password hash verification.
- Entry validation.
- Prediction normalization.
- Stale prediction detection.
- Theme mapping if server-side.
- Week boundary calculation.
- Analytics aggregation.
- Weekly summary generation.
- Export serialization.

### 12.2 API integration tests
- Registration and login.
- Logout and session expiry.
- Create/list/detail/update/delete entry.
- Analyze entry and persist result.
- Submit feedback.
- Preference GET/PATCH.
- Analytics date filtering.
- Weekly summary get/generate/history.
- Export and account deletion.

### 12.3 Authorization tests
For User A and User B:
- A cannot GET B's entry.
- A cannot PATCH B's entry.
- A cannot DELETE B's entry.
- A cannot analyze B's entry.
- A cannot submit feedback for B's entry.
- A cannot view B's analytics or insights.
- A cannot export B's data.

### 12.4 Frontend tests
- Form validation.
- Navigation and route guards.
- Loading/error/empty/success states.
- Save text preservation after failure.
- Theme mode precedence.
- Prediction stale label.
- Date filter interactions.
- Delete confirmation behavior.

### 12.5 End-to-end critical flow
Register → login → create entry → save → analyze → change theme mode → add feedback → view analytics → generate weekly insight → export → delete entry → logout.

---

## 13. Definition of done for every feature

A feature can be marked complete only when:
- Requirements and expected behavior are clear.
- Implementation is in the correct layer.
- Authentication/authorization are applied where required.
- Validation and error handling exist.
- Loading, empty, and success states are implemented where relevant.
- Automated tests or documented manual tests pass.
- No secrets or real journal data are committed.
- The coding agent reports the files changed and commands/tests run.
- Any incomplete behavior or limitation is documented.
- A Git commit records the working state.

---

## 14. Coding-agent workflow and prompt protocol

For every task, the agent must follow this sequence:

### Step A — Inspect
- Read `PRD.md`, `design.md`, `implementation_plan.md`, and relevant `app_flow.md` section.
- Inspect current file structure and related code.
- Identify existing patterns and dependencies.
- Do not recreate existing functionality.

### Step B — Plan
Return:
- The exact feature being implemented.
- Files expected to change.
- API/model dependencies.
- Potential security and data-integrity risks.
- Tests to add or update.

### Step C — Implement
- Make the smallest coherent change.
- Reuse existing components and services.
- Do not refactor unrelated files.
- Do not introduce optional features.

### Step D — Verify
- Run formatting/linting if configured.
- Run relevant tests.
- Start the affected service or describe why it could not be started.
- Verify UI behavior or endpoint response.
- Check logs for errors.

### Step E — Report
Return:
1. What was implemented.
2. Files created/modified.
3. Tests/commands run and results.
4. Known issues or unverified assumptions.
5. Recommended next task from this plan.

### Agent prompt template

```text
You are implementing SoulScript according to the project documents.

Before coding:
1. Read PRD.md, design.md, implementation_plan.md, and app_flow.md.
2. Inspect the repository and relevant existing code.
3. Identify the exact task and its acceptance criteria.
4. List the files you intend to change and any risks.

Implement only this task. Follow the existing architecture and design.
Do not add unrelated features, replace working code unnecessarily,
hardcode data, or expose secrets. Enforce user ownership on every
private data operation.

After coding:
1. Run the relevant tests and checks.
2. Report files changed.
3. Explain important implementation decisions.
4. State what was tested and what remains unverified.
5. Do not claim success if the feature was not run or tested.

Current task:
[INSERT ONE TASK FROM THIS PLAN]
```

---

## 15. Risk register

| Risk | Mitigation |
|---|---|
| Too many features delay completion | Enforce P0-first sequencing and defer P2 work. |
| AI predictions are misleading | Use cautious UI language, correction controls, and evaluation. |
| Private records leak across users | User-scoped queries, authorization tests, and security review. |
| Model inference is slow | Load once, show progress, keep save independent, move to worker only if needed. |
| Generated code is inconsistent | Agent must inspect existing patterns and make small changes. |
| Analytics become misleading | Define calculation semantics and test against fixtures. |
| Weekly summary invents insights | Use deterministic facts and cautious templates in MVP. |
| Cloud cost rises | Review plans, use credits carefully, stop unused services. |
| Model/provider terms change | Recheck model card, license, and service limits before deployment. |

---

## 16. Release gate

Do not call SoulScript capstone-ready until:
- P0 requirements are implemented.
- All critical user flows in `app_flow.md` pass.
- Cross-user authorization tests pass.
- Journal CRUD works in production.
- AI failure does not compromise saved entries.
- Themes respect user preference.
- Analytics are verified against database fixtures.
- Weekly summaries are grounded in data.
- Export/deletion behavior is tested.
- Responsive and accessibility basics are reviewed.
- Deployment and README setup instructions work.
- The demo uses synthetic journal content, not private real entries.
