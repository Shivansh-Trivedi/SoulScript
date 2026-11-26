# SoulScript — Product Requirements Document (PRD)

**Document version:** 2.0  
**Status:** Product and implementation baseline  
**Product name:** SoulScript  
**Product description:** An AI-powered, emotion-aware journaling and self-reflection platform  
**Domain:** Health / personal wellbeing (non-clinical)  
**Primary users:** Students, young adults, and people who want to journal and reflect on their experiences  
**MVP platform:** Responsive web application  
**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Python + FastAPI  
**Database:** PostgreSQL  
**AI:** Pretrained text emotion-classification model  
**Deployment target:** Microsoft Azure or an equivalent hosting environment, subject to available student credits and budget

---

## 1. Purpose of this document

This PRD is the product source of truth for building SoulScript. It describes:

- The problem SoulScript addresses and the users it serves.
- The complete MVP scope and the behavior of every major feature.
- The application's pages, layouts, navigation, visual design, and UI states.
- End-to-end user journeys.
- The backend API contract, including what every endpoint does, who can call it, its inputs, outputs, business rules, and expected errors.
- The core data entities and their relationships.
- Emotion analysis, adaptive themes, analytics, and weekly insights.
- Privacy, security, accessibility, testing, and acceptance criteria.

The document is written for a solo student developer using AI-assisted coding. Implement the application incrementally. Do not attempt to generate the entire application in one coding-assistant prompt.

### 1.1 Product principles

1. **Writing comes first.** A user must be able to save and revisit journal entries even when AI analysis is unavailable.
2. **AI suggestions are not facts.** An emotion prediction is an estimate about text, not a definitive statement about the person who wrote it.
3. **The user stays in control.** Users can correct predictions, choose their own mood, override themes, and disable adaptive behavior.
4. **Insights must be explainable.** Summaries should be grounded in actual entries and observable patterns. Do not invent causes, events, or psychological conclusions.
5. **Privacy is fundamental.** Journal content is private by default and must never be accessible to another user.
6. **Build a complete MVP before adding novelty.** Do not add voice, image, handwriting, or model-training features until the core product is tested and deployed.

---

## 2. Product overview

SoulScript is a private digital journal with AI-assisted reflection capabilities.

A user creates an account, writes journal entries, optionally records how they personally felt, and can ask the application to estimate emotion categories expressed in the text. SoulScript displays the prediction as an AI estimate, suggests a visual theme, and allows the user to accept or override the suggestion.

Over time, the application uses the user's saved entries and stored predictions to create charts and weekly reflections. The user can compare the model's predictions with their own reported feelings. The product does not diagnose, treat, or monitor mental-health conditions.

### 2.1 One-line description

An AI-powered journal that adapts to your mood, tracks emotional patterns, and transforms personal reflections into meaningful insights.

### 2.2 Product vision

Make personal journaling more engaging and useful for reflection by combining private writing, transparent AI estimates, user-controlled personalization, and historical summaries.

### 2.3 Main differentiators

- Emotion-aware theme suggestions that remain under user control.
- A history of entries, model predictions, and user-reported feelings.
- Longitudinal analytics based on the user's own saved data.
- Weekly summaries that point back to observable records rather than making unsupported psychological claims.

---

## 3. Problem statement

Traditional digital journals provide a place to write but may offer limited tools for reviewing long-term patterns. Users who have written many entries can find it difficult to recall recurring subjects, see how their recorded feelings vary over time, or review their own reflections in a structured way.

SoulScript provides a single workflow for recording experiences, viewing optional AI emotion estimates, organizing entries, reviewing historical trends, and reading weekly summaries.

### 3.1 Target users

| User group | Need |
|---|---|
| Students and young adults | Quickly record daily experiences and review recurring academic, social, or personal topics. |
| Regular journal writers | Organize entries, search history, and review patterns across weeks. |
| Self-reflection users | Compare their own reported feelings with model estimates and revisit supported observations. |

### 3.2 Out of scope

SoulScript is not:
- A mental-health diagnostic tool.
- A therapy or counselling service.
- A crisis-monitoring service.
- A medical recommendation engine.
- A social network or public journal-sharing platform.

Do not use language such as “the AI knows how you feel,” “diagnoses anxiety,” or “detects depression.” Use wording such as “possible emotions in this text” or “AI-estimated emotional tone.”

---

## 4. Goals, success metrics, and release definition

### 4.1 Product goals

1. Allow users to securely create and manage private journal entries.
2. Provide optional emotion classification for saved entries.
3. Suggest adaptive themes without taking control away from the user.
4. Present understandable charts using real user data.
5. Generate weekly reflections grounded in stored information.
6. Let users report their own feelings and compare those reports with AI estimates.
7. Provide privacy, export, and deletion controls.

### 4.2 MVP success measures

| Area | MVP success condition |
|---|---|
| Authentication | A user can register, log in, remain authenticated across page refreshes, and log out. |
| Journal CRUD | A user can create, view, edit, search, and delete their own entries. |
| Persistence | Saved entries remain available after refresh and a later login. |
| Isolation | User A cannot retrieve, change, analyze, export, or delete User B's data. |
| Emotion analysis | A saved entry can be analyzed and the result is stored with model information and timestamp. |
| Failure handling | If inference fails, the entry remains saved and the user can retry. |
| Themes | Automatic suggestion, manual selection, and disabled modes behave as specified. |
| Analytics | Charts represent actual records for the authenticated user and selected period. |
| Weekly insight | Summary content is based on records in the correct week and does not invent events. |
| Responsive UI | Core flows work at desktop, tablet, and mobile widths. |
| Data control | Users can export and request deletion of their data. |

These are functional acceptance targets. Do not invent model-accuracy or performance results. Measure them during testing.

### 4.3 Definition of MVP complete

The MVP is complete when:
- All P0 user journeys in this document work.
- The acceptance criteria in Section 17 pass.
- Automated tests cover core APIs and cross-user authorization.
- The application is deployed to a working URL.
- The README explains local setup.
- The project report includes architecture, ER diagram, endpoint documentation, test evidence, limitations, and screenshots.

---

## 5. Scope and prioritization

### 5.1 P0 — required for MVP

- Landing page and account registration/login/logout.
- Authenticated user session.
- Private journal CRUD.
- Search and date filtering.
- Optional self-reported mood on an entry.
- On-demand AI emotion analysis of a saved entry.
- Storage of prediction label, scores, model ID, and timestamp.
- Emotion-adaptive theme suggestion.
- Manual theme override and adaptive-theme opt-out.
- Dashboard and basic analytics.
- Weekly summary based on deterministic aggregation.
- User emotion correction / self-report comparison.
- User preferences.
- Entry export and deletion controls.
- Authorization, input validation, error handling, and responsive layout.

### 5.2 P1 — complete if time allows after P0

- Advanced recurring-topic extraction.
- Evidence-linked insights that reference dates or selected entries.
- Historical weekly insight archive.
- More theme palettes and user customization.
- Richer filtering and pagination.
- More complete model evaluation report.
- Automated end-to-end browser tests.

### 5.3 P2 — future enhancements, not MVP

- LLM-written weekly summaries.
- Voice journaling and speech-to-text.
- Image attachments and handwriting OCR.
- Image- or voice-based emotion inference.
- Custom model training or personalization.
- Mobile native application.
- Offline synchronization.
- Social sharing or collaboration.

---

## 6. Product terminology

Use these terms consistently in the UI and code.

| Term | Meaning |
|---|---|
| Journal entry | A saved piece of writing created by a user. |
| Self-reported mood | A feeling or emotion the user chooses for themselves. |
| Emotion prediction | An estimate returned by the selected text-classification model. |
| Prediction score | A model output score associated with a label; not a percentage measure of the user's actual feeling. |
| Emotion feedback | A user correction or report associated with an entry. |
| Theme suggestion | A visual theme recommended based on an eligible prediction. |
| Theme preference | The user's selected theme mode and palette. |
| Weekly insight | A summary generated from a defined date range and the user's records. |
| Recurring topic | A repeated keyword or topic detected in text; not proof of importance or causation. |

