# Mihaoo — Codex Handoff

_Revision 2: 2026-10-06. Original project handoff retained; provenance clarified and execution/testing rules added._

Read this file together with `AGENTS.md` before making changes.

**Local checkpoint updated 2026-10-06:** section 39 contains actual local results on
`main` / `222d89e385456db25ab27f691482137469d4457d` plus this batch's uncommitted diff.
Earlier “current” descriptions are historical unless confirmed there.
The test matrix is at repository root: `RESPONSIVE_TEST_MATRIX.md`.
Implementation documentation: `docs/responsive/GUIDELINES.md` and `docs/responsive/PATTERNS.md`.

This document preserves the decisions, architecture, current implementation state, constraints and next steps needed to continue Mihaoo safely.

---

## 0. Read first: evidence, status and revision scope

This is a handoff snapshot, **not a fresh repository audit or a report of deployed features**.
Revision 2 was prepared by reviewing the two handoff files and the preceding conversation. No local Mihaoo checkout, live database, deployment, or browser session was verified while preparing this revision.

Interpret the rest of the document with these labels:

| Label                  | Meaning                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Owner requirement      | Explicitly requested: responsive frontend, reusable patterns, 4K coverage, backend work as small Jira tasks, and work in coherent batches without per-edit pushes.                                     |
| Previous code snapshot | Implementation described in prior repository reads. Commit identifiers in section 2 are historical anchors, not a claim about today's latest branch or the owner's local tree.                         |
| Proposed               | Design choices, expected API JSON, the 768px navigation split, and the approximately 1920px content cap. Implement with inspection/testing; do not present them as already accepted backend contracts. |
| Unverified / pending   | SQL execution and exact imported schema/data, current deployed API availability, responsive screenshots, integration tests, and Confluence publication.                                                |

The owner's current local tree may already include the fixes or responsive changes discussed in this handoff. Inspect before editing; never reapply old snippets blindly.

Current code establishes what exists. It does not override the owner's latest requirements or justify retaining a known bug. Preserve local edits and report material disagreements rather than resetting files to a historical commit.

Specific clarifications to the original handoff:

- Sections 15-17 preserve a **draft** report contract. Freeze/verify its exact envelope, field types, date semantics and permissions before live integration.
- Sections 20-21 are historical-data background, **not verified DDL or an import manifest**. In particular, nullable fields, raw member keys, source-row metadata and example legacy brand codes need confirmation from the actual SQL/schema.
- The owner reported uploading the SQL. That does not establish that it was executed in the intended database. Do not rerun an import based on this document.
- An implemented frontend service method, a successful build, and an API-ready flag are not evidence that a backend endpoint is deployed or tested.
- Do not combine Weekly Report summaries and TaskBrandProgress aggregates into one total without an explicit source-of-truth decision.

New material in revision 2 is proposed project guidance: sections 39-43 and `docs/RESPONSIVE_TEST_MATRIX.md`. It adds execution safeguards and acceptance checks; it does not authorize expanding the feature scope.

---

## 1. Project purpose

Mihaoo is an internal workspace for the Content / Retention team.

Main product areas:

- Dashboard
- Tournaments
- Promo
- News
- Checklists
- Banner Export
- Maps
- Analytics
- Tasks
- Auth / users

Immediate priority: frontend quality and a reusable responsive/adaptive model, not new feature scope.

---

## 2. Repositories and stack

### Frontend

Repository: `DemureFace/Mihaoo`

Hosting: `https://mihaoo.netlify.app`

Stack:

- Vue 3
- Composition API
- `<script setup>`
- JavaScript only
- Vite
- Tailwind CSS v4
- Vue Router
- Vuex
- Axios
- Heroicons
- Vue Flow for Maps

