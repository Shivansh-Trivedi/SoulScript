# SoulScript — Design Specification

**File:** `design.md`  
**Document version:** 1.0  
**Based on:** SoulScript PRD v2.0  
**Audience:** AI coding agent, frontend developer, backend developer, tester  
**Status:** Implementation guidance for the MVP

> The PRD is the product source of truth. This document translates its UI and UX requirements into a consistent visual system and component-level design. Where the PRD leaves a choice open, this document supplies an MVP default. Do not introduce new product scope without updating the PRD first.

---

## 1. Design objective

SoulScript should feel like a private, welcoming writing space with useful reflection tools. It must not look like a medical dashboard, a social network, or a dense business analytics product.

The visual experience should communicate:

- Privacy and personal ownership.
- Comfortable, focused writing.
- Emotional sensitivity without implying clinical assessment.
- Clarity and restraint in data visualization.
- User control over AI-generated suggestions.

The app should remain visually coherent when a theme changes. Theme adaptation changes the color tokens and selected accents, not the whole layout, navigation, typography, or information hierarchy.

## 2. Design principles

1. **Writing is the primary action.** The journal editor should be the least cluttered and most comfortable page.
2. **Clarity before decoration.** Every card, label, icon, and chart must communicate useful information.
3. **Calm rather than clinical.** Use muted, balanced colors and avoid diagnostic or hospital-like visual language.
4. **AI is presented as a suggestion.** Use labels such as “AI-estimated emotions” and “Suggested theme.”
5. **User control is visible.** The user can correct mood labels, choose a manual theme, or disable adaptation.
6. **Privacy is visible but not intrusive.** Reassure users near the editor and explain data handling in Settings.
7. **Accessible in every theme.** Text contrast, focus indicators, labels, and non-color cues must remain usable across all palettes.
8. **Responsive by design.** Mobile is a supported first-class experience, not a compressed desktop layout.

---

## 3. Visual identity

### 3.1 Brand personality

- Thoughtful
- Calm
- Personal
- Modern
- Trustworthy
- Non-judgmental

### 3.2 Brand voice

Use warm, concise, neutral language.

Preferred examples:
- “Write an entry”
- “Your weekly reflection”
- “Possible emotions in this text”
- “AI-estimated emotional tone”
- “Your reported feeling”
- “Suggested theme”
- “Not enough entries for a useful summary yet”

Avoid:
- “We know how you feel”
- “Your true emotion”
- “You are depressed/anxious”
- “Diagnosis”
- “Treatment”
- “Your mental health score”
- “The AI understands you perfectly”

### 3.3 Logo and wordmark

For the MVP, use a simple text wordmark: **SoulScript**. A small abstract mark based on a page, a flowing line, or a subtle quotation shape may accompany it. Do not spend implementation time on a complex illustration or mascot.

The wordmark should remain readable in the sidebar, mobile header, landing page, and authentication card.

---

## 4. Design tokens

Implement tokens as CSS custom properties. Components must use tokens rather than hardcoding theme-specific colors. The values below are proposed starting values and must be checked with a contrast checker before release.

### 4.1 Base light theme

| Token | Suggested value | Usage |
|---|---|---|
| `--color-bg` | `#F7F5F2` | Main application canvas |
| `--color-surface` | `#FFFFFF` | Cards, editor, modal surfaces |
| `--color-surface-muted` | `#F0EEEB` | Secondary surfaces and input backgrounds |
| `--color-text` | `#25242A` | Primary text |
| `--color-text-muted` | `#706D75` | Supporting text |
| `--color-primary` | `#7662A8` | Primary actions and selected controls |
| `--color-primary-hover` | `#66528F` | Hover state |
| `--color-border` | `#E5E1DC` | Borders and separators |
| `--color-success` | `#34785D` | Success feedback |
| `--color-warning` | `#94651D` | Warning feedback |
| `--color-danger` | `#B44747` | Destructive actions and errors |
| `--color-focus` | `#5D84C7` | Visible keyboard focus ring |

Do not rely on the illustrative hex values without checking contrast for text, icons, disabled controls, and focus indicators.

### 4.2 Typography