---

# 7. Information architecture and navigation

## 7.1 Public navigation

Visible to unauthenticated visitors:

- SoulScript logo/name.
- Home or landing page.
- Product features / how it works.
- Privacy statement.
- Sign in.
- Create account.

Keep the public navigation simple. Do not expose journal, analytics, or settings routes to guests.

## 7.2 Authenticated navigation

Desktop sidebar:

1. Dashboard
2. New Entry
3. My Journal
4. Analytics
5. Weekly Insights
6. Settings

The sidebar should show:
- SoulScript logo and name at the top.
- Active navigation item clearly highlighted.
- User avatar or initials and account menu at the bottom.
- A clear “New Entry” primary action.

Mobile navigation:
- Use a compact top bar with the product mark and menu button.
- Show a drawer or bottom navigation for the main destinations.
- Ensure the editor receives adequate vertical space.
- Do not squeeze desktop charts into unreadable mobile layouts.

## 7.3 Route map

| Route | Access | Page |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/register` | Public | Registration |
| `/app/dashboard` | Authenticated | Dashboard |
| `/app/entries/new` | Authenticated | New journal entry |
| `/app/entries/:entryId` | Authenticated | View/edit journal entry |
| `/app/journal` | Authenticated | Journal history |
| `/app/analytics` | Authenticated | Emotional analytics |
| `/app/insights` | Authenticated | Weekly insights |
| `/app/settings` | Authenticated | Preferences and privacy |

If a guest opens an authenticated route, redirect to `/login` and preserve the intended destination for after login. If an authenticated user opens `/login` or `/register`, redirect to `/app/dashboard`.

---

# 8. UI and visual design requirements

## 8.1 Overall art direction

SoulScript should feel like a calm, personal writing space rather than a corporate admin dashboard.

Use:
- A warm neutral base palette.
- One restrained accent color.
- Soft surface contrast.
- Clear typography.
- Comfortable line length and generous writing space.
- Rounded cards with subtle borders.
- Light shadows used sparingly.
- Small, purposeful transitions.
- Consistent icon style.

Avoid:
- Too many gradients.
- Excessive glassmorphism.
- Constant animations.
- Dense dashboard grids.
- High-saturation backgrounds behind long text.
- Using color as the only way to communicate emotion or chart values.

## 8.2 Suggested design tokens

These are initial design values; refine them after testing contrast and readability.

| Token | Purpose | Example |
|---|---|---|
| `--color-bg` | Main page background | Warm off-white |
| `--color-surface` | Cards and editor surfaces | White / near-white |
| `--color-text` | Primary text | Deep charcoal |
| `--color-muted` | Supporting text | Muted gray |
| `--color-primary` | Primary action | Muted violet |
| `--color-border` | Dividers and outlines | Light neutral |
| `--radius-card` | Card rounding | 16–20px |
| `--radius-control` | Input/button rounding | 10–12px |
| `--shadow-card` | Subtle card depth | Low-opacity shadow |

Implement theme palettes as CSS custom properties. Components should consume tokens rather than hardcode emotion colors.

## 8.3 Typography

- Use a highly readable sans-serif for navigation, forms, buttons, and dashboard text.
- A restrained serif or humanist font may be used for the journal-writing surface if readability remains strong.
- Use a clear hierarchy: page title, section heading, card label, body, supporting metadata.
- Keep journal content at a comfortable reading size and line height.
- Do not use decorative type for long passages.

## 8.4 Global UI states

Every data-backed page must support:

- **Loading:** Skeletons or unobtrusive progress indicator.
- **Empty:** Explain what the page will show and provide a next action.
- **Error:** Human-readable message and retry action where appropriate.
- **Success:** Brief confirmation for save, update, export, or delete.
- **Partial data:** Display available data and explain what is not yet available.
- **Offline/network failure:** Preserve unsaved text in local component state and offer retry; do not falsely show a successful save.

Use toast notifications for short confirmations, but keep important validation and errors next to the relevant field or component.

---

# 9. Page-by-page UI specification

## 9.1 Landing page — `/`

### Purpose
Explain SoulScript and lead visitors to registration or login.

### Desktop layout
- Top navigation: brand on the left; “How it works,” “Privacy,” “Sign in,” and primary “Get started” action on the right.
- Hero section: headline, short explanation, primary CTA, secondary “Sign in” link.
- Right side or below hero: product preview showing a journal editor, an example emotion estimate, and a theme preview. Use clearly synthetic sample text.
- Feature section with three cards:
  1. Write privately.
  2. Explore possible emotional patterns.
  3. Reflect on your entries over time.
- “How it works” section with a simple three-step flow.
- Privacy note explaining that predictions are estimates and the platform is not a diagnostic tool.
- Footer with product name, privacy link, and contact/project information if available.

### Mobile layout
- Brand and menu at top.
- Hero content stacked vertically.
- CTA buttons full-width where appropriate.
- Preview card below hero text.
- Feature cards in one column.

### Behavior
- “Get started” opens `/register`.
- “Sign in” opens `/login`.
- Public product links scroll to sections or open relevant pages.
- Do not show real user content in the preview.

### Acceptance
A first-time visitor can understand the product purpose and reach registration or login in one action.

## 9.2 Registration page — `/register`

### Layout
A centered authentication card with:
- SoulScript wordmark.
- Heading: “Create your private space.”
- Email field.
- Password field with show/hide control.
- Confirm password field if local password registration is used.
- Terms/privacy acknowledgement if required by the chosen deployment.
- Primary “Create account” button.
- Link to sign in.
- Short privacy reassurance.

### Validation
- Email is required and must be valid.
- Password must meet the configured minimum policy.
- Confirmation must match if present.
- Duplicate email returns a clear message.
- Trim whitespace from email; normalize case for comparison.
- Do not disclose sensitive account details beyond what is needed.

### States
- Idle.
- Submitting.
- Validation error.
- Server/network error.
- Success and redirect.

### Behavior
After successful registration, either create a session and route to dashboard or route to login, depending on the chosen auth flow. Use one behavior consistently and document it.

## 9.3 Login page — `/login`

### Layout
Same visual language as registration:
- Email.
- Password.
- Show/hide password.
- “Remember me” only if the session design supports it safely.
- “Sign in” button.
- Link to registration.

### Behavior
- Invalid credentials show a generic authentication error.
- Successful login establishes the session and redirects to the requested protected route or dashboard.
- Repeated failed attempts should be rate-limited.
- Do not store passwords or session secrets in browser localStorage.

## 9.4 Dashboard — `/app/dashboard`

### Purpose
Provide a quick overview and a clear path to writing.

### Desktop layout
**Top area**
- Greeting such as “Welcome back.”
- Current date.
- Primary “Write an entry” button.

**Main content grid**
- Large “Recent entries” panel on the left.
- “This week” summary card on the right.
- Emotion distribution or recent trend chart below.
- Latest weekly insight preview.
- Optional “Continue writing” draft card only if draft persistence is implemented.

### Components
1. **New entry CTA:** Opens `/app/entries/new`.
2. **Recent entries:** Shows up to a small number of recent entries with title, date, short excerpt, and prediction badge only when a prediction exists.
3. **Weekly activity:** Number of entries written in the current week.
4. **Emotion summary:** Entry-level distribution of the latest available predictions for the selected period.
5. **Latest insight:** A brief excerpt, period, and “View insight” link.
6. **Empty-state onboarding:** If no entries exist, invite the user to write the first entry. Do not show fabricated mood statistics.

### Behavior
- Dashboard API requests are scoped to the authenticated user.
- Clicking an entry opens its detail/edit page.
- Clicking “View analytics” opens Analytics.
- Clicking “View insight” opens Weekly Insights.
- If the user has no analyzed entries, show a prompt to analyze an existing entry rather than an empty or invented chart.

## 9.5 New journal entry — `/app/entries/new`

### Purpose
Provide a focused writing experience.

### Desktop layout
- Breadcrumb or back link to Journal.
- Main editor column, ideally wider than the side panel.
- Optional side panel for self-reported mood and privacy reminder.
- Title input at the top.
- Large, distraction-free text area.
- Word count below editor.
- Self-reported mood selector clearly labelled “How did you feel?” and optional.
- Primary “Save entry” button.
- Secondary “Save and analyze” action may be offered, but it must save first and then analyze.
- Do not automatically switch theme while the user is typing.

### Mobile layout
- Title input.
- Full-width writing area.
- Mood selector below writing area.
- Fixed or easily reachable save action that does not cover content.

### Validation
- Content is required.
- Trim leading/trailing whitespace for validation, but preserve intentional paragraph formatting.
- Define and enforce a maximum entry length compatible with the selected model and backend limits.
- Title is optional and has a reasonable length limit.
- Self-reported mood is optional.

### Save behavior
1. User enters text.
2. User clicks Save.
3. Frontend submits the entry.
4. Backend authenticates and validates.
5. Backend saves entry in PostgreSQL.
6. Backend returns saved entry ID and timestamps.
7. Frontend displays success and routes to the entry detail page or journal history.

If save fails, keep the entered text in the editor and display an error. Never clear the editor on a failed request.

### Save-and-analyze behavior
1. Save the entry first.
2. After successful save, call the analyze endpoint.
3. Show analysis progress.
4. If analysis succeeds, display results.
5. If analysis fails, retain the saved entry and offer retry.

## 9.6 Journal detail/edit page — `/app/entries/:entryId`

### Purpose
Read, update, analyze, and review a specific entry.

### Layout
- Back link to Journal.
- Entry title and date.
- Edit form or read mode.
- Entry content.
- Self-reported mood.
- Emotion analysis card.
- Theme suggestion preview if a prediction exists.
- Action menu: Edit, Delete.
- “Analyze entry” or “Re-analyze” button.
- Feedback section showing AI prediction separately from user-reported emotion.

### Prediction card
Display:
- Label such as “AI-estimated emotions.”
- Dominant predicted label.
- Other returned labels with scores in a visually restrained way.
- Model analysis date.
- Small note: “These are estimates from the wording of your entry, not a definitive reading of how you feel.”

Do not describe score values as percentages of the user's emotional state.

### Edit behavior
- User selects Edit.
- Form becomes editable.
- User saves changes.
- Backend updates `updated_at`.
- If content changes, mark existing analysis as potentially stale and offer re-analysis. Do not silently present an old prediction as if it analyzes the edited content.
- A simple MVP approach is to mark the existing prediction as “Analysis from previous version” until re-analysis completes.

### Delete behavior
- User selects Delete.
- Confirmation dialog displays the entry title/date and says associated predictions and feedback will also be removed according to the deletion policy.
- Confirm triggers DELETE endpoint.
- On success, return to Journal and show confirmation.
- Cancel leaves the entry unchanged.

## 9.7 Journal history — `/app/journal`

### Purpose
Let users browse, search, filter, and open saved entries.

### Layout
- Page title “My Journal.”
- Primary “New entry” button.
- Search input.
- Date filter control.
- Emotion filter.
- Sort control (newest first by default).
- Entry list.

### Entry card
Each card displays:
- Title or “Untitled entry.”
- Created date/time in user's display timezone.
- Short excerpt, truncated safely.
- Self-reported mood if provided.
- AI prediction badge only if an analysis exists.
- Click target to open entry.

### Empty states
- No entries: explain that saved writing will appear here and provide “Write your first entry.”
- No search matches: offer “Clear filters.”
- No analyzed entries for selected emotion: explain that no matching analyzed entries exist.

### Behavior
- Search and filters should be applied server-side for larger datasets.
- Use pagination or “Load more.”
- Changing filters resets the page/cursor.
- Do not fetch all journal text just to render the list; use a list response with excerpt and metadata.

## 9.8 Analytics — `/app/analytics`

### Purpose
Show patterns in journal activity and model/user-reported emotion records.

### Layout
- Page title “Your patterns.”
- Date range selector: 7 days, 30 days, 90 days, custom.
- Summary statistic cards.
- Emotion distribution chart.
- Timeline chart.
- Journal activity chart.
- Prediction-versus-self-report comparison.
- Recurring topic/keyword panel if implemented.

### Chart definitions
1. **Emotion distribution:** Count of entries by latest successful predicted label in the date range.
2. **Emotion timeline:** Daily or weekly counts by predicted label, not a claim about continuous mood.
3. **Journal activity:** Number of entries by day/week.
4. **Prediction comparison:** Agreement count/rate among entries that have both a prediction and a user-reported label. Clearly state denominator.
5. **Recurring topics:** Frequent terms/topics detected from text. Clearly label as text patterns, not necessarily important causes.

### Chart design
- Use labels and legends; do not depend on color alone.
- Tooltips should show count, date range, and category.
- Empty periods should show zero or a clear gap according to one consistent rule.
- Use a responsive layout and avoid overly dense labels on mobile.
- Provide a brief explanation below each chart describing what it counts.

### Behavior
- Date filter updates all panels.
- Analytics are always limited to the current user.
- Use a consistent timezone and week boundary.
- If there is insufficient data, show an explanation rather than a misleading chart.

## 9.9 Weekly Insights — `/app/insights`

### Purpose
Give users a readable recap of their own journal activity over a week.

### Layout
- Page title “Weekly reflections.”
- Week selector / previous and next week controls.
- Summary card.
- “What appeared often” section.
- “Recorded emotion patterns” section.
- Reflection prompt card.
- Link or references to supporting entries where possible.
- Previous summaries list.

### Generation behavior
- Select a week using a defined start/end convention.
- Fetch only the authenticated user's entries in that interval.
- Calculate statistics server-side.
- Generate deterministic text from those statistics in the MVP.
- Save one current summary per user/week or use a versioning approach if regeneration history is required.
- If too few entries exist, show “Not enough entries yet” with the count and an invitation to keep journaling. Do not generate filler insights.

### Example tone
“Assignments appeared in several entries this week. You also recorded relief in entries written after completing tasks. You may want to reflect on which planning habits helped.”

This is a description of observed records, not a causal conclusion.

### Regeneration
If users can regenerate summaries:
- Explain that the summary will be recalculated using the current entry data.
- Prevent repeated accidental generation.
- Keep the date range fixed.
- Do not call an external LLM in the MVP unless explicitly enabled and disclosed.

## 9.10 Settings — `/app/settings`

### Sections
1. **Appearance**
   - Theme mode: Automatic / Manual / Default.
   - Theme palette selector for manual mode.
   - Preview of selected palette.
2. **Account**
   - Display email.
   - Sign out.
3. **Your data**
   - Export journal data.
   - Delete all journal entries (with confirmation).
   - Delete account (with stronger confirmation).
4. **Privacy and AI**
   - Explain what is stored.
   - Explain how emotion analysis is performed.
   - Disclose whether the selected model runs locally or sends text to an external provider.
   - Explain retention/deletion behavior.

### Behavior
- Preference changes save and apply across the app.
- A failed preference update must revert or clearly mark the unsaved state.
- Data deletion requires explicit confirmation.
- Account deletion invalidates sessions and handles dependent records.

---

# 10. Complete end-to-end user flows

## 10.1 First-time visitor to first saved entry

1. Visitor opens `/`.
2. Visitor reads the product explanation and privacy note.
3. Visitor selects “Get started.”
4. Frontend opens `/register`.
5. Visitor enters email and password.
6. Frontend validates obvious input errors.
7. Frontend calls `POST /api/auth/register`.
8. Backend validates, creates account, and establishes session according to the selected auth design.
9. Frontend routes to `/app/dashboard`.
10. Dashboard displays first-entry empty state.
11. User selects “Write your first entry.”
12. Frontend opens `/app/entries/new`.
13. User writes content and optionally selects a self-reported mood.
14. User selects “Save entry.”
15. Frontend calls `POST /api/entries`.
16. Backend validates and persists the entry.
17. Frontend opens the saved entry detail page.
18. User can now choose “Analyze entry.”

**Success condition:** The entry is stored and appears in Journal History. AI analysis is not required for saving.

## 10.2 Login and session restoration

1. User opens `/login`.
2. User enters credentials.
3. Frontend calls `POST /api/auth/login`.
4. Backend verifies credentials and establishes a secure session.
5. Browser stores the session cookie according to cookie security settings; JavaScript must not read an HttpOnly cookie.
6. Frontend calls `GET /api/me` to confirm current identity.
7. Frontend opens the intended page or Dashboard.
8. On page refresh, frontend calls `GET /api/me` again.
9. If session is valid, app loads authenticated routes.
10. If session has expired, user is redirected to login.

## 10.3 Create and analyze an entry

1. User opens New Entry.
2. User writes a title (optional) and content (required).
3. User optionally records self-reported mood.
4. User clicks “Save and analyze.”
5. Frontend calls `POST /api/entries`.
6. Backend saves entry and returns its ID.
7. Frontend calls `POST /api/entries/{entryId}/analyze`.
8. Frontend shows “Analyzing entry…” without blocking the saved content.
9. Backend runs model inference and stores output.
10. Frontend receives the result and displays the Prediction Card.
11. If inference fails, frontend shows “Your entry is saved, but analysis could not be completed” and a Retry button.

## 10.4 Correct a prediction

1. User opens an analyzed entry.
2. Prediction card displays estimated labels.
3. User selects “That doesn't match how I felt” or “Add my perspective.”
4. User chooses one or more supported self-reported labels, or a defined “Other / prefer not to say” option if included in the MVP.
5. User saves feedback.
6. Frontend calls `PUT /api/entries/{entryId}/feedback`.
7. Backend stores feedback separately from the original prediction.
8. Prediction card displays both “AI estimate” and “Your report.”
9. Analytics comparison includes the record if it meets the comparison rules.

## 10.5 Theme suggestion and override

1. User has an entry with a successful prediction.
2. Application resolves a theme suggestion from the dominant eligible label.
3. If user preference is Automatic, the suggested theme is applied according to product rules.
4. If user preference is Manual, the chosen theme remains applied.
5. If user preference is Default, the standard theme remains applied.
6. User can open Settings and change the mode.
7. Preference update is persisted through the preferences endpoint.

The app should not unexpectedly change the entire visual theme while the user is actively typing.

## 10.6 Review analytics

1. User opens Analytics.
2. Frontend requests default date range.
3. Backend calculates per-user aggregates.
4. Frontend renders summary cards and charts.
5. User changes date range.
6. Frontend sends new query parameters.
7. Backend recalculates within the requested range.
8. Empty chart categories are explained.
9. User can navigate to Journal History to inspect relevant entries.

## 10.7 Generate weekly reflection

1. User opens Weekly Insights.
2. Frontend requests the current or selected week.
3. Backend checks for an existing summary.
4. If a current summary exists, return it.
5. If not, backend aggregates that week's entries.
6. If data is insufficient, return an explicit insufficient-data state.
7. Otherwise, generate a deterministic summary and reflection prompts.
8. Save the summary.
9. Frontend displays the summary and date range.
10. User can open the relevant Journal History filter or referenced entry.

## 10.8 Export data

1. User opens Settings → Your data.
2. User selects “Export my data.”
3. Frontend calls `POST /api/export`.
4. Backend creates an export for only the authenticated user.
5. Backend returns an export job or a short-lived download URL, depending on implementation.
6. Frontend displays completion and download action.
7. Export should include documented user-owned data in a practical format such as JSON or CSV.
8. Temporary export artifacts must expire and be inaccessible to other users.

For a very small MVP, a synchronous JSON download may be used instead of a background export job. Document that implementation choice.

## 10.9 Delete one entry

1. User selects Delete on an entry.
2. Confirmation modal names the entry and explains related analysis/feedback removal.
3. User confirms.
4. Frontend calls `DELETE /api/entries/{entryId}`.
5. Backend verifies ownership and deletes the entry plus dependent records according to retention rules.
6. Frontend removes it from the list and shows confirmation.
7. Related analytics are recalculated on the next request.

## 10.10 Delete account

1. User opens Settings → Account deletion.
2. UI explains that the account and associated journal data will be permanently deleted, subject to the disclosed backup-retention policy.
3. User confirms with password or re-authentication if supported.
4. Frontend calls `DELETE /api/me`.
5. Backend verifies identity, deletes or schedules deletion of dependent data, invalidates sessions, and records only minimal audit information that does not expose journal content.
6. Frontend clears authenticated state and routes to Landing.
7. User sees confirmation.

## 10.11 Logout

1. User opens account menu.
2. User selects “Log out.”
3. Frontend calls `POST /api/auth/logout`.
4. Backend invalidates the current session and clears cookie.
5. Frontend clears user and private-data state.
6. Frontend routes to Landing or Login.

---

# 11. API specification

## 11.1 API conventions

**Base path:** `/api`  
**Format:** JSON  
**Time standard:** ISO 8601 timestamps in UTC. Convert to the user's display timezone in the UI.  
**Authentication:** Secure session cookie for browser requests (recommended MVP choice).  
**CSRF:** State-changing cookie-authenticated requests must use an appropriate CSRF defense, such as a CSRF token plus Origin validation.  
**Authorization:** Every private resource is scoped to the authenticated user. Never trust a `user_id` sent by the client.

### Standard success/error patterns

Example validation error:
```json
{
  "detail": "Content is required."
}
```

Example unauthenticated error:
```json
{
  "detail": "Authentication required."
}
```

Example not-found response:
```json
{
  "detail": "Entry not found."
}
```

Use consistent error structures. Do not return stack traces, SQL details, secrets, or private records in errors.

### Common status codes

| Status | Meaning |
|---|---|
| `200` | Successful read or update |
| `201` | Resource created |
| `202` | Accepted for asynchronous processing, if used |
| `204` | Successful operation with no response body |
| `400` | Invalid operation or malformed request |
| `401` | Not authenticated |
| `403` | Authenticated but not permitted |
| `404` | Resource not found or intentionally undisclosed |
| `409` | Conflict, such as duplicate account or state conflict |
| `413` | Request too large |
| `422` | Schema/field validation failed |
| `429` | Rate limit exceeded |
| `500` | Unexpected server failure |
| `503` | Required dependency temporarily unavailable |

For private resources, returning `404` for a resource that does not belong to the user can reduce resource enumeration. Apply one consistent policy.

---

## 11.2 Authentication endpoints

### `POST /api/auth/register`

**Purpose:** Create a new user account.

**Access:** Public.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "example-password"
}
```