Current scripts:

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --fix",
  "format": "prettier --write src/"
}
```

Frontend `main` commit recorded in the previous conversation (historical snapshot; recheck local state):

`0ab4459b0ec0196f68f31596aa73bc7625ae8a9b`

### Backend

Repository: `DemureFace/BackendMihaoo`

Architecture:

- NestJS
- Prisma
- PostgreSQL
- JWT
- microservice-oriented structure
- API gateway
- deployed separately on Render

Backend `main` commit recorded in the previous conversation (historical snapshot; deployment not verified):

`11df4be3a8b73d197370610826879cb3d4166e35`

Backend changes are handled separately. Do not implement backend code from frontend work.

---

## 3. Critical working rules

### Backend

If frontend work requires backend changes:

- create a small Jira-style task;
- include context, scope and acceptance criteria;
- do not implement backend code;
- keep backend tasks small, not giant umbrella tickets.

### Frontend

Direct frontend changes are allowed.

Prefer:

- Base components;
- Tailwind utilities;
- reusable patterns;
- API adapters in services;
- feature flags when endpoints are not ready.

Avoid:

- page-specific hacks;
- duplicated primitives;
- speculative response contracts;
- unnecessary dependencies.

### Git

Do not commit/push after every small change.

Work in logical batches. Commit/push only when explicitly requested.

---

## 4. Environment flags

Current `.env.example`:

```env
VITE_API_URL=http://localhost:3000
VITE_WEEKLY_REPORTS_API_READY=false
VITE_ANALYTICS_REPORT_API_READY=false
```

Keep both API-ready flags `false` until backend implementation is actually ready and verified.

---

## 5. Router and authentication

Analytics routes:

```text
/analytics/tasks
/analytics/report
```

The Analytics parent route is protected with:

```js
meta: {
  section: 'analytics',
  requiresAuth: true,
}
```

The router guard checks:

```js
localStorage.getItem('accessToken')
```

Without a token, protected routes redirect to `/dashboard` with login query params.

A local-only dev bypass for Analytics may be used for visual work, but must be guarded by `import.meta.env.DEV` and must not become production auth behavior.

---

## 6. Base components

Known Base components:

- `BaseButton.vue`
- `BaseCheckbox.vue`
- `BaseInput.vue`
- `BaseLoader.vue`
- `BaseModal.vue`
- `BaseSelect.vue`
- `BaseTextarea.vue`

There is no verified `BaseTable.vue` in the current repository.

### BaseButton

Variants:

- primary
- secondary
- ghost
- danger
- link
- plain

Sizes:

- sm
- md
- lg

Supports:

- loading
- disabled
- router links
- href
- fullWidth

### BaseModal

Current behavior:

- Teleport to body
- Escape closes
- overlay click closes
- body scroll lock
- sizes sm/md/lg/xl
- desktop-centered layout

Responsive target:

- mobile bottom/fullscreen-like modal
- `100dvh` max height
- smaller padding on mobile
- preserve desktop centered behavior

---

## 7. Current global layout

Main files:

- `src/App.vue`
- `src/components/TheHeader.vue`
- `src/components/SideBar.vue`

Current desktop layout:

- fixed 56px header
- fixed sidebar below header
- expanded sidebar `w-56`
- collapsed sidebar `w-16`
- main content uses `ml-56` or `ml-16`

This is not yet a reusable mobile/tablet shell.

Target behavior:

### Mobile `< 768px`

- fixed header;
- sidebar becomes off-canvas drawer;
- no permanent sidebar width reservation;
- main uses `ml-0`;
- overlay behind drawer;
- drawer closes after navigation.

### Desktop `>= 768px`

- keep fixed sidebar;
- expanded ~224px;
- collapsed ~64px.

### 2K / 4K

- do not stretch content across 3840px;
- use centered content with a max width;
- current planned max width: around `1920px`.

---

## 8. Responsive OKR

The active OKR is frontend/project adaptability across screen sizes.

### KR1 — implemented and tested model

Reference matrix (CSS viewport dimensions; see `docs/RESPONSIVE_TEST_MATRIX.md` for DPR, zoom and evidence):

```text
320 x 568
375 x 667
390 x 844
768 x 1024
1024 x 768
1280 x 800
1440 x 900
1920 x 1080
2560 x 1440
3840 x 2160
```

Expected:

- no uncontrolled page-level horizontal overflow;
- sidebar does not break content;
- forms stay usable;
- text stays inside containers;
- actions remain reachable;
- modals fit viewport;
- tables remain usable;
- sticky UI does not consume most of mobile viewport;
- no core action depends only on hover;
- desktop does not regress.

### KR2 — Confluence documentation

Planned document:

`Mihaoo Frontend Responsive & Adaptive Guidelines`

Suggested structure:

1. Purpose
2. Breakpoints
3. Global layout
4. Sidebar
5. Header
6. Spacing
7. Typography
8. Responsive grids
9. Forms
10. Tables
11. Modals
12. Navigation
13. Overflow rules
14. Component requirements
15. Testing matrix
16. Known limitations
17. Practical examples

### KR3 — reusable implementation

Reusable patterns should include:

- global shell;
- mobile sidebar drawer;
- responsive action bar;
- responsive filters;
- responsive cards/KPI grid;
- scroll-contained tables;
- responsive modal;
- responsive form grid;
- max-width behavior for large screens.

Reference modules:

1. Analytics
2. Tournaments / Promo or Checklists

---

## 9. Responsive implementation order

```text
1. Global App layout
2. Header
3. Sidebar
4. BaseModal
5. Analytics shell + filters
6. Analytics Task List
7. Analytics Report
8. Weekly Report UI
9. Tournament / Promo
10. Checklists
11. Banner Export
12. Maps
13. Other pages
```

Do not manually adapt every page first. Build shared patterns, then apply them.

---

## 10. Planned first responsive batch

### `src/App.vue`

Planned:

- `matchMedia('(max-width: 767px)')`;
- mobile sidebar state separate from desktop collapsed state;
- drawer + overlay;
- `100dvh` sidebar height;
- `ml-0` on mobile;
- keep `ml-16 / ml-56` on desktop;
- centered content;
- max content width around `1920px`;
- close mobile drawer on route change.

### `src/components/TheHeader.vue`

Planned:

- add `mobile` prop;
- add `sidebarOpen` prop;
- `Bars3Icon` / `XMarkIcon` on mobile;
- chevrons stay on desktop;
- reduce small-screen padding;
- hide `Mihaoo` text on very narrow screens, keep logo.

### `src/components/SideBar.vue`

Planned:

- `overflow-y-auto`;
- `overscroll-contain`;
- hover animation only inside `@media (hover: hover)`.

### `src/components/base/BaseModal.vue`

Mobile:

- bottom/fullscreen-like;
- width 100%;
- max-height `100dvh`;
- scroll inside;
- smaller padding;
- rounded top corners.

Desktop:

- centered;
- max-height around `90vh`;
- existing size system retained.

### `src/views/analytics/AnalyticsView.vue`

Planned:

- remove duplicate horizontal page padding once App owns gutters;
- responsive heading `text-2xl sm:text-3xl`.

### `src/components/analytics/AnalyticsFilters.vue`

Planned:

- not sticky on mobile;
- sticky only on large screens;
- toolbar stacks on mobile;
- presets wrap;
- Reset / Apply share full width on mobile;
- smaller mobile padding.

---

## 11. Analytics module overview

Routes:

- `/analytics/tasks`
- `/analytics/report`

Main files:

```text
src/views/analytics/AnalyticsView.vue
src/views/analytics/AnalyticsTaskListView.vue
src/views/analytics/AnalyticsReportView.vue

