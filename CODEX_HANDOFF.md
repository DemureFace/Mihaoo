Mihaoo — Codex Handoff
Last updated: 2026-10-06
Read this file together with AGENTS.md before making changes.
This document preserves the decisions, architecture, current implementation state, constraints and next steps needed to continue Mihaoo safely.

1. Project purpose
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

2. Repositories and stack
   Frontend
   Repository: DemureFace/Mihaoo
   Hosting: https://mihaoo.netlify.app
   Stack:

- Vue 3
- Composition API
- <script setup>
- JavaScript only
- Vite
- Tailwind CSS v4
- Vue Router
- Vuex
- Axios
- Heroicons
- Vue Flow for Maps
  Current scripts:
  {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --fix",
  "format": "prettier --write src/"
  }
  Latest frontend main checked for this handoff:
  0ab4459b0ec0196f68f31596aa73bc7625ae8a9b
  Backend
  Repository: DemureFace/BackendMihaoo
  Architecture:
- NestJS
- Prisma
- PostgreSQL
- JWT
- microservice-oriented structure
- API gateway
- deployed separately on Render
  Latest backend main checked for this handoff:
  11df4be3a8b73d197370610826879cb3d4166e35
  Backend changes are handled separately. Do not implement backend code from frontend work.

3. Critical working rules
   Backend
   If frontend work requires backend changes:

- create a small Jira-style task;
- include context, scope and acceptance criteria;
- do not implement backend code;
- keep backend tasks small, not giant umbrella tickets.
  Frontend
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
  Git
  Do not commit/push after every small change.
  Work in logical batches. Commit/push only when explicitly requested.

4. Environment flags
   Current .env.example:
   VITE_API_URL=http://localhost:3000
   VITE_WEEKLY_REPORTS_API_READY=false
   VITE_ANALYTICS_REPORT_API_READY=false
   Keep both API-ready flags false until backend implementation is actually ready and verified.
5. Router and authentication
   Analytics routes:
   /analytics/tasks
   /analytics/report
   The Analytics parent route is protected with:
   meta: {
   section: 'analytics',
   requiresAuth: true,
   }
   The router guard checks:
   localStorage.getItem('accessToken')
   Without a token, protected routes redirect to /dashboard with login query params.
   A local-only dev bypass for Analytics may be used for visual work, but must be guarded by import.meta.env.DEV and must not become production auth behavior.
6. Base components
   Known Base components:

- BaseButton.vue
- BaseCheckbox.vue
- BaseInput.vue
- BaseLoader.vue
- BaseModal.vue
- BaseSelect.vue
- BaseTextarea.vue
  There is no verified BaseTable.vue in the current repository.
  BaseButton
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
  BaseModal
  Current behavior:
- Teleport to body
- Escape closes
- overlay click closes
- body scroll lock
- sizes sm/md/lg/xl
- desktop-centered layout
  Responsive target:
- mobile bottom/fullscreen-like modal
- 100dvh max height
- smaller padding on mobile
- preserve desktop centered behavior

7. Current global layout
   Main files:

- src/App.vue
- src/components/TheHeader.vue
- src/components/SideBar.vue
  Current desktop layout:
- fixed 56px header
- fixed sidebar below header
- expanded sidebar w-56
- collapsed sidebar w-16
- main content uses ml-56 or ml-16
  This is not yet a reusable mobile/tablet shell.
  Target behavior:
  Mobile < 768px
- fixed header;
- sidebar becomes off-canvas drawer;
- no permanent sidebar width reservation;
- main uses ml-0;
- overlay behind drawer;
- drawer closes after navigation.
  Desktop >= 768px
- keep fixed sidebar;
- expanded ~224px;
- collapsed ~64px.
  2K / 4K
- do not stretch content across 3840px;
- use centered content with a max width;
- current planned max width: around 1920px.

8. Responsive OKR
   The active OKR is frontend/project adaptability across screen sizes.
   KR1 — implemented and tested model
   Reference matrix:
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
  KR2 — Confluence documentation
  Planned document:
  Mihaoo Frontend Responsive & Adaptive Guidelines
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
    KR3 — reusable implementation
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
3. Responsive implementation order
4. Global App layout
5. Header
6. Sidebar
7. BaseModal
8. Analytics shell + filters
9. Analytics Task List
10. Analytics Report
11. Weekly Report UI
12. Tournament / Promo
13. Checklists
14. Banner Export
15. Maps
16. Other pages
    Do not manually adapt every page first. Build shared patterns, then apply them.