**Backend behavior:**
1. Normalize email for comparison.
2. Validate email and password policy.
3. Check whether the email already exists.
4. Hash password using an established password-hashing library if local authentication is used.
5. Create user record.
6. Establish a session if registration automatically logs the user in.
7. Return safe user profile fields only.

**Success response (`201`):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

The session cookie is set through response headers when using cookie sessions.

**Errors:** `409` duplicate account, `422` invalid fields, `429` rate limit.

**UI behavior:** Display field-level validation and a clear error for an already registered email. Do not display password hashes or internal account details.

### `POST /api/auth/login`

**Purpose:** Verify credentials and establish a user session.

**Access:** Public.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "example-password"
}
```

**Backend behavior:**
1. Normalize email.
2. Find account.
3. Verify password hash.
4. Create a new session with a cryptographically random token.
5. Store only a hash of the session token server-side if using an opaque session design.
6. Set secure, HttpOnly, appropriately SameSite cookie.
7. Return safe user profile.

**Success response (`200`):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:** `401` invalid credentials, `429` rate limit.

**UI behavior:** Keep the error generic, such as “Email or password is incorrect.” On success, call `/api/me` or use the returned profile and navigate to the intended page.

### `POST /api/auth/logout`

**Purpose:** Invalidate the current session.

**Access:** Authenticated.

**Request body:** None.

**Backend behavior:** Invalidate the current session record and clear the session cookie.

**Success:** `204 No Content`.

**UI behavior:** Clear frontend user state and private cached data, then redirect to `/`.

### `GET /api/me`

**Purpose:** Return the currently authenticated user's safe profile.

**Access:** Authenticated.

**Response (`200`):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2026-01-01T10:00:00Z"
}
```