Recommended default:
- UI font: `Inter`, ` system-ui`, sans-serif.
- Journal writing font: same UI font for the MVP; an optional readable serif may be tested later.
- Base body size: 16px.
- Supporting metadata: 13–14px; do not go below 12px for essential text.
- Page title: 26–32px desktop, 23–26px mobile.
- Section title: 18–22px.
- Body line-height: 1.5–1.7.
- Journal editor line-height: 1.65–1.8.

Use a consistent scale rather than arbitrary font sizes on each page.

### 4.3 Spacing

Use a 4px or 8px spacing rhythm. Suggested scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Common usage:
- Label to input: 6–8px.
- Input internal padding: 12–14px.
- Card padding: 20–24px desktop; 16px mobile.
- Section gap: 24–32px.
- Page gutter: 32px desktop; 16–20px mobile.

### 4.4 Shape and elevation

| Token | Suggested value | Usage |
|---|---|---|
| `--radius-control` | `10px` | Inputs, buttons |
| `--radius-card` | `16px` | Cards and panels |
| `--radius-modal` | `18px` | Dialogs |
| `--radius-pill` | `999px` | Badges and chips |
| `--shadow-card` | Subtle, low opacity | Elevated cards only |
| `--shadow-modal` | Medium, soft | Modals and popovers |

Use borders and surface contrast before adding shadows. Avoid heavy elevation everywhere.

---

## 5. Emotion theme system

### 5.1 Theme modes

The application supports three modes:

1. **Automatic:** Use an eligible prediction to suggest and apply the mapped theme.
2. **Manual:** Use the user's saved theme selection regardless of model output.
3. **Default:** Use the base neutral theme and do not adapt automatically.

The stored preferences must distinguish `theme_mode` from `selected_theme`. A theme suggestion must never silently override Manual or Default mode.

### 5.2 Theme palette direction

The PRD lists the following visual directions. The exact colors below are initial design proposals, not psychological facts.

| Model label | Visual direction | UI interpretation |
|---|---|---|
| Joy | Warm, light, bright accent | Warm amber/peach accent over a readable neutral surface |
| Sadness | Muted blue | Soft blue accent with neutral writing surface |
| Fear | Soft neutral | Low-stimulation neutral palette |
| Anger | Muted warm | Restrained terracotta/rose accent, not aggressive red |
| Neutral | Balanced neutral | Base SoulScript palette |
| Surprise | Brighter accent | Clear, lively accent without high-saturation page backgrounds |
| Disgust | Restrained neutral | Muted green-gray accent with neutral surfaces |

### 5.3 Theme implementation contract

Create one central theme map. Example shape:

```js
export const themeTokens = {
  default: {
    bg: "#F7F5F2",
    surface: "#FFFFFF",
    surfaceMuted: "#F0EEEB",
    text: "#25242A",
    textMuted: "#706D75",
    primary: "#7662A8",
    border: "#E5E1DC"
  },
  joy: { /* token values */ },
  sadness: { /* token values */ },
  fear: { /* token values */ },
  anger: { /* token values */ },
  neutral: { /* token values */ },
  surprise: { /* token values */ },
  disgust: { /* token values */ }
};
```

The frontend theme controller must:
- Read saved preferences after authentication.
- Resolve the effective theme from mode and stored selection.
- Apply tokens to the document root.
- Persist user preference changes through the API.
- Avoid theme flashing during initial load.
- Respect `prefers-reduced-motion`.
- Never change the theme while the user is typing unless the user explicitly changes the setting.
- Use a stable default if prediction is absent, stale, unsupported, or unavailable.

### 5.4 Theme mapping rules

- Use the latest successful, non-stale prediction associated with the selected entry or the product's clearly defined current theme context.
- For the MVP, avoid letting an arbitrary older entry permanently control the global theme. The simplest rule is: only an explicitly selected/current entry can trigger an automatic suggestion, while the user's mode controls whether it is applied.
- If the project instead chooses “latest analyzed entry controls global theme,” document that behavior in the implementation and make it visible to users.
- If a label is not in the map, use the default theme.
- Do not use emotion colors as the only way to identify a category; always include labels/icons/text.

---

## 6. Application shell

### 6.1 Desktop layout