17. Planned first responsive batch
    src/App.vue
    Planned:

- matchMedia('(max-width: 767px)');
- mobile sidebar state separate from desktop collapsed state;
- drawer + overlay;
- 100dvh sidebar height;
- ml-0 on mobile;
- keep ml-16 / ml-56 on desktop;
- centered content;
- max content width around 1920px;
- close mobile drawer on route change.
  src/components/TheHeader.vue
  Planned:
- add mobile prop;
- add sidebarOpen prop;
- Bars3Icon / XMarkIcon on mobile;
- chevrons stay on desktop;
- reduce small-screen padding;
- hide Mihaoo text on very narrow screens, keep logo.
  src/components/SideBar.vue
  Planned:
- overflow-y-auto;
- overscroll-contain;
- hover animation only inside @media (hover: hover).
  src/components/base/BaseModal.vue
  Mobile:
- bottom/fullscreen-like;
- width 100%;
- max-height 100dvh;
- scroll inside;
- smaller padding;
- rounded top corners.
  Desktop:
- centered;
- max-height around 90vh;
- existing size system retained.
  src/views/analytics/AnalyticsView.vue
  Planned:
- remove duplicate horizontal page padding once App owns gutters;
- responsive heading text-2xl sm:text-3xl.
  src/components/analytics/AnalyticsFilters.vue
  Planned:
- not sticky on mobile;
- sticky only on large screens;
- toolbar stacks on mobile;
- presets wrap;
- Reset / Apply share full width on mobile;
- smaller mobile padding.

11. Analytics module overview
    Routes:

- /analytics/tasks
- /analytics/report
  Main files:
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
Task List is connected to the current Tasks backend.
Analytics Report and Weekly Reports are frontend-prepared but their dedicated backend APIs are not considered ready. 12. Analytics Task List
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
  Current table has a large min width (min-w-[1300px]).
  Responsive policy:
- keep contained horizontal scrolling;
- do not compress all columns into mobile width;
- do not allow body/page horizontal scrolling.

13. Analytics Filters
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
  APPLY_FILTERS resets page to 1 and increments filterVersion.
  Task List and Report react to filterVersion.

14. Analytics Report frontend state
    Current blocks:

- KPI
- Task Types
- Executors
- Brands
- Period Dynamics
- Period x Brand
- drill-down to Task List
  Drill-down rows/cells can carry filters.
  Frontend merges drill-down filters with global filters and routes to analytics-tasks.
  Frontend service expects:
  GET /tasks/report
  This remains feature-flagged off until backend implementation is ready.

15. Analytics Report semantics
    Backend draft:
    apps/analytics-service/REPORT_API_DRAFT.md
    Status: draft, not implemented.
    Filters match GET /tasks minus pagination:

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
  Task-level grouping / totalTasks
  Use TaskGroup.reportDate.
  SP per period
  Use TaskBrandProgress.date.
  Do not use TaskBrand.storyPoints estimate as credited SP.
  Done-task count per period
  Use TaskBrand.closedAt.
  KPI concepts
- totalTasks
- doneTasks
- inProgressTasks
- completionRate
- totalSP
- doneSP
  completionRate is a ratio:
  0.75 = 75%
  Average SP
  Formula is still unresolved.
  Do not build new UI dependencies around Average SP until explicitly confirmed.

16. Recommended canonical Analytics Report contract
    Top-level:
    kpi
    taskTypes
    executors
    brands
    periodDynamics
    periodBrandPivot
    KPI
    {
    "totalTasks": 0,
    "doneTasks": 0,
    "inProgressTasks": 0,
    "completionRate": null,
    "totalSP": 0,
    "doneSP": 0
    }
    Task Type row
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
    Executor row
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
    Brand row
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
    Period Dynamics row
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
    Period x Brand
    Recommended:
    brands: string[]
    rows: PeriodBrandRow[]
    Cell:
    {
    "brandCode": "JC",
    "totalSP": 2.4,
    "filters": {
    "from": "2026-09-21",
    "to": "2026-09-27",
    "brand": "JC"
    }
    }
    Do not silently change frontend around a speculative backend shape.