**Errors:** `401` when there is no valid session.

**UI behavior:** Use this on application startup and refresh to restore authentication state.

---

## 11.3 Journal endpoints

### `GET /api/entries`

**Purpose:** List the authenticated user's journal entries.

**Access:** Authenticated.

**Query parameters:**

| Parameter | Type | Meaning |
|---|---|---|
| `q` | string, optional | Search title/content |
| `from` | date, optional | Start date inclusive |
| `to` | date, optional | End date inclusive |
| `emotion` | string, optional | Filter by latest predicted label |
| `sort` | enum | `newest` or `oldest`; default `newest` |
| `limit` | integer | Page size with a safe maximum |
| `cursor` or `offset` | string/integer | Pagination |

**Backend behavior:**
1. Resolve authenticated user.
2. Query only entries owned by that user.
3. Apply filters.
4. Return list metadata and a short excerpt, not necessarily the full content.
5. Include latest prediction summary if available.
6. Apply pagination.

**Response (`200`):**
```json
{
  "items": [
    {
      "id": "entry-uuid",
      "title": "A long day",
      "excerpt": "Today was busy...",
      "self_reported_mood": "relieved",
      "latest_prediction": {
        "label": "joy",
        "analyzed_at": "2026-01-01T10:30:00Z"
      },
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ],
  "next_cursor": null
}
```