src/components/analytics/AnalyticsFilters.vue
src/components/analytics/AnalyticsTaskCreateModal.vue
src/components/analytics/AnalyticsTaskDetailsModal.vue
src/components/analytics/AnalyticsWeeklyReportModal.vue
src/components/analytics/AnalyticsWeeklyReportHistory.vue
src/components/analytics/AnalyticsWeeklyReportDetailsModal.vue
src/components/analytics/AnalyticsPeriodDynamics.vue
src/components/analytics/AnalyticsPeriodBrandPivot.vue

src/store/modules/analytics.js
src/services/analytics.service.js
```

Task List is connected to the current Tasks backend.

Analytics Report and Weekly Reports are frontend-prepared but their dedicated backend APIs are not considered ready.

---

## 12. Analytics Task List

Current functionality:

- TaskBrand table;
- pagination;
- filters;
- sorting;
- details;
- create;
- duplicate;
- CSV export;
- loading/error/empty states;
- request abort handling.

One row = one brand row.

Current table has a large min width (`min-w-[1300px]`).

Responsive policy:

- keep contained horizontal scrolling;
- do not compress all columns into mobile width;
- do not allow body/page horizontal scrolling.

---

## 13. Analytics Filters

Current filters:

- search
- from
- to
- executor
- brand
- platform
- task type
- requested by
- status

Presets:

- week
- month
- quarter
- all time

Filters live in Vuex.

`APPLY_FILTERS` resets page to 1 and increments `filterVersion`.

Task List and Report react to `filterVersion`.

---

## 14. Analytics Report frontend state

Current blocks:

- KPI
- Task Types
- Executors
- Brands
- Period Dynamics
- Period x Brand
- drill-down to Task List

Drill-down rows/cells can carry `filters`.

Frontend merges drill-down filters with global filters and routes to `analytics-tasks`.

Frontend service expects:

`GET /tasks/report`

This remains feature-flagged off until backend implementation is ready.

---

## 15. Analytics Report semantics

Backend draft:

`apps/analytics-service/REPORT_API_DRAFT.md`

Status: draft, not implemented.

Filters match `GET /tasks` minus pagination:

- executorId
- requestedById
- brand
- platform
- taskType
- status
- from
- to
- search

Aggregates use the full filtered set, never current pagination.

Important period semantics:

### Task-level grouping / totalTasks

Use `TaskGroup.reportDate`.

### SP per period

Use `TaskBrandProgress.date`.

Do not use `TaskBrand.storyPoints` estimate as credited SP.

### Done-task count per period

Use `TaskBrand.closedAt`.

### KPI concepts

- totalTasks
- doneTasks
- inProgressTasks
- completionRate
- totalSP
- doneSP

`completionRate` is a ratio:

```text
0.75 = 75%
```

### Average SP

Formula is still unresolved.

Do not build new UI dependencies around Average SP until explicitly confirmed.

---

## 16. Recommended canonical Analytics Report contract

Top-level:

```text
kpi
taskTypes
executors
brands
periodDynamics
periodBrandPivot
```

### KPI

```json
{
  "totalTasks": 0,
  "doneTasks": 0,
  "inProgressTasks": 0,
  "completionRate": null,
  "totalSP": 0,
  "doneSP": 0
}
```

### Task Type row

```json
{
  "taskType": "PROMO",
  "count": 0,
  "doneCount": 0,
  "completionRate": null,
  "totalSP": 0,
  "filters": {
    "taskType": "PROMO"
  }
}
```

### Executor row

```json
{
  "executorId": 1,
  "executorName": "Name",
  "count": 0,
  "doneCount": 0,
  "completionRate": null,
  "totalSP": 0,
  "filters": {
    "executorId": 1
  }
}
```

### Brand row

```json
{
  "brand": "JC",
  "count": 0,
  "doneCount": 0,
  "completionRate": null,
  "totalSP": 0,
  "filters": {
    "brand": "JC"
  }
}
```

### Period Dynamics row

```json
{
  "sprintId": 1,
  "sprintName": "Sprint 10",
  "startDate": "2026-09-21",
  "endDate": "2026-09-27",
  "totalTasks": 0,
  "doneTasks": 0,
  "completionRate": null,
  "totalSP": 0,
  "doneSP": 0,
  "filters": {
    "from": "2026-09-21",
    "to": "2026-09-27"
  }
}
```

### Period x Brand

Recommended:

```text
brands: string[]
rows: PeriodBrandRow[]
```

Cell:

```json
{
  "brandCode": "JC",
  "totalSP": 2.4,
  "filters": {
    "from": "2026-09-21",
    "to": "2026-09-27",
    "brand": "JC"
  }
}
```

Do not silently change frontend around a speculative backend shape.

---

## 17. Flexible adapter

Because the backend contract is not frozen, frontend currently tolerates aliases such as:

```text
periodDynamics || periods
periodBrandPivot || periodBrand
row.cells || row.values || row.brands
```

Keep this until the backend response contract is finalized.

Then simplify.

---

## 18. Weekly Reports frontend state

Flow includes:

- create form;
- local preview;
- edit;
- history;
- details modal;
- service methods;
- feature flag;
- loading/error states;
- legacy brand handling;
- Sprint loading;
- AbortController work.

Frontend expects:

- `GET /weekly-reports`
- `GET /weekly-reports/:id`
- `POST /weekly-reports`
- `PATCH /weekly-reports/:id`

Backend endpoints are not considered ready yet.

---

## 19. Weekly Report form semantics

Main file:

`src/components/analytics/AnalyticsWeeklyReportModal.vue`

Fields:

- Sprint
- Specialist
- Planned SP
- per-brand Tasks
- per-brand Story Points
- Team Lead Activity SP
- Preview Task SP
- Vacation SP

Calculated locally:

```text
Brand SP = sum brand SP
Additional SP = TL Activity + Preview + Vacation
Done SP = Brand SP + Additional SP
Performance = Done SP / Planned SP * 100
```

Rules:

- task count must be integer;
- negatives invalid;
- Sprint disabled on edit.

---

## 20. Weekly Report historical data

Historical reports may contain brand codes not in current reference data.

Illustrative legacy code from the previous handoff: `SR33`. Its presence in the actual imported SQL has not been verified here; do not hardcode exceptions around this example.

Rules:

- `brandCode` must remain string-compatible;
- unknown historical codes must still render;
- editing unrelated fields must not remove historical metrics;
- label can fall back to raw code.

---

## 21. Weekly Report persistence background

Unverified model background from the prior handoff is retained below for orientation.
**This is not a verified schema:** field names, types, nullability, constraints and deployment status must be checked against the actual SQL and Prisma schema before any integration or migration task. No database operation is authorized by this list.

Concepts previously discussed include:

### WeeklyReport

Concepts:

- sprintId
- teamMemberId nullable for migrated rows
- memberSourceKey nullable
- memberDisplayName
- tasksAmount
- doneStoryPoints
- plannedStoryPoints
- performancePercent
- teamLeadActivitySp
- previewTaskSp
- vacationSp
- sourceType
- sourceRowNumber
- submittedAt
- timestamps

### WeeklyReportBrandMetric

Important:

- `brandCode` is text/string;
- unique by report + brandCode;
- legacy codes allowed.

### WeeklyReportTeamSummary

Historical/team-level snapshot.

Do not assume it can always be recomputed from member rows.

### WeeklyReportTeamBrandMetric

Team-level per-brand snapshot.

Important:
An uploaded migration file is not proof that SQL was executed in production.

---

## 22. Current known Analytics issues

Always inspect the local working tree first because some may already be fixed locally.

### A. Duplicate controllers

The checked `main` had duplicate declarations in `AnalyticsReportView.vue`:

```js
let weeklyReportsController = null
let weeklyReportDetailsController = null
let weeklyReportsController = null
let weeklyReportDetailsController = null
```

Keep one of each.

Compile blocker.

### B. Duplicate watch

`watch(weeklyReportDetailsOpen, ...)` appeared twice.

Keep one.

### C. Stale KPI formatter

`formatPercent` was renamed to `formatRate`, but KPI code still referenced `formatPercent` in the checked commit.

Use `formatRate` consistently.

### D. Persisted brand metrics

Existing metrics receive `isPersisted: true`, but checked `prepareReport()` still filtered only non-zero values after mapping.

Intended behavior:

```text
CREATE:
0 / 0 -> omit

