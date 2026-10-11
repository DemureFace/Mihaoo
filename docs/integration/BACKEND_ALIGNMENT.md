# Frontend ↔ MihaooBackend alignment

Дата: 2026-10-06.
Frontend baseline: `6b9c4d5`, main, clean перед batch.
Backend: `DemureFace/MihaooBackend`, локальний checkout `6ef33fb`, main, clean.
Це факти локального коду, не підтвердження deployed revision. Remote fetch/deploy не виконувалися.

## Підтверджені контракти

| Модуль                            | Gateway                                                                                              | Frontend status                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Auth                              | POST /auth/login, /register; GET /auth/profile; accessToken + user, без refresh endpoint             | Підключено; Signup policy узгоджено; outage не стирає JWT; stale 401 не стирає нову сесію              |
| Tasks                             | GET /tasks → {data,total}; query arrays як comma-separated або repeated values                       | Виправлено envelope/serialization; pagination збережено                                                |
| Task details                      | GET /tasks/:brandRowId → group із brands/comments                                                    | Чинний frontend contract сумісний                                                                      |
| Tasks write/export                | create, brand/group patch, delete/restore, comments, CSV                                             | Чинні маршрути сумісні; реальні DB writes не тестувалися                                               |
| Reference data/members/sprints    | JWT, arrays/reference object                                                                         | Shared dispatch чекає in-flight promise; malformed Sprint response — error, не empty success           |
| Promo                             | /bonus-templates/generate; BH/SG/MW, text/image/segment                                              | Чинна інтеграція сумісна; responsive fixture перевіряє UI, не parser correctness                       |
| Tournament                        | network/ordinary/snippet/locales endpoints                                                           | Чинні сервісні шляхи сумісні; нових parser features не додано                                          |
| Banner Export                     | усі /banner-exports endpoints захищено JWT                                                           | Переведено fetch на shared api; Blob ZIP із JWT за job ID; error envelope/details, послідовний polling |
| Checklists                        | GET /checklists → array; POST /:id/completions → saved ID; плоскі {id,text} items                    | Додано окремий серверний блок list/fill/submit; локальні групи/seed/progress не змінено                |
| Currency                          | GET /currency/sites → string[]; POST /convert {text,site} → {en:localeMap,translations:languageMaps} | Додано явний Backend mode, local modes збережено; API error не підміняється local output               |
| Maps                              | Gateway endpoint відсутній                                                                           | Локальне збереження лишається; наявний maps.service не є живою інтеграцією                             |
| Analytics Report / Weekly Reports | Controller/gateway відсутні; REPORT_API_DRAFT.md                                                     | Flags не вмикалися, контракт не вигадано                                                               |
| News / Calendar                   | Відповідні gateway endpoints відсутні                                                                | Немає заяви про backend integration                                                                    |

Не всі backend endpoints потребують нового UI. Admin users, team member/sprint administration,
parser internals і tournament CRUD не додавалися як випадкове розширення scope.

## Реалізований frontend batch

- `analytics.service.js`: {data,total}, comma-separated filters, strict Sprint list.
- `api.js`, `apiError.js`: envelope/Blob error message, HTTP metadata, token-aware expiry, filename/Blob download helpers.
- `SignupValidations.js`: відповідає RegisterDto (8+, Latin letter, special, allowed charset).
- Auth actions: збереження сесії при network/upstream outage, stale profile response guard.
- Analytics store: shared reference/member request promises.
- Banner service/view: JWT для inspect/create/poll/manifest/ZIP; no token in URL, no trust in arbitrary downloadUrl.
- Currency service/view: opt-in server mode, authenticated call only on Convert, no silent local fallback.
- Checklists service/ServerChecklists/view: explicit API load and completion; local data separate.
- `scripts/verify-integration.mjs`: isolated contract/UI tests.

Checklists server CRUD/history/admin UI і повна міграція local data не реалізовані.
Completion submit не abort-иться як rollback і не retries автоматично.
Currency request може бути cancel на зміну draft/deactivation: це не гарантує скасування downstream translation.

## Перевірки