**UI behavior:** Render entry cards. Preserve filters while paging. Show the proper empty state when there are no entries or no filter matches.

### `POST /api/entries`

**Purpose:** Create a journal entry.

**Access:** Authenticated.

**Request body:**
```json
{
  "title": "A long day",
  "content": "Today was busy, but I finished my work.",
  "self_reported_mood": "relieved"
}
```

`title` and `self_reported_mood` may be nullable according to validation rules. `content` is required.

**Backend behavior:**
1. Validate content and field lengths.
2. Derive `user_id` from the authenticated session.
3. Create entry.
4. Commit transaction.
5. Return created entry.

**Response (`201`):**
```json
{
  "id": "entry-uuid",
  "title": "A long day",
  "content": "Today was busy, but I finished my work.",
  "self_reported_mood": "relieved",
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**Errors:** `422` invalid/missing content, `413` body too large.

**UI behavior:** On success, navigate to the saved entry. On failure, keep the text in the editor and show a retry option.

### `GET /api/entries/{entry_id}`

**Purpose:** Retrieve one journal entry and its relevant metadata.

**Access:** Authenticated and owner only.

**Backend behavior:** Query by both entry ID and authenticated user ID. Return entry content, self-reported mood, latest prediction, and timestamps.

**Response (`200`):**
```json
{
  "id": "entry-uuid",
  "title": "A long day",
  "content": "Today was busy...",
  "self_reported_mood": "relieved",
  "latest_prediction": null,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**Errors:** `404` missing or not owned.

**UI behavior:** Populate entry detail/editor. If no prediction exists, show “Analyze entry.”

### `PATCH /api/entries/{entry_id}`

**Purpose:** Update a user's journal entry.

**Access:** Authenticated and owner only.

**Request body example:**
```json
{
  "title": "Updated title",
  "content": "Updated journal text.",
  "self_reported_mood": "calm"
}
```

Only provided fields are updated.

**Backend behavior:**
1. Verify ownership.
2. Validate supplied fields.
3. Update fields and `updated_at`.
4. If content changes, mark previous analysis as stale or clearly associate it with the previous content version.
5. Commit and return updated entry.

**Response (`200`):** Updated entry object.

**Errors:** `404`, `422`, `413`.

**UI behavior:** Show saved confirmation. If content changed, display that the previous prediction may no longer match the edited text and offer re-analysis.

### `DELETE /api/entries/{entry_id}`

**Purpose:** Delete a journal entry.

**Access:** Authenticated and owner only.

**Backend behavior:**
1. Verify ownership.
2. Delete entry and dependent predictions/feedback according to the retention policy.
3. Ensure weekly summaries are invalidated or marked stale if they used the deleted entry.
4. Commit transaction.

**Success:** `204 No Content`.

**Errors:** `404`.

**UI behavior:** Require confirmation before sending request. On success, remove card and navigate to Journal History if on detail page.

---

## 11.4 Emotion analysis endpoints

### `POST /api/entries/{entry_id}/analyze`

**Purpose:** Run emotion classification on a saved entry.

**Access:** Authenticated and owner only.

**Request body:** Optional configuration only if supported. Do not accept arbitrary model IDs from an untrusted client.

**Backend behavior:**
1. Verify entry ownership.
2. Read current entry content.
3. Validate text length and model compatibility.
4. Run the configured model.
5. Normalize returned labels and scores.
6. Store prediction with model identifier and timestamp.
7. Associate prediction with the content version or `updated_at` value analyzed.
8. Return the analysis result.

**Response (`200`):**
```json
{
  "entry_id": "entry-uuid",
  "prediction_id": "prediction-uuid",
  "model_name": "configured-model-id",
  "predicted_label": "joy",
  "scores": [
    {"label": "joy", "score": 0.65},
    {"label": "fear", "score": 0.25},
    {"label": "sadness", "score": 0.10}
  ],
  "analyzed_at": "2026-01-01T10:30:00Z",
  "analyzed_entry_updated_at": "2026-01-01T10:00:00Z"
}
```

Scores are illustrative. The application must display actual model output and must not call scores a probability of the user's true emotional state unless the model has been appropriately calibrated and that claim is justified.

**Errors:** `404` entry missing/not owned, `422` text not suitable, `503` model unavailable, `429` rate limit.

**UI behavior:** Show progress. On success, render prediction card and theme suggestion. On failure, keep entry available and show Retry.

### `GET /api/entries/{entry_id}/emotions`

**Purpose:** Retrieve stored emotion analysis for one entry.

**Access:** Authenticated and owner only.

**Backend behavior:** Return current/latest prediction and optionally historical predictions if prediction history is retained.

**Response (`200`):**
```json
{
  "entry_id": "entry-uuid",
  "latest_prediction": {
    "prediction_id": "prediction-uuid",
    "model_name": "configured-model-id",
    "predicted_label": "joy",
    "scores": [
      {"label": "joy", "score": 0.65},
      {"label": "fear", "score": 0.25}
    ],
    "analyzed_at": "2026-01-01T10:30:00Z",
    "is_stale": false
  }
}
```

**UI behavior:** Render prediction card. If stale, show “This analysis is from an earlier version of the entry.”

### `PUT /api/entries/{entry_id}/feedback`

**Purpose:** Store the user's own reported emotion or correction.

**Access:** Authenticated and owner only.

**Request body:**
```json
{
  "reported_emotion": "uncertain",
  "note": null
}
```

For MVP, `reported_emotion` should come from an allowed list. If multi-select is chosen, define the schema as an array and apply it consistently across UI, API, and database.

**Backend behavior:**
1. Verify entry ownership.
2. Validate reported label.
3. Create or update feedback according to the chosen policy.
4. Do not alter the original model prediction.
5. Mark dependent comparison aggregates/weekly insights stale if necessary.

**Response (`200`):**
```json
{
  "entry_id": "entry-uuid",
  "reported_emotion": "uncertain",
  "updated_at": "2026-01-01T10:40:00Z"
}
```

**Errors:** `404`, `422`.

**UI behavior:** Show both AI estimate and user report distinctly. Allow user to update their report.

---

## 11.5 Analytics endpoints

All analytics endpoints must scope data to the authenticated user. Accept date filters with an agreed timezone and inclusive/exclusive boundary rule. Recommended: `from` inclusive and `to` exclusive when represented as timestamps, or inclusive dates converted safely by the backend.

### `GET /api/analytics/moods`

**Purpose:** Return counts of latest predictions by emotion for a period.

**Query parameters:** `from`, `to`, optional `bucket` or `timezone` if required.

**Backend behavior:**
- Select the latest successful, non-stale prediction per entry.
- Filter entries by creation date in the requested period.
- Aggregate count by predicted label.
- Return total analyzed entries and unanalysed count if useful.

**Response (`200`):**
```json
{
  "from": "2026-01-01",
  "to": "2026-01-08",
  "total_analyzed_entries": 5,
  "items": [
    {"label": "joy", "count": 3},
    {"label": "fear", "count": 2}
  ]
}
```

**UI behavior:** Render distribution chart and explanatory caption such as “Number of entries by latest AI-estimated label.”

### `GET /api/analytics/trends`

**Purpose:** Return time-bucketed emotion counts.

**Query parameters:** `from`, `to`, `group_by=day|week`.

**Response (`200`):**
```json
{
  "group_by": "day",
  "series": [
    {
      "date": "2026-01-01",
      "counts": {"joy": 1, "fear": 0, "sadness": 0}
    }
  ]
}
```

**Backend behavior:** Aggregate latest prediction per entry into the requested buckets. Define week start consistently.

**UI behavior:** Render timeline chart with legends, tooltips, and accessible labels.

### `GET /api/analytics/activity`

**Purpose:** Return journal entry counts over time.

**Query parameters:** `from`, `to`, `group_by=day|week`.

**Response (`200`):**
```json
{
  "group_by": "day",
  "series": [
    {"date": "2026-01-01", "entry_count": 2},
    {"date": "2026-01-02", "entry_count": 0}
  ]
}
```

**UI behavior:** Render activity bars or calendar-style counts. Do not equate entry frequency with emotional wellbeing.

### `GET /api/analytics/comparison`

**Purpose:** Compare latest AI prediction with user-reported emotion.

**Query parameters:** `from`, `to`.

**Backend behavior:**
- Include only entries with both a current prediction and user feedback/self-report.
- Use a clearly defined label-matching rule.
- Return numerator, denominator, and per-label comparison if useful.
- Do not include entries without both values in the agreement denominator.

**Response (`200`):**
```json
{
  "matched_count": 6,
  "compared_count": 10,
  "agreement_rate": 0.6,
  "note": "Comparison of model labels with user-reported labels; not a measure of emotional truth."
}
```

**UI behavior:** Show the denominator and explanatory note near the metric. Do not present a small sample as robust model validation.

---

## 11.6 Weekly insight endpoints

### `GET /api/insights/weekly`

**Purpose:** Retrieve the summary for a specified week, or the current week by default.

**Query parameters:** `week_start` optional date.

**Backend behavior:**
- Resolve the week boundaries.
- Find summary for authenticated user and week.
- Return it if available.
- If absent, either return an explicit not-generated status or trigger deterministic generation according to the chosen implementation. Prefer separate read and generate actions for predictable behavior.

**Response (`200`):**
```json
{
  "week_start": "2026-01-05",
  "week_end": "2026-01-12",
  "status": "ready",
  "summary": "Assignments appeared in several entries this week.",
  "statistics": {
    "entry_count": 5,
    "most_frequent_predicted_label": "fear"
  },
  "reflection_prompts": [
    "Which planning habits helped you complete tasks?"
  ],
  "supporting_entry_ids": ["entry-uuid"]
}
```

If not generated:
```json
{
  "week_start": "2026-01-05",
  "week_end": "2026-01-12",
  "status": "not_generated",
  "summary": null
}
```

**UI behavior:** Display summary, date range, evidence links, and reflection prompts. If not generated, show Generate button.

### `POST /api/insights/weekly/generate`

**Purpose:** Generate or regenerate a weekly insight.

**Access:** Authenticated.

**Request body:**
```json
{
  "week_start": "2026-01-05"
}
```

**Backend behavior:**
1. Resolve date range.
2. Retrieve only the user's entries and relevant predictions in that range.
3. Calculate counts and recurring terms/topics.
4. Check the minimum-data rule.
5. If sufficient, generate deterministic summary and prompts.
6. Store or update summary for that user/week.
7. Mark summary metadata with generation timestamp and relevant data version if practical.

**Response (`200`):**
```json
{
  "week_start": "2026-01-05",
  "week_end": "2026-01-12",
  "status": "ready",
  "summary": "You recorded five entries this week...",
  "statistics": {
    "entry_count": 5
  },
  "reflection_prompts": [
    "What would you like to repeat next week?"
  ],
  "generated_at": "2026-01-12T10:00:00Z"
}
```

**Insufficient data response (`200`):**
```json
{
  "week_start": "2026-01-05",
  "week_end": "2026-01-12",
  "status": "insufficient_data",
  "entry_count": 0,
  "message": "There are not enough entries for a useful weekly reflection yet."
}
```

**UI behavior:** Disable repeated clicks while generating. Show loading state. If generation fails, keep any previous successful summary and offer retry.

### `GET /api/insights/history`

**Purpose:** List the user's previous weekly summaries.

**Query parameters:** `limit`, `cursor` or `offset`.

**Response (`200`):**
```json
{
  "items": [
    {
      "id": "insight-uuid",
      "week_start": "2026-01-05",
      "week_end": "2026-01-12",
      "summary_preview": "You recorded five entries..."
    }
  ],
  "next_cursor": null
}
```

**UI behavior:** Show a reverse-chronological list of previous weeks. Clicking an item loads its full summary.

---

## 11.7 Preferences endpoints

### `GET /api/preferences`

**Purpose:** Retrieve appearance and personalization settings.

**Access:** Authenticated.

**Response (`200`):**
```json
{
  "theme_mode": "auto",
  "selected_theme": "neutral",
  "adaptive_theme_enabled": true
}
```

### `PATCH /api/preferences`

**Purpose:** Update one or more user preferences.

**Request body:**
```json
{
  "theme_mode": "manual",
  "selected_theme": "warm",
  "adaptive_theme_enabled": false
}
```

**Backend behavior:**
- Validate allowed theme names and modes.
- Update only supplied fields.
- Ensure `manual` mode uses selected theme.
- Ensure `default` mode uses base theme.
- Do not accept arbitrary CSS or arbitrary theme values from the client.

**Response (`200`):** Updated preferences object.

**UI behavior:** Apply the theme immediately after successful update. If save fails, show an error and restore the last saved value or clearly show unsaved status.

---

## 11.8 Export and account endpoints

### `POST /api/export`

**Purpose:** Create an export of the authenticated user's data.

**Access:** Authenticated.

**Request body:**
```json
{
  "format": "json"
}
```

**Backend behavior:**
- Export only the current user's records.
- Include journal entries, self-reports, predictions, feedback, preferences, and weekly insights where appropriate.
- Exclude password hashes, session tokens, and internal secrets.
- For a small MVP, return a downloadable file directly. For larger data, create a short-lived export job/artifact.
- Ensure temporary files are private and expire.

**Response option A (`200`):** File download with appropriate content headers.

**Response option B (`202`):**
```json
{
  "export_id": "export-uuid",
  "status": "processing"
}
```

If asynchronous export is chosen, define corresponding status/download endpoints before implementing it. Do not implement an incomplete job model.

### `DELETE /api/me`

**Purpose:** Delete the authenticated user's account and associated personal data.

**Access:** Authenticated; require recent re-authentication or confirmation if supported.

**Request body:** May contain a confirmation field required by the selected auth strategy.

**Backend behavior:**
- Validate confirmation.
- Invalidate sessions.
- Delete or schedule deletion of journal entries, predictions, feedback, preferences, and insights.
- Handle associated blob exports.
- Follow the documented backup-retention policy.
- Do not retain journal text in audit logs.

**Success:** `204 No Content`.

**UI behavior:** Require an explicit confirmation dialog. On success, clear client state and redirect to landing page.

---

# 12. Data model and business rules

## 12.1 Core entities

### `users`
- `id` UUID primary key.
- `email` unique and normalized.
- `password_hash` if local auth is used.
- `created_at`.
- `updated_at`.

### `sessions`
- `id` UUID primary key.
- `user_id` foreign key.
- `session_token_hash`.
- `created_at`.
- `expires_at`.
- `revoked_at` nullable.

Only needed if implementing backend-managed opaque sessions. Never store raw session tokens.

### `journal_entries`
- `id` UUID primary key.
- `user_id` foreign key.
- `title` nullable.
- `content` text.
- `self_reported_mood` nullable.
- `created_at`.
- `updated_at`.

### `emotion_predictions`
- `id` UUID primary key.
- `entry_id` foreign key.
- `model_name`.
- `model_version` nullable.
- `predicted_label`.
- `scores` JSONB.
- `analyzed_at`.
- `analyzed_content_updated_at` or content version reference.

### `emotion_feedback`
- `id` UUID primary key.
- `entry_id` foreign key.
- `reported_emotion`.
- `created_at`.
- `updated_at`.

### `user_preferences`
- `id` UUID primary key.
- `user_id` unique foreign key.
- `theme_mode`.
- `selected_theme`.
- `adaptive_theme_enabled`.
- `updated_at`.

### `weekly_insights`
- `id` UUID primary key.
- `user_id` foreign key.
- `week_start`.
- `week_end`.
- `summary`.
- `statistics` JSONB.
- `reflection_prompts` JSONB.
- `generated_at`.
- Optional `source_updated_at` or data fingerprint.

## 12.2 Relationships

- One user has many journal entries.
- One user has many sessions.
- One journal entry may have multiple historical predictions.
- One journal entry may have one current feedback record or multiple feedback-history records, depending on implementation.
- One user has one preference record.
- One user has many weekly insights, normally one current insight per week.

## 12.3 Data rules

- All private queries include authenticated `user_id`.
- IDs are not authorization mechanisms.
- Store timestamps in UTC.
- Define the reporting timezone/week boundary consistently.
- Index journal history queries, especially `(user_id, created_at)`.
- Add indexes to foreign keys used in joins.
- Use database constraints for unique email, preference uniqueness, and week uniqueness as appropriate.
- Use migrations for schema changes.
- Deleting an entry must also handle its predictions and feedback.
- Editing content makes the previous analysis stale.
- User feedback must not overwrite model output.

---

# 13. Emotion analysis and model behavior

## 13.1 Candidate model

A candidate for an English-language MVP is `j-hartmann/emotion-english-distilroberta-base`. Verify its current model card, label set, license, supported language, and resource requirements before final selection.

The MVP should support only the language actually supported by the selected model. Do not silently claim multilingual emotion detection.

## 13.2 Inference workflow

1. User saves an entry.
2. User requests analysis.
3. Backend retrieves the stored entry after ownership verification.
4. Input is checked against length and content constraints.
5. Model runs inference.
6. Backend normalizes labels and scores.
7. Prediction is stored with model provenance and analyzed content version.
8. Response is returned to frontend.
9. Frontend displays AI-estimated emotions and optional theme suggestion.

## 13.3 Score presentation

- Scores are model outputs.
- Do not label them as percentages of actual feelings.
- Do not tell users they are “65% happy.”
- Prefer “Model score: 0.65” with a tooltip explaining that it is a model score, or show ranked labels without exposing raw scores if that is clearer.
- Do not compare score values across different models as if directly equivalent.

## 13.4 User correction

The user can state their own feeling independently. Keep these fields distinct:
- AI predicted label.
- AI scores.
- User-reported mood.
- User correction timestamp.

Corrections support transparency and comparison. They do not automatically train the model.

## 13.5 Failure behavior

- A saved entry remains accessible if analysis fails.
- The UI explains the analysis failed, not that the entry failed to save.
- Retrying creates a new prediction record or updates the current prediction according to the documented history policy.
- Model exceptions are logged without raw journal content.

## 13.6 Model evaluation

Evaluate the selected model on an appropriate labeled test set. Report accuracy, precision, recall, macro F1, and a confusion matrix where appropriate. Document dataset limitations and avoid presenting benchmark results as proof of user-specific accuracy.

---

# 14. Analytics and insight definitions

## 14.1 Emotion distribution

Count the latest non-stale prediction for each entry in the date range. This is an entry-level classification count, not a measure of how intensely or continuously a user felt an emotion.

## 14.2 Trend timeline

Group eligible entry predictions by day or week. Define week start (for example, Monday) and timezone consistently. Do not interpolate missing days into continuous emotional states.

## 14.3 Journal activity

Count entries by creation date. This measures writing activity only.

## 14.4 Prediction agreement

Compare latest prediction with the user's latest self-report/correction only when both exist. Display:
- matched count,
- comparison denominator,
- agreement rate,
- date range,
- explanatory note.

Do not call it the model's overall accuracy. User self-report is a comparison reference, not an infallible ground truth.

## 14.5 Recurring topics

MVP approach:
- Normalize text.
- Remove common stop words.
- Count meaningful terms or use a lightweight topic extraction method.
- Exclude sensitive or irrelevant tokens where possible.
- Display terms as “frequently mentioned words/topics.”
- Do not infer medical, personality, or causal conclusions.

## 14.6 Weekly summary minimum-data rule

Define a threshold in configuration (for example, at least three saved entries in the selected week). If threshold is not met, return `insufficient_data`. Do not make the threshold appear scientifically validated; it is a product rule to avoid low-evidence summaries.

## 14.7 Summary generation rules

- Use actual aggregates and selected supporting entries.
- Distinguish observed counts from interpretation.
- Use cautious language: “appeared in,” “was mentioned,” “the model classified.”
- Avoid “because,” “caused,” “you are,” or diagnostic phrasing unless directly supported and appropriate.
- Include the date range.
- Allow the user to inspect relevant entries where possible.

---

# 15. Security, privacy, and data governance

## 15.1 Authentication

Recommended MVP approach: backend-managed opaque sessions or a reputable managed authentication provider. If using backend-managed sessions:
- Store password hashes, never plaintext passwords.
- Generate unpredictable session tokens.
- Store only token hashes server-side.
- Use HttpOnly and Secure cookies in production.
- Set appropriate SameSite behavior.
- Expire and revoke sessions.
- Protect state-changing requests against CSRF.
- Rate-limit login and registration attempts.

## 15.2 Authorization

Every private endpoint must:
- Require a valid authenticated identity.
- Use that identity to scope database access.
- Verify ownership before any read, write, analysis, export, or deletion.
- Avoid trusting user IDs or ownership values from request bodies.

Test cross-user access explicitly.

## 15.3 Secrets

- Keep `.env` out of Git.
- Provide `.env.example` with placeholder values only.
- Never put backend database credentials or AI provider secrets in React code.
- Use managed secret storage for production where available.
- Rotate exposed credentials.

## 15.4 Sensitive data

- Do not log full journal content by default.
- Do not include journal text in error tracking or analytics events.
- Restrict database and storage network access.
- Use HTTPS.
- Use encryption at rest through the selected hosting configuration.
- Disclose external model processing before sending journal text outside the application.
- Offer a local inference option if practical and within deployment resources.

## 15.5 Retention and deletion

The UI must explain:
- What is stored.
- Why it is stored.
- Whether an external service receives entry text.
- What deleting an entry/account removes.
- How long backups or temporary exports may remain before expiry.

Do not promise immediate deletion from backups if the hosting/backup policy does not support it. State the actual retention policy.

---

# 16. Non-functional requirements

## 16.1 Performance
- Paginate journal history.
- Return excerpts in list views rather than all full entry bodies.
- Aggregate analytics in backend/database queries.
- Load the model once per process where local inference is used.
- Keep saving independent from inference.
- Show progress for slow operations.

## 16.2 Reliability
- Validate all input.
- Use transactions for multi-record writes.
- Handle database and model errors.
- Preserve user-entered text on network errors.
- Avoid duplicate weekly summary generation on repeated clicks.
- Provide actionable retry behavior.

## 16.3 Accessibility
- Use semantic headings and landmarks.
- Label every input.
- Ensure keyboard navigation.
- Provide visible focus indicators.
- Use sufficient contrast in every theme.
- Do not use color alone for emotion/category distinctions.
- Support reduced-motion preference.

## 16.4 Maintainability
- Use reusable React components.
- Separate API routers, schemas, models, and services.
- Keep model inference behind an adapter/service.
- Use Alembic migrations.
- Maintain tests and documentation.
- Make small Git commits.

## 16.5 Browser support
Support current major desktop and mobile browsers. Test at minimum one Chromium-based desktop browser and a mobile viewport before submission.

---

# 17. Acceptance criteria and test scenarios

## 17.1 Authentication
- A new valid user can register.
- Duplicate email is rejected.
- Invalid credentials do not establish a session.
- A valid session survives refresh until expiry.
- Logout invalidates the session.
- Protected routes redirect unauthenticated users.

## 17.2 Journal
- User can create a valid entry.
- Empty content is rejected.
- User can retrieve their entry after refresh.
- User can update title/content/mood.
- Editing content marks previous analysis stale.
- User can delete their entry.
- Search and date filters return correct results.

## 17.3 Authorization
- User A cannot read User B's entry.
- User A cannot update or delete User B's entry.
- User A cannot analyze User B's entry.
- User A cannot retrieve User B's analytics or weekly summary.
- User A cannot export User B's data.

## 17.4 Emotion analysis
- A valid saved entry can be analyzed.
- Response contains model ID, labels, scores, and timestamp.
- Prediction is persisted.
- Inference failure leaves entry intact.
- User can retry.
- Stale predictions are visibly marked.

## 17.5 Themes
- Auto mode uses a permitted theme mapping.
- Manual mode always uses the selected theme.
- Default mode uses the neutral base palette.
- Preference survives logout/login.
- Text remains readable in all themes.
- Theme changes do not interrupt active writing.

## 17.6 Analytics
- Counts match test fixture records.
- Date range boundaries are correct.
- Unanalyzed entries are not counted as predicted labels.
- Comparison denominator includes only entries with both values.
- Empty periods render helpful states.
- Results are user-scoped.

## 17.7 Weekly insights
- Summary uses the correct user's entries.
- Week boundary is consistent.
- Insufficient data returns the appropriate status.
- Summary has no invented entry or event.
- Deleting or editing source entries marks summary stale or triggers recalculation.
- Previous weeks can be revisited.

## 17.8 Privacy and account controls
- Export contains only the current user's data.
- Export excludes passwords, session tokens, and secrets.
- Entry deletion handles dependent data.
- Account deletion invalidates sessions and removes associated data according to policy.
- Logs do not contain raw journal entries.

---

# 18. Error, empty, and loading state requirements

| Situation | UI response |
|---|---|
| No entries yet | “Your journal starts here” plus a New Entry button. |
| Search has no matches | “No entries match these filters” plus Clear Filters. |
| Entry save in progress | Disable duplicate save and show Saving. |
| Entry save fails | Preserve text and show retry message. |
| Analysis in progress | Show “Analyzing your entry…”; keep content accessible. |
| Analysis fails | “Your entry is saved, but analysis could not be completed” plus Retry. |
| No prediction exists | Show “Not analyzed yet” plus Analyze Entry. |
| Prediction is stale | Show “This analysis is from an earlier version” plus Re-analyze. |
| No analytics data | Explain what data will appear and link to Journal/New Entry. |
| No weekly summary | Show Generate Reflection if enough data exists. |
| Insufficient weekly data | Explain that more entries are needed; do not fabricate a summary. |
| Session expired | Redirect to login and preserve a safe return destination. |
| API/network unavailable | Show retry and avoid discarding unsaved user text. |
| Export processing | Show progress and a safe download action when ready. |
| Delete succeeded | Show confirmation and update the list/page. |

---

# 19. Development milestones

Build in vertical slices, not as disconnected frontend/backend projects.

### Milestone 1 — App shell
- React + Vite setup.
- FastAPI setup.
- PostgreSQL connection.
- Routing and global layout.
- Health endpoint.

**Exit condition:** Frontend and backend run locally.

### Milestone 2 — Authentication
- Registration.
- Login/logout.
- Session restoration.
- Protected routes.
- Ownership dependency.

**Exit condition:** Two test users cannot access each other's private resources.

### Milestone 3 — Journaling
- Create/read/update/delete.
- Search and date filters.
- Persistent database.
- Empty/loading/error states.

**Exit condition:** Complete journal workflow works without AI.

### Milestone 4 — Emotion analysis
- Select and validate model.
- Inference service.
- Analysis endpoint.
- Prediction storage and display.
- Retry/error handling.

**Exit condition:** Saved entry can be analyzed without risking entry data.

### Milestone 5 — Adaptive interface
- Theme tokens.
- Emotion-to-theme mapping.
- Auto/manual/default settings.
- Preference persistence.

**Exit condition:** User can override AI theme suggestion.

### Milestone 6 — Analytics and insights
- Aggregation endpoints.
- Charts.
- Feedback comparison.
- Weekly deterministic summary.

**Exit condition:** All analytics derive from real, scoped records.

### Milestone 7 — Privacy and quality
- Export/deletion.
- Security checks.
- Automated tests.
- Responsive and accessibility review.

**Exit condition:** Acceptance criteria pass.

### Milestone 8 — Deployment and submission
- Azure or chosen hosting.
- Production configuration.
- README and diagrams.
- Test report.
- Demo script.

**Exit condition:** Public demo URL works and project documentation matches the implementation.

---

# 20. Out-of-scope future ideas

Only consider these after the MVP is deployed and tested:

- Optional LLM-assisted narrative generation with explicit privacy disclosure.
- Voice journaling and speech-to-text.
- Image attachments and OCR.
- Additional-language emotion models.
- User-specific model adaptation with explicit consent and a valid evaluation method.
- Background job processing if inference latency requires it.
- More advanced topic extraction.

Do not add a feature merely because an AI coding assistant can generate it. Add it only if it improves the product and can be completed, tested, and explained.

---

# 21. Final product definition

SoulScript is a privacy-focused, AI-assisted journaling platform that helps users record experiences, review possible emotional signals in their writing, personalize their writing environment, and explore patterns in their own historical entries.

The core product is the combination of:

1. **Private journaling:** reliable creation and management of personal entries.
2. **Transparent emotion estimates:** optional model predictions with user correction.
3. **Adaptive personalization:** theme suggestions that always respect user preference.
4. **Historical analytics:** clear visual summaries based on real saved records.
5. **Weekly reflection:** evidence-grounded summaries that avoid medical or causal claims.

The MVP should be a responsive, secure, fully working application built with React, FastAPI, and PostgreSQL, with a pretrained emotion model integrated as a supporting feature. Azure can host the production application and database when appropriate for the project's budget.

**Product tagline:**  
*Your Thoughts. Your Emotions. Your Story.*