Recommended structure:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar          │ Main content area                              │
│                  │                                                 │
│ SoulScript       │ Page title                         New Entry    │
│                  │                                                 │
│ Dashboard        │ Main content                                    │
│ New Entry        │                                                 │
│ My Journal       │ Cards / editor / charts                         │
│ Analytics        │                                                 │
│ Weekly Insights  │                                                 │
│ Settings         │                                                 │
│                  │                                                 │
│ User / Logout    │                                                 │
└──────────────────────────────────────────────────────────────────┘
```

Desktop behavior:
- Fixed or sticky sidebar around 240–260px.
- Main content fills remaining width.
- Main page content max width around 1200px for dashboards and 900px for writing pages.
- Sidebar active item is clearly highlighted.
- Primary page action is aligned near the title when space allows.

### 6.2 Tablet layout

- Sidebar may collapse to icon rail or drawer.
- Main content uses two columns only when each card retains comfortable width.
- Charts may stack when needed.
- Maintain editor width and avoid side panels becoming too narrow.

### 6.3 Mobile layout

- Use a compact top header with wordmark and menu control.
- Use a drawer or compact bottom navigation for authenticated routes.
- Main content has 16–20px horizontal gutters.
- Cards stack vertically.
- Editor is full width.
- Primary action is reachable without obscuring content.
- Dialogs become near-full-screen sheets when necessary.
- Tables should become cards or horizontally scroll only when unavoidable.

### 6.4 Responsive breakpoints

Use Tailwind's standard breakpoints unless the implementation requires adjustment:
- Small/mobile: below `640px`.
- Medium/tablet: `640px–1023px`.
- Large/desktop: `1024px` and above.

Do not hard-code responsive behavior only to a specific device.

---

## 7. Reusable component specifications

### 7.1 Button

Variants:
- Primary: main action.
- Secondary: lower-emphasis action.
- Ghost: navigation or tertiary action.
- Danger: destructive action.
- Icon button: compact action with accessible label.

States:
- Default.
- Hover.
- Focus-visible.
- Active.
- Disabled.
- Loading.

Rules:
- Buttons must have clear verbs.
- Destructive buttons must be visually distinct.
- A loading button must prevent duplicate submission.
- Icon-only buttons need `aria-label` or visible tooltip text.

### 7.2 Text input

Used for title, email, search, and dates.

Required states:
- Default.
- Focus.
- Invalid.
- Disabled.
- Read-only.

Rules:
- Every input has a visible or programmatic label.
- Error text is associated with the field.
- Placeholder text must not replace the label.

### 7.3 Password input

- Show/hide toggle.
- Accessible label.
- Clear validation message.
- Do not expose password values in logs or analytics.
- Do not use password fields for non-secret text.

### 7.4 Journal editor

Anatomy:
1. Optional title field.
2. Main multiline writing surface.
3. Word count.
4. Optional self-reported mood selector.
5. Save action.
6. Save-and-analyze action if implemented.
7. Unsaved-change indicator when relevant.

Rules:
- Large comfortable text area.
- No distracting animation.
- Preserve line breaks.
- Do not auto-submit.
- Do not clear content after a failed save.
- Display AI results only after save and analysis.
- Do not silently change theme while writing.

### 7.5 Journal entry card

Display:
- Title or “Untitled entry.”
- Date/time.
- Short excerpt.
- Optional self-reported mood.
- Optional AI predicted label with “AI estimate” context.
- Click action to open entry.

Do not include full journal content in list responses or card DOM unnecessarily.

### 7.6 Emotion prediction card

Display:
- Heading: “AI-estimated emotions.”
- Dominant predicted label.
- Additional labels only if supported by model output and helpful.
- Model score in a restrained format with explanatory tooltip, or omit raw scores from the main view.
- Analysis timestamp.
- Stale status if content changed.
- Disclaimer: “These are estimates from the wording of your entry, not a definitive reading of how you feel.”
- User action to add/correct their own report.

Avoid a gauge implying a “happiness level” or a clinical severity score.

### 7.7 Mood/self-report selector

- Optional field labelled “How did you feel?”
- Show supported categories as chips or a compact select control.
- Provide a clear “No selection” default.
- Distinguish it visually and semantically from AI predictions.
- Avoid forcing users to select an emotion.

### 7.8 Analytics card

- Title.
- One-sentence explanation of what is counted.
- Chart.
- Legend and accessible labels.
- Tooltip.
- Empty and error states.

### 7.9 Weekly insight card

- Week range.
- Summary text.
- Small evidence/statistics row.
- Reflection prompt.
- Link to supporting entries where possible.
- Generate/retry action only when relevant.

### 7.10 Modal and confirmation dialog

Use for:
- Delete entry.
- Delete all entries.
- Delete account.
- Regenerate weekly insight if it overwrites current summary.

Requirements:
- Clear title and consequence.
- Cancel and confirm actions.
- Focus trap.
- Escape handling when appropriate.
- Initial focus on safe/cancel action for destructive confirmations.
- Do not make destructive confirmation the visually easiest action.

### 7.11 Toast and inline feedback

Use toast for:
- “Entry saved.”
- “Preferences updated.”
- “Export ready.”

Use inline messages for:
- Field validation.
- Analysis failure.
- Empty states.
- Permission/access errors.
- Persistent warnings.

---

## 8. Page-specific visual specifications

### 8.1 Landing page

**Desktop**
- Header with wordmark left, feature/privacy anchors, sign-in and Get Started actions right.
- Hero split layout: text and CTA left, product preview right.
- Preview should be composed of a synthetic journal card, sample AI-estimate badge, and theme sample.
- Three feature cards: Private writing, Explore patterns, Weekly reflection.
- Three-step “How it works.”
- Privacy statement before footer.

**Mobile**
- Stacked hero.
- One primary CTA.
- Product preview below.
- Feature cards stacked.
- Header menu collapses.

### 8.2 Register and login

- Centered card, narrow width around 400–460px.
- Wordmark and one-line privacy-oriented heading.
- Single-column form.
- Visible labels and clear field errors.
- Primary CTA full width.
- Secondary route link below.
- Avoid social login buttons unless they are actually implemented.

### 8.3 Dashboard

**Header row**
- Greeting and current date.
- “Write an entry” primary action.

**First row**
- Recent Entries card (larger).
- This Week card (smaller).

**Second row**
- Emotion Distribution card.
- Journal Activity card.

**Third row**
- Latest Weekly Reflection card.

If there are no entries:
- Replace empty charts with useful onboarding panels.
- Show “Write your first entry.”
- Do not show fake counts, invented emotions, or fake insights.

### 8.4 New Entry

- Main column takes about 70% width on wide desktop.
- Optional right panel contains self-reported mood and privacy note.
- On tablet/mobile, stack the side panel beneath editor or place mood selection below text.
- Title and editor are visually dominant.
- Save buttons remain obvious and accessible.
- Do not show empty prediction components before analysis.

### 8.5 Entry detail/edit

- Content in a readable surface with generous line width.
- Metadata and actions separated from writing.
- AI prediction card below or beside entry depending on width.
- Feedback form clearly distinguished.
- Edit mode should retain the same writing comfort as New Entry.
- Delete action belongs in a secondary menu and requires confirmation.

### 8.6 Journal history

- Title + New Entry action.
- Search and filters in one toolbar.
- Entry cards in a vertical timeline/list.
- Use pagination or load-more.
- Display date grouping only if it improves scanning.
- Search/filter state should remain visible.

### 8.7 Analytics

- Title and date-range selector.
- Top summary cards.
- Chart cards in a responsive 2-column desktop grid and single-column mobile layout.
- Prediction comparison card must show its denominator and caveat.
- Recurring topics panel should not visually suggest causal relationships.

### 8.8 Weekly insights

- Week navigation at top.
- Main summary card with concise copy.
- Supporting statistics below.
- Reflection prompt visually distinct.
- Previous summaries as a list, not a dense data table.
- Supporting entries link to the relevant entry page.

### 8.9 Settings

Use grouped sections with clear labels:
- Appearance.
- Account.
- Your data.
- Privacy and AI.

Place destructive account deletion below normal settings, in a visually separate danger area.

---

## 9. Motion and interaction

- Use short transitions for hover/focus/theme changes, generally around 150–220ms.
- Avoid parallax, looping decorative motion, and animated backgrounds.
- Respect reduced-motion settings.
- Charts may animate in subtly, but must remain understandable without animation.
- Saving should show a clear pending state.
- Do not cause layout shifts when prediction cards appear.
- Theme transition should be subtle and should not flash on page load.

---

## 10. Accessibility requirements

Target WCAG 2.1 AA principles for the core experience.

- Text contrast should meet appropriate contrast thresholds.
- Keyboard focus must be visible.
- All form fields need labels.
- Buttons and icon actions need accessible names.
- Dialogs need focus management and appropriate semantics.
- Charts must expose labels, legends, and a text summary or data table equivalent.
- Emotion categories must not be communicated through color alone.
- Use semantic headings in order.
- Ensure mobile targets are comfortably tappable.
- Respect system reduced-motion preference.
- Use clear error messages that identify how to fix the problem.

---

## 11. Frontend component map

Suggested component tree:

```text
App
├── AuthProvider
├── ThemeProvider
├── PublicLayout
│   ├── LandingPage
│   ├── LoginPage
│   └── RegisterPage
└── ProtectedLayout
    ├── AppSidebar / MobileNavigation
    ├── AppHeader
    ├── DashboardPage
    │   ├── RecentEntries
    │   ├── WeeklyActivityCard
    │   ├── EmotionDistributionChart
    │   ├── JournalActivityChart
    │   └── LatestInsightCard
    ├── JournalEditorPage
    │   ├── JournalEditor
    │   └── SelfReportedMoodSelector
    ├── JournalHistoryPage
    │   ├── JournalFilters
    │   └── JournalEntryCard
    ├── EntryDetailPage
    │   ├── EntryContent
    │   ├── EmotionPredictionCard
    │   └── EmotionFeedbackForm
    ├── AnalyticsPage
    ├── WeeklyInsightsPage
    └── SettingsPage