- Contract fixture run: 7 PASS, 0 FAIL:
  envelope/filter serialization, malformed response, JWT download, backend errors,
  stale/current 401, failed Login, Signup acceptance/rejection, profile outage,
  concurrent reference dispatch, server checklist payload/local preservation,
  Currency success/error, Banner inspect/create/poll/download.
- New populated server blocks bounds: 320/768/1440/3840 у contract run.
- Evidence: [contracts.json](evidence/contracts.json).
- Full responsive regression: окремий `docs/responsive/evidence/integration/results.json`;
  актуальний результат записується в handoff після завершення.
- Scoped Prettier, ESLint, build; Vite chunk >500kB warning.
- Backend дерево не змінено, dependencies/lockfile не змінено.

Локальні listeners 3000/3001/3005 відсутні. Реальна API/DB інтеграція **BLOCKED**:
не було запущеного safe test backend/account. Fixtures не доводять deployed auth,
DB persistence, CORS, translation/Figma доступ або readiness.
Production writes, migrations/imports, settings, commit/push/deploy не виконувалися.

## Відтворення contract-тестів

Потрібен локальний Vite server і окремо доступний Playwright + встановлений Chrome.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node scripts/verify-integration.mjs
```

Loopback-only. Зовнішній traffic перехоплюється; синтетичні токени не виходять у реальний API.
Unexpected API requests — FAIL. HMR singleton URL визначається з Vite source для adapter assertions.

## Невеликі backend-задачі

### BE-1: Expose download/diagnostic headers через gateway CORS

Контекст: CSV/ZIP повертають Content-Disposition, але gateway enableCors не задає exposedHeaders.
Браузер cross-origin не може прочитати серверне ім’я файлу; frontend має safe fallback.

Scope: дозволити читання Content-Disposition та, якщо прийнято, X-Correlation-Id/Retry-After.
Не змінювати auth і не додавати токен до URL.
Acceptance: authenticated cross-origin CSV/ZIP завантажується; header читається JS; 401/403 лишаються захищеними; filename без credential leakage.

### BE-2: Проксіювати Currency breakdown

Контекст: service має POST /currency/breakdown і /breakdown/text; gateway має тільки sites/convert.
Scope: два JWT-protected proxy routes, без зміни parser/formulas.
Acceptance: дозволений caller отримує JSON/text як service; validation errors зберігають envelope; без JWT — 401.
Frontend не викликає service напряму.

### BE-3: Завершити контракт і readiness Analytics Report / Weekly

Контекст: frontend підготовлений, backend має draft, але controllers/gateway відсутні.
Scope: спочатку підтвердити envelope/date/SP semantics і permissions у вже призначеній задачі;
implementation окремими невеликими tickets.
Acceptance: frozen examples/types, aggregate source/date semantics, error/empty distinction,
saved report identity і legacy-zero preservation; flags вмикаються тільки після integration evidence.

### BE-4: Підтвердити Maps persistence/sharing API

Контекст: frontend Maps localStorage; gateway /maps відсутній.
Scope: узгодити мінімальний read/write contract і permission model, не автоматично мігрувати local maps.
Acceptance: accessible-only list; view/comment/edit rules; nodes/edges DTO, ownership і version/conflict behavior;
локальні дані зберігаються при opt-in migration.

### BE-5: Визначити права серверних Checklists

Контекст: service/gateway JWT-protected, але list/completions queries не фільтрують ownership,
а create/update/delete не мають ролей у прочитаному controller.
Scope: підтвердити shared/team/personal policy; застосувати її окремо від frontend layout.
Acceptance: users бачать лише дозволені definitions/completions; write permissions enforced server-side;
completion userId тільки з JWT; local groups не губляться при майбутній міграції.

## Наступний batch

Підняти погоджений локальний/staging backend із disposable test DB/account (без production data),
пройти реальні Login, Tasks read/write/export, Banner mock job/ZIP, Currency і Checklists persistence.
Записати CORS та auth evidence. Далі окремо реалізовувати server checklist CRUD/history і потрібні admin flows.