EDIT:
existing 0 / 0 -> preserve

EDIT legacy existing 0 / 0 -> preserve
```

Filter using `isPersisted` before mapping.

### E. Pivot hardening

When extracting `periodBrandPivot.brands`, filter falsy codes to avoid an undefined column.

---

## 23. Abort / race-condition strategy

Expected:

- stale report request must not overwrite new filters;
- stale Weekly Report history request must not overwrite fresh data;
- open A then B -> A must not replace B;
- closing details modal aborts details request;
- opening/closing Weekly form must not allow stale Sprint request to mutate a newer session.

Do not blindly abort write requests.

For POST/PATCH, client abort does not guarantee backend write cancellation.

---

## 24. Analytics store

File:

`src/store/modules/analytics.js`

State includes:

- rows
- filters
- filterVersion
- page
- sortBy
- sortOrder
- loading/error
- total
- hasNext
- requestId
- members
- referenceData

Label getters:

- memberName
- platformLabel
- brandLabel
- taskTypeLabel

Raw-code fallback is useful for legacy data.

---

## 25. Analytics service

File:

`src/services/analytics.service.js`

Known methods:

```text
list
getDuplicateTemplate
listMembers
getReferenceData
listSprints
listWeeklyReports
getAnalyticsReport
getWeeklyReport
createWeeklyReport
updateWeeklyReport
createTask
getTask
updateTaskBrand
deleteTaskBrand
restoreTaskBrand
updateTaskGroup
exportCsv
addTaskComment
```

Task endpoints recorded in the prior code discussion include (live availability not rechecked here):

- `GET /tasks`
- `GET /tasks/export`

Prepared future endpoints include:

- `GET /tasks/report`
- `/weekly-reports`

---

## 26. Task / SP semantics

Do not confuse:

### Estimate

`TaskBrand.storyPoints`

### Actual credited work

`TaskBrandProgress.storyPoints`

Example:

```text
Task estimate: 1.0
Week 1 credited: 0.4
Week 2 credited: 0.6

Week 1 report contribution = 0.4
Week 2 report contribution = 0.6
```

Do not assign the full estimate to one period.

---

## 27. Other modules

### Tournaments / Promo

Parser/generator work exists.

General intent:

- parse task descriptions;
- extract dates, names, banners, categories, bonus code, prize pool, rules and GEO data;
- support history/export/copy;
- connect frontend to backend where implemented;
- remove duplicated frontend-only logic when backend owns it.

Do not mix new parser functionality into the responsive phase unless needed for UI adaptation.

### Banner Export

Figma-oriented flow:

- Campaign ID
- Figma URL
- Inspect
- Create export
- Poll
- ZIP
- Manifest
- png/webp
- quality settings

Future access edge case:
If Figma account has no access to a design, surface the inaccessible link and support an access-request workflow.

### Checklists

Current frontend concepts:

- list/search/sort;
- detail;
- create/edit/delete;
- progress;
- mark all/reset;
- localStorage seed versioning.

Shared/personal/DB behavior is evolving.

### Maps

Vue Flow-based interactive maps.

Long-term sharing model should resemble Google Docs:

- view
- comment
- edit

Users should only see accessible/shared maps.

### News

CRUD/role-oriented module planned.

---

## 28. Base-component migration principle

When refactoring:

- do not create one-off buttons if `BaseButton` works;
- use `BaseInput`, `BaseSelect`, `BaseTextarea`, `BaseModal`;
- improve Base components when multiple pages need the same responsive behavior;
- avoid duplicating large identical Tailwind class sets.

If a pattern is genuinely shared, move it into a reusable component or layout.

---

## 29. Responsive table policy

Preferred pattern:

```text
page
└── card
    └── overflow-x-auto
        └── table with sensible min-width