```

This is a conceptual map. The agent may adjust file boundaries while preserving responsibilities and user-visible behavior.

---

## 12. Frontend implementation rules for the coding agent

1. Build reusable controls before duplicating UI.
2. Keep API calls in a service layer, not scattered inside components.
3. Keep global authentication and theme state in providers or an equivalent deliberate state solution.
4. Do not store private journal content in global state longer than needed.
5. Never place secrets in frontend environment variables; frontend build variables are public.
6. Use a single API base URL configuration.
7. Handle loading, empty, error, and success states on every data-driven page.
8. Do not use mock data in production flows. Mock data is allowed only in isolated development previews and must be clearly identified.
9. Do not hardcode analytics values.
10. Avoid creating theme behavior in multiple components; use one theme controller.
11. Ensure delete and export actions always target the authenticated user's own data.
12. Do not remove or rewrite unrelated components to fix a localized bug.

---

## 13. Design QA checklist

Before marking a UI feature done, verify:

- [ ] The page matches the purpose in this document.
- [ ] Main action is visually obvious.
- [ ] Navigation and active state are clear.
- [ ] All fields have labels.
- [ ] Loading, empty, error, and success states exist.
- [ ] Layout works at mobile, tablet, and desktop widths.
- [ ] Theme mode and selected theme are respected.
- [ ] Text is readable in every palette.
- [ ] Color is not the only way information is conveyed.
- [ ] Keyboard focus is visible.
- [ ] Destructive actions require confirmation.
- [ ] The page uses real backend data when integrated.
- [ ] No private user data appears in public previews, console logs, or screenshots.

---

## 14. Open implementation choices

The PRD intentionally leaves some implementation choices open. The agent should use these MVP defaults unless the project owner decides otherwise:

1. Use one base light theme plus the seven emotion-oriented palettes.
2. Use manual theme selection as the highest-priority preference.
3. Use a focused text editor rather than a rich-text editor for MVP.
4. Use cards and Recharts for analytics.
5. Use deterministic weekly summaries first; do not add LLM narrative generation to the initial MVP.
6. Use a simple vertical list for journal history with server-side pagination.
7. Use synchronous JSON export for the initial small-scale deployment if the data volume is modest.
8. Do not implement a separate microservice for model inference in MVP.

If any of these choices are changed, update `implementation_plan.md` and the actual product documentation so the code and specification remain aligned.