17. Flexible adapter
    Because the backend contract is not frozen, frontend currently tolerates aliases such as:
    periodDynamics || periods
    periodBrandPivot || periodBrand
    row.cells || row.values || row.brands
    Keep this until the backend response contract is finalized.
    Then simplify.
18. Weekly Reports frontend state
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
- GET /weekly-reports
- GET /weekly-reports/:id
- POST /weekly-reports
- PATCH /weekly-reports/:id
  Backend endpoints are not considered ready yet.

19. Weekly Report form semantics
    Main file:
    src/components/analytics/AnalyticsWeeklyReportModal.vue
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
  Brand SP = sum brand SP
  Additional SP = TL Activity + Preview + Vacation
  Done SP = Brand SP + Additional SP
  Performance = Done SP / Planned SP \* 100
  Rules:
- task count must be integer;
- negatives invalid;
- Sprint disabled on edit.

20. Weekly Report historical data
    Historical reports may contain brand codes not in current reference data.
    Example legacy code seen in project context: SR33.
    Rules:

- brandCode must remain string-compatible;
- unknown historical codes must still render;
- editing unrelated fields must not remove historical metrics;
- label can fall back to raw code.

21. Weekly Report persistence background
    Planned/migrated data model includes:
    WeeklyReport
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
  WeeklyReportBrandMetric
  Important:
- brandCode is text/string;
- unique by report + brandCode;
- legacy codes allowed.
  WeeklyReportTeamSummary
  Historical/team-level snapshot.
  Do not assume it can always be recomputed from member rows.
  WeeklyReportTeamBrandMetric
  Team-level per-brand snapshot.
  Important:
  An uploaded migration file is not proof that SQL was executed in production.

22. Current known Analytics issues
    Always inspect the local working tree first because some may already be fixed locally.
    A. Duplicate controllers
    The checked main had duplicate declarations in AnalyticsReportView.vue:
    let weeklyReportsController = null
    let weeklyReportDetailsController = null
    let weeklyReportsController = null
    let weeklyReportDetailsController = null
    Keep one of each.
    Compile blocker.
    B. Duplicate watch
    watch(weeklyReportDetailsOpen, ...) appeared twice.
    Keep one.
    C. Stale KPI formatter
    formatPercent was renamed to formatRate, but KPI code still referenced formatPercent in the checked commit.
    Use formatRate consistently.
    D. Persisted brand metrics
    Existing metrics receive isPersisted: true, but checked prepareReport() still filtered only non-zero values after mapping.
    Intended behavior:
    CREATE:
    0 / 0 -> omit

EDIT:
existing 0 / 0 -> preserve

EDIT legacy existing 0 / 0 -> preserve
Filter using isPersisted before mapping.
E. Pivot hardening
When extracting periodBrandPivot.brands, filter falsy codes to avoid an undefined column. 23. Abort / race-condition strategy
Expected:

- stale report request must not overwrite new filters;
- stale Weekly Report history request must not overwrite fresh data;
- open A then B -> A must not replace B;
- closing details modal aborts details request;
- opening/closing Weekly form must not allow stale Sprint request to mutate a newer session.
  Do not blindly abort write requests.
  For POST/PATCH, client abort does not guarantee backend write cancellation.

24. Analytics store
    File:
    src/store/modules/analytics.js
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

25. Analytics service
    File:
    src/services/analytics.service.js
    Known methods:
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
    Current live task endpoints include:

- GET /tasks
- GET /tasks/export
  Prepared future endpoints include:
- GET /tasks/report
- /weekly-reports

26. Task / SP semantics
    Do not confuse:
    Estimate
    TaskBrand.storyPoints
    Actual credited work
    TaskBrandProgress.storyPoints
    Example:
    Task estimate: 1.0
    Week 1 credited: 0.4
    Week 2 credited: 0.6

Week 1 report contribution = 0.4
Week 2 report contribution = 0.6
Do not assign the full estimate to one period. 27. Other modules
Tournaments / Promo
Parser/generator work exists.
General intent:

- parse task descriptions;
- extract dates, names, banners, categories, bonus code, prize pool, rules and GEO data;
- support history/export/copy;
- connect frontend to backend where implemented;
- remove duplicated frontend-only logic when backend owns it.
  Do not mix new parser functionality into the responsive phase unless needed for UI adaptation.
  Banner Export
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
  Checklists
  Current frontend concepts:
- list/search/sort;
- detail;
- create/edit/delete;
- progress;
- mark all/reset;
- localStorage seed versioning.
  Shared/personal/DB behavior is evolving.
  Maps
  Vue Flow-based interactive maps.
  Long-term sharing model should resemble Google Docs:
- view
- comment
- edit
  Users should only see accessible/shared maps.
  News
  CRUD/role-oriented module planned.

28. Base-component migration principle
    When refactoring:

- do not create one-off buttons if BaseButton works;
- use BaseInput, BaseSelect, BaseTextarea, BaseModal;
- improve Base components when multiple pages need the same responsive behavior;
- avoid duplicating large identical Tailwind class sets.
  If a pattern is genuinely shared, move it into a reusable component or layout.

29. Responsive table policy
    Preferred pattern:
    page
    └── card
    └── overflow-x-auto
    └── table with sensible min-width
    Rules:

- no body-level horizontal scrolling;
- table scroll stays inside its section;
- readable cell widths;
- actions stay accessible;
- sticky first column only when it clearly helps.
  Applies especially to Analytics tables and Weekly Report history.

30. Responsive modal policy
    Mobile

- bottom/fullscreen-like;
- width 100%;
- max-height 100dvh;
- internal scrolling;
- safe padding;
- reachable actions.
  Desktop
- centered;
- max-height around 90vh;
- use existing size system.
  Do not create separate mobile modal components unless necessary.

31. Sidebar policy
    Mobile

- closed by default;
- drawer from left;
- overlay;
- closes after navigation;
- vertical scroll;
- no permanent width reservation.
  Desktop
- expanded/collapsed;
- no overlay;
- current dropdown behavior preserved.
  Do not rely on hover for touch.

32. 4K policy
    4K is part of acceptance.
    Do not scale everything up.
    Preferred:

- retain readable control sizes;
- center content;
- cap core content width;
- allow outer whitespace;
- avoid unnecessarily huge table widths.
  Current intended max width: approximately 1920px.

33. Auth/password context
    Backend password validation was recently changed to Latin-letter based rules.
    Do not reintroduce older Hebrew-only assumptions in frontend validation.
    If frontend/backend validation differs, align explicitly.
34. Deployment caution
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

35. Immediate Codex execution plan
    Before editing:
1. Read AGENTS.md.
1. Read this file.
1. Inspect git status.
1. Inspect current versions of:
   - src/App.vue
   - src/components/TheHeader.vue
   - src/components/SideBar.vue
   - src/components/base/BaseModal.vue
   - src/views/analytics/AnalyticsView.vue
   - src/components/analytics/AnalyticsFilters.vue
   - src/views/analytics/AnalyticsReportView.vue
   - src/components/analytics/AnalyticsWeeklyReportModal.vue
1. Fix compile blockers only if they still exist locally.
1. Implement first responsive batch.
1. Do not commit or push.
1. Run checks after the logical batch.
1. Summarize changed files, behavior, risks and remaining issues.
   Then continue to page-level Analytics responsive work.
1. First Codex prompt
   Read AGENTS.md and docs/CODEX_HANDOFF.md completely before making changes.

Inspect the current working tree and git diff first. Local code may be newer than the handoff, so current local code wins over the document.

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
- mobile sidebar is a drawer with overlay;
- desktop collapsed/expanded sidebar behavior remains;
- mobile modal is fullscreen-like/bottom-aligned and scrollable;
- filters are not sticky on small screens;
- no page-level horizontal overflow;
- use Tailwind and existing Base components;
- no new dependencies;
- preserve current behavior.

After changes:

- run npm run format;
- run npx eslint .;
- run npm run build;
- summarize the diff and any remaining issues;
- do not commit or push.

37. What not to do
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

38. Definition of done for the responsive phase
    The responsive phase is complete when:
1. Global shell works across the target matrix.
1. Shared components support mobile/desktop patterns.
1. Analytics is usable on all target widths.
1. At least one second module uses the same patterns.
1. No uncontrolled body-level horizontal overflow remains.
1. Build and lint checks pass.
1. Responsive test results are documented.
1. Confluence documentation contains reusable rules and examples.
1. Known limitations are explicitly recorded.
   At that point the work can be presented as the reusable Mihaoo responsive/adaptive frontend model required by the OKR.