```

Rules:

- no body-level horizontal scrolling;
- table scroll stays inside its section;
- readable cell widths;
- actions stay accessible;
- sticky first column only when it clearly helps.

Applies especially to Analytics tables and Weekly Report history.

---

## 30. Responsive modal policy

### Mobile

- bottom/fullscreen-like;
- width 100%;
- max-height `100dvh`;
- internal scrolling;
- safe padding;
- reachable actions.

### Desktop

- centered;
- max-height around `90vh`;
- use existing size system.

Do not create separate mobile modal components unless necessary.

---

## 31. Sidebar policy

### Mobile

- closed by default;
- drawer from left;
- overlay;
- closes after navigation;
- vertical scroll;
- no permanent width reservation.

### Desktop

- expanded/collapsed;
- no overlay;
- current dropdown behavior preserved.

Do not rely on hover for touch.

---

## 32. 4K policy

4K is part of acceptance.

Do not scale everything up.

Preferred:

- retain readable control sizes;
- center content;
- cap core content width;
- allow outer whitespace;
- avoid unnecessarily huge table widths.

Proposed starting max width for normal content: approximately `1920px`.
This is not a mandatory cap for every page: Maps/canvas and wide operational tables may need an explicit wide container. Keep an accessible viewport-sized shell in either case.

A physical 4K panel is not necessarily a 3840px-wide CSS viewport. Test wide CSS viewports and scaled/high-DPR configurations separately; record actual values rather than inferring them from the monitor label.

---

## 33. Auth/password context

Backend password validation was recently changed to Latin-letter based rules.

Do not reintroduce older Hebrew-only assumptions in frontend validation.

If frontend/backend validation differs, align explicitly.

---

## 34. Deployment caution

Frontend is on Netlify.

Backend is deployed separately.

Do not enable unfinished feature flags until:

- endpoint exists;
- gateway route exists if needed;
- auth works;
- response shape is verified;
- errors are verified;
- environment/CORS are correct.

Local build success is not proof of production integration.

---

## 35. Immediate Codex execution plan

Before editing:

1. Read `AGENTS.md`.
2. Read this file.
3. Inspect `git status`.
4. Inspect current versions of:
   - `src/App.vue`
   - `src/components/TheHeader.vue`
   - `src/components/SideBar.vue`
   - `src/components/base/BaseModal.vue`
   - `src/views/analytics/AnalyticsView.vue`
   - `src/components/analytics/AnalyticsFilters.vue`
   - `src/views/analytics/AnalyticsReportView.vue`
   - `src/components/analytics/AnalyticsWeeklyReportModal.vue`
5. Fix compile blockers only if they still exist locally.
6. Implement first responsive batch.
7. Do not commit or push.
8. Run checks after the logical batch.
9. Summarize changed files, behavior, risks and remaining issues.

Then continue to page-level Analytics responsive work.

---

## 36. First Codex prompt

```text
Read AGENTS.md and docs/CODEX_HANDOFF.md completely before making changes.

Also read docs/RESPONSIVE_TEST_MATRIX.md.
Inspect the repository root, branch, working tree and staged/unstaged diffs first. Local code may be newer than this handoff: preserve it and use it as the implementation baseline, while following the owner's latest requirements. Report material conflicts; do not reset files to the snapshot.

Do not modify backend code.
Do not commit or push.

First, fix only any remaining compile blockers described in CODEX_HANDOFF.md if they still exist.

Then implement the first reusable responsive batch for:
- src/App.vue
- src/components/TheHeader.vue
- src/components/SideBar.vue
- src/components/base/BaseModal.vue
- src/views/analytics/AnalyticsView.vue
- src/components/analytics/AnalyticsFilters.vue

Requirements:
- mobile-first;
- support 320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560 and 3840 widths;
- mobile sidebar is a drawer with overlay, appropriate focus/keyboard behavior, and no tab-accessible hidden links;
- desktop collapsed/expanded sidebar behavior remains;
- mobile modal is fullscreen-like/bottom-aligned and scrollable, with shared scroll-lock handling and restoration of focus;
- filters are not sticky on small screens;
- no page-level horizontal overflow;
- use Tailwind and existing Base components;
- no new dependencies;
- preserve current behavior.

After changes:
- run npm run format;
- run npx eslint .;
- run npm run build;
- review the diff for unrelated changes;
- record actual browser/viewport checks in docs/RESPONSIVE_TEST_MATRIX.md; mark unavailable checks NOT RUN or BLOCKED;
- update the current checkpoint in docs/CODEX_HANDOFF.md;
- summarize the diff, real test outcomes and any remaining issues;
- do not commit or push.
```

---

## 37. What not to do

Unless explicitly requested:

- do not implement backend APIs;
- do not enable unfinished feature flags;
- do not add Average SP UI;
- do not add a chart library;
- do not redesign Analytics scope;
- do not replace Vuex;
- do not convert to TypeScript;
- do not change router/auth architecture;
- do not commit/push automatically.

---

## 38. Definition of done for the responsive phase

The responsive phase is complete when:

1. Global shell works across the target matrix.
2. Shared components support mobile/desktop patterns.
3. Analytics is usable on all target widths.
4. At least one second module uses the same patterns.
5. No uncontrolled body-level horizontal overflow remains.
6. Build and lint checks pass.
7. Responsive test results are documented.
8. Confluence documentation contains reusable rules and examples.
9. Known limitations are explicitly recorded.

At that point the work can be presented as the reusable Mihaoo responsive/adaptive frontend model required by the OKR.

---

## 39. Safe execution and continuity

### Begin a coherent batch

Inspect the root and baseline before changes:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short
git diff --stat
git diff --cached --stat
```

Then read targeted diffs/files. Do not dump `.env`, tokens or credential-bearing remote URLs into output. Do not discard pre-existing work, automatically stash it, switch branches or require a clean tree just to begin.

Check `package.json`, the lockfile and any existing Node-version declarations. Use project tooling; do not upgrade Vite/Vue/Tailwind/Node as incidental responsive work. Missing tooling is a setup issue to report, not justification for a forced audit fix.

Use the exact file casing on Mac, Windows and Linux. The known components are `SideBar.vue` and `TheHeader.vue`; do not create parallel files named `Sidebar.vue` or `Header.vue` by mistake.

Implement the approved batch end to end, rather than asking the owner to approve every file. Pause for material ambiguity, destructive actions, new dependencies, production operations or scope expansion, not for every CSS class.

### End a batch

Report in Ukrainian:

```text
Batch:
Baseline commit and pre-existing local edits:
Files changed:
Behavior implemented:
Commands actually run and outcomes:
Browser checks and evidence:
Pre-existing failures / introduced failures:
Blocked or unverified scenarios:
Next coherent batch:
Git commit/push: not performed unless explicitly requested
```

Update the checkpoint below after implementation, not merely after planning. Keep detailed logs/screenshots in the test matrix or an existing project evidence location; do not append secrets or massive terminal dumps here.

### Current checkpoint — actual local batch, 2026-10-06

**Latest batch: product QA + Dashboard/News**, baseline `main` / `9f88182`, clean before batch.
Owner screenshots exposed global button CSS cascade defects. Moved native defaults into base layer and added explicit plain/link/ghost hover utilities; sidebar hover contrast and auth link borders now tested.
Password field reserves toggle space; accessible Show/Hide, inline auth loading and duplicate-submit guards.
Forgot Password dead control replaced by honest administrator guidance (no reset API).
Signup hint corrected, logo changed to Vite asset import.
Fixed plain checklist mark-all and KeepAlive Escape cleanup, corrupt cached-user bootstrap, invalid Maps import root/metadata.

Dashboard now has six module links, local-only counts, updates and workflow guidance.
News has four curated frontend notes, search/category/details/empty reset; clearly not a live news API or deployment report.
New data: `src/data/productUpdates.js`. No fabricated team KPI/backend health.

Final evidence: 9 product PASS, 7 contract fixture PASS, 260 responsive PASS, 11 production-preview route smoke PASS.
ESLint/build/scoped Prettier PASS; bundle >500kB warning remains.
Evidence/report: `docs/product/TEST_REPORT.md`, `docs/product/evidence/`, `docs/responsive/evidence/product/results.json`.
Production preview at 127.0.0.1:4173 is local only, not deployed.
No backend/dependency/flag changes or commit/push/deploy.
Live auth success/roles/DB writes/Figma/translation and real Safari/iPhone/keyboard/zoom remain unverified.
Detailed residual domain/editor/canvas scenarios are explicitly listed in the report.
Next coherent batch: approved staging test account/DB + real auth/permissions/persistence, then deeper checklist group editor and Maps canvas tests.
Earlier checkpoints below are historical.

**Latest batch: backend alignment.** Owner supplied `DemureFace/MihaooBackend`; this replaces the historical backend repository name for current work.
Frontend baseline `6b9c4d5`, backend checkout `6ef33fb`, both main/clean before batch.
Backend read-only; no fetch/deploy/schema/data operations. Frontend changes remain uncommitted.

Implemented:
- Tasks `{data,total}` envelope and comma-separated multi-filter serialization; strict Sprint responses.
- Shared API JSON/Blob error normalization and token-aware 401; failed Login/stale response does not clear a newer session.
- Signup policy matches RegisterDto; profile network/502 outage preserves JWT.
- Shared reference/member dispatches await one in-flight request.
- Banner JWT inspect/create/poll/manifest/ZIP, authenticated Blob download, sequential polling, cached-view cleanup and stale manifest guard.
- Explicit backend Currency mode without replacing local Content/Data/Snippet.
- Separate server Checklists load/fill/completion UI; local definitions/progress preserved.

Verified on final code: 7 PASS / 0 FAIL contract fixture scenarios and 260 PASS / 0 FAIL responsive regression; no runtime JS errors/unexpected API requests.
Scoped Prettier, ESLint, build PASS; main chunk >500kB warning remains.
Evidence: `docs/integration/evidence/contracts.json`, `docs/responsive/evidence/integration/results.json`.
Contracts, scope limits and small backend tasks: `docs/integration/BACKEND_ALIGNMENT.md`.

BLOCKED: live API/DB integration; local backend services not running, no safe test account/DB confirmed.
Fixtures are not production readiness. Report/Weekly flags unchanged; Maps/News endpoints absent.
Checklist server CRUD/history and full local migration not implemented; admin/parser expansion not part of batch.
Next: approved local/staging disposable test environment, real auth/read/write/export acceptance.
Commit/push/deploy not performed. Earlier checkpoints below are historical.

**Latest follow-up — interactive showcase:** `/responsive-showcase`, sidebar **Responsive**.
Added `ResponsiveShowcaseView.vue`, lazy route and sidebar entry; all existing guards unchanged.
Five clearly labelled synthetic examples: Analytics, Promo/Tournament, Checklists, Banner Export, Maps.
Uses shared Base controls, real GeneratedArtifact and MapCard; no feature API calls or storage writes.
Container widths 375/768/available are not device emulation. Modals follow real viewport.

Latest full harness: **260 PASS / 0 FAIL**, evidence `docs/responsive/evidence/showcase/results.json`.
Includes 50 showcase viewport checks and local interactions (task create/filter/details, Copy, checklist reset, format selection, Maps notice).
Screenshots: `showcase-desktop.png`, `showcase-maps-320.png` in that directory.
Separate unauthenticated check: PASS, no API requests, unchanged localStorage; global font styles were blocked.
Scoped Prettier, ESLint and build PASS; existing chunk-size warning remains.
Prior batch changes preserved, no commit/push/deploy. The table below records the preceding 209-check batch.
Next: owner visual review of gallery and real Safari/mobile-keyboard acceptance.

| Item | Current status |
| --- | --- |
| Baseline | `main`, `222d89e385456db25ab27f691482137469d4457d`; clean before batch; changes below remain uncommitted |
| Duplicate controllers / stale formatter | Already fixed in baseline; not reapplied |
| Shared responsive shell | Already implemented; navigation boundary 1024px, normal content cap 1920px, Maps view/editor wide mode |
| Drawer/modal keyboard and scroll behavior | PASS in isolated Chromium fixtures: focus, Tab, topmost Escape, shared lock, resize/same-route dismissal, KeepAlive overlay cleanup |
| Analytics responsive use | PASS for tested task list, create/details UI, CSV, error/empty, weekly local preview; aggregate report API data and real writes not verified |
| Reuse in other modules | Shared patterns used in Promo/Tournament, Checklists, Banner Export, Maps; viewport bounds and selected fixture interactions PASS |
| Browser matrix | 209 PASS / 0 FAIL; 15 routes × 10 CSS viewports plus modal/result matrices and interaction scenarios |
| Evidence | `docs/responsive/evidence/2026-10-06/results.json` and four screenshots; revision + code diff hash recorded |
| Quality tools | Scoped installed Prettier, ESLint check-only and `npm run build` PASS; Vite warns main chunk >500kB |
| Dedicated report APIs / SQL execution | Unverified; feature flags not changed, no database/backend work |
| Confluence | Documentation prepared in repository; owner explicitly chose to publish personally; publication NOT RUN, no page ID/URL |

Completed in this batch:
- BaseInput preserves caller descriptions and links hints/errors; BaseSelect/BaseTextarea now expose error associations and invalid state.
- GeneratorLayout badges wrap and children shrink without removing content.
- Browser harness waits for actual transition detachment (same expected assertions), isolates overlay scenarios and records real run time.
- Added ARIA, wide-container/mobile sizing regression checks and expanded synthetic form fixture.
- Added `docs/responsive/GUIDELINES.md` and `PATTERNS.md`; root context pointer corrected in AGENTS.
- Updated root matrix with explicit fixture scope and remaining gaps.

Historical evidence `docs/responsive/evidence/results.json` (119 PASS / 81 FAIL, previous dirty tree) remains unchanged and is not the current result.
Fresh baseline initially produced 206 PASS / 2 FAIL: isolated reproduction confirmed transition timing in the test and cascading fixture state, not a broken modal ownership implementation.
An added resize check exposed a transient JS/CSS navigation mismatch; the test now waits for mode synchronization, and generator badge containment was hardened. Final run passes all 209 checks.

Locally verified environment: installed Chrome 150.0.7871.115, Chromium headless, macOS Darwin 25.6.0 arm64, DPR 1 and emulated DPR 2, scale 1. Playwright 1.56.1 installed in a temporary tools directory with approval; project dependencies/lockfile unchanged. No real API requests/writes were used; fixtures intercepted traffic.

Pending / unverified:
- Real Safari/iPhone, virtual keyboard, native 200% browser zoom, actual Retina hardware.
- Full aggregate report rendering with a confirmed contract, real API integration, permissions and persistence.
- Domain risks: persisted 0/0 weekly metrics, falsy pivot codes, missing edit identity, numeric/date semantics; intentionally not modified as responsive side effects.
- Feature-owned polling/read cleanup in other cached views needs a separate lifecycle batch; shared overlays are covered.
- Publication in Confluence remains the owner's action.

Next coherent batch: real Safari/iPhone + native zoom acceptance using safe test data, then record evidence and Confluence page URL. Handle any confirmed domain defects separately from layout.

Commit / push / deploy: not performed.

---

## 40. Responsive implementation guardrails

These are acceptance requirements for new work, not claims about existing implementation.

### Layout and overflow

App should own page gutters and the usable content area. Remove a view's duplicate padding only after checking that it is actually redundant. Keep special routes below the fixed header unless an intentional full-bleed design is documented.

Use `min-w-0` where flex/grid children must shrink; constrain the parent around wide tables, code blocks and long URLs. Do not conceal broken layouts with blanket page-level `overflow-x: hidden`. Any intentional clipping must be local and documented.

Inspect theme-defined breakpoints rather than assuming defaults. Keep CSS and JavaScript media-query decisions aligned, including around the navigation boundary; test immediately below, at and above it.

Do not apply the 1920px content proposal blindly to Maps. Separate readable form/article widths, normal application widths and canvas/table-wide use where justified. No dedicated 4K breakpoint is required solely because 3840 appears in the test matrix.

### Drawer and modal interactions

Treat an overlay drawer that blocks page interaction as a modal interaction:

- It has an accessible name and a labelled opener; reflect expanded state where appropriate.
- Opening places focus sensibly; Tab/Shift+Tab stay in the active modal surface.
- Closing returns focus to the opener or another logical visible control if navigation replaced it.
- Escape closes only the topmost dismissible surface, not every mounted modal.
- Closed off-canvas navigation is not keyboard-focusable or exposed as interactive background content.
- Background interaction is blocked while a modal is active, not just visually dimmed.
- Navigation, same-route selection and viewport resize leave no stale backdrop/focus trap.

Use an ownership-aware/shared scroll lock when several modal components and the mobile drawer exist. Closing or unmounting one component must not unlock the body while another remains open; restore prior styles and scroll state after the last owner releases its lock. Inspect existing BaseModal behavior before replacing it.

Account for narrow landscape viewports, on-screen keyboards, safe-area padding and dynamic viewport height. A reachable close action and usable primary action matter more than a fullscreen appearance.

### Controls and state

Keep focus indicators, readable labels and touch-usable controls. Preserve native table semantics; prefer a button/link within a cell to changing a whole table row into an unrelated role when modifying interactions.

Use the existing Base components and forward attributes such as numeric `step`, limits and accessible descriptions to the actual form control where needed. Do not modify domain validation or numeric formulas merely to change layout.

Honor reduced-motion preferences for nonessential transitions. Keep hover enhancements optional.

Preserve form state, generated CMS text, copying/exporting, route guards and desktop collapse/dropdown behavior. Where `KeepAlive` is present, inspect activation/deactivation as well as mount/unmount; cleanup tied only to unmount may not cover a cached page becoming inactive.

---

## 41. Validation and evidence

The executable acceptance checklist and blank evidence table are in `docs/RESPONSIVE_TEST_MATRIX.md`.

A source-code review, a passing ESLint run, a passing build, a browser UI check with fixtures, a real API integration check and a production verification are different evidence levels. Report them separately.

At minimum review both a narrow screen and a desktop after shared layout changes. Before closing the responsive phase, execute the full planned matrix or explicitly record each remaining gap. A Playwright/WebKit or mobile-viewport emulation run must not be described as a real iPhone or Safari-device test.

Do not turn report feature flags on to simulate available data. Visual fixtures may be used only in an isolated development/test path that is clearly labelled and does not send production writes. Existing API errors must remain visible, not be replaced with demo records.

When testing authenticated behavior is blocked, record the block. A dev-only route bypass is a visual aid, not authentication or permission validation. Never create a fake production token or remove the production guard to make screenshots work.

Confluence documentation should reference the actual shared implementation and test evidence. A Markdown draft in the repository is not proof of publication; record the real page identifier only once publication is confirmed.

---

## 42. Integration risks to verify, not new responsive scope

These are inspection items derived from the earlier code discussion. They are not a fresh fault report and are not permission to redesign the backend during layout work.

1. **Response envelopes:** verify whether each endpoint returns an array, `{ items, total }`, `{ data, total }`, or another documented envelope. Inspect the actual Axios response/interceptor boundary before changing adapters. Never silently turn malformed responses into an empty successful list.
2. **Numeric data:** confirm JSON number vs decimal-string handling. A missing/null metric is not automatically zero. Validate finite nonnegative SP and integer task counts before submit; do not let `parseInt`/`parseFloat` silently reinterpret invalid input. Plan=0 must have an explicitly defined Performance result.
3. **Historical records:** inspect the actual SQL and Prisma mapping before assuming nullability, identity fields, source keys, constraints or record counts. Preserve unknown legacy brand codes and persisted zero metrics; do not rerun imports or reconstruct history from guesses.
4. **Draft vs saved identity:** keep a local preview distinct from a saved report. Updating a saved report with a missing ID must not silently fall back to creating a new report. Define the handling of a local unsaved edit separately.
5. **Async initialization:** a shared reference-data request may already be in flight when a modal opens. Waiting for a dispatch must actually wait for usable data; initialization/reinitialization must not overwrite user edits. Check close/reopen and cached component lifecycles.
6. **Submit lifecycle:** prevent duplicate submits and changing/closing a save session in a way that makes the result ambiguous. Aborting a client write does not roll back the server. Treat unknown save outcomes differently from confirmed failures.
7. **Period/drill-down semantics:** the draft uses different dates for task totals, completions and credited SP. Do not assume a `reportDate` filter reproduces a progress-date or close-date selection. Do not expand a timestamp range by silently truncating it to date-only. Resolve the contract before claiming exact drill-down parity.
8. **Data-source separation:** Weekly Report performance includes the additional activity fields described in section 19; TaskBrandProgress aggregates are a different source. Do not add the two datasets together or mix their denominator rules without an owner decision.
9. **Empty vs error:** show request/contract failures as errors, not as zero work or 'no data'. Use one mutually exclusive status path per report section.

Backend questions should be appended to the already assigned relevant Jira tasks when possible, rather than producing duplicate tickets. Suggested format: title, context, required behavior, acceptance checks; put the detailed contract in a separate document.

### Deferred issues from the conversation

A Tournament generation HTTP 429 and short-lived login sessions were discussed earlier. Their current status and production cause are not verified in this revision. Do not treat a previously suggested Cloudflare/Render/private-network explanation as a confirmed diagnosis. Do not change infrastructure or token expiry during responsive work.

---

## 43. Documentation sources and maintenance

Project details above are from the original `AGENTS.md`, original `CODEX_HANDOFF.md` and the preceding Mihaoo conversation. No new repository fetch was performed for revision 2.

The following external documentation supports the new agent/testing guidance (checked 2026-10-06); it does not validate Mihaoo's implementation:

- OpenAI, Custom instructions with AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- OpenAI, Best practices: https://learn.chatgpt.com/guides/best-practices
- W3C WAI-ARIA APG, Dialog (Modal) Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- MDN, Window.devicePixelRatio: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio

Keep `AGENTS.md` focused on durable instructions and explicit pointers. This document is context, not an automatic instruction override. After meaningful work, update status and evidence; do not leave completed fixes forever labelled as current blockers.
