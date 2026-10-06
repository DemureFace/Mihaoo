# Mihaoo Responsive Test Matrix

Актуалізовано: 2026-10-06. Початковий план revision 2 збережено як основу acceptance.
Актуальний follow-up: **260 PASS / 0 FAIL**; попередній batch: 209 PASS / 0 FAIL.
Chromium headless, isolated fixtures.
Це не production/API integration або сертифікація реальних пристроїв.

Читайте разом з `AGENTS.md`, `CODEX_HANDOFF.md`,
[GUIDELINES](docs/responsive/GUIDELINES.md) і [PATTERNS](docs/responsive/PATTERNS.md).

## Галерея — актуальний follow-up

Маршрут `/responsive-showcase`, пункт **Responsive**.
Повний regression після додавання галереї: **260 PASS / 0 FAIL**.
Попередній 209-check run нижче збережено як окремий історичний batch.

- Evidence: [showcase/results.json](docs/responsive/evidence/showcase/results.json).
- Screenshots: [desktop](docs/responsive/evidence/showcase/showcase-desktop.png), [Maps 320](docs/responsive/evidence/showcase/showcase-maps-320.png).
- П’ять прикладів × 10 viewport: Analytics, Promo/Tournament, Checklists, Banner Export, Maps — 50 PASS.
- Interaction PASS: preview 375px, draft після resize, локальна задача/фільтр/деталі, CMS Copy, checklist/reset, формат банерів, безпечна Maps delete-дія.
- Окрема перевірка без токена: PASS; API-запитів немає, localStorage незмінний. Global font styles `/css2` блокувалися як assets, не API.
- Chrome/OS/DPR/zoom та diff hash — у JSON; fixtures і real-device обмеження ті самі.
- Scoped Prettier, ESLint і build PASS; chunk-size warning залишається.
- Галерея не є backend integration і не замінює робочі модулі.
- Додано view, route/sidebar entry і тести; попередні незакомічені зміни збережено.

## 1. Evidence rules

Статуси: `NOT RUN`, `PASS`, `FAIL`, `BLOCKED`.

- PASS означає реально виконану перевірку в зазначеному scope.
- Fixture PASS не є real API PASS.
- Записувати revision + diff, browser/version, OS, CSS viewport, DPR, zoom, emulation/device.
- Не включати credentials, персональні дані чи приватні task descriptions.
- Screenshot/log path має вказувати на фактичний файл.
- Page bounds не доводять доступність кожної дії або відсутність clipped content.
- Заборонені production writes заради responsive screenshots.

## 2. Попередній batch — 209 перевірок

| Поле           | Фактичний результат                                                                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Час завершення | 2026-10-06T13:39:48.071Z                                                                                                                                                                                                                                                         |
| Baseline       | `main`, `222d89e385456db25ab27f691482137469d4457d`; clean перед batch                                                                                                                                                                                                            |
| Код            | Baseline + uncommitted changes BaseInput/Select/Textarea, GeneratorLayout, harness/fixture; точний diff SHA256 у JSON                                                                                                                                                            |
| Browser        | Chrome 150.0.7871.115, Chromium headless                                                                                                                                                                                                                                         |
| OS             | macOS, Darwin 25.6.0 arm64                                                                                                                                                                                                                                                       |
| DPR            | 1; окремий emulated DPR 2 context                                                                                                                                                                                                                                                |
| Zoom           | visualViewport.scale=1; native 200% browser zoom НЕ перевірено                                                                                                                                                                                                                   |
| Data source    | isolated fixtures; зовнішні запити перехоплено/заблоковано                                                                                                                                                                                                                       |
| Результат      | 209 PASS, 0 FAIL, 0 runtime JS errors, 0 unexpected external requests                                                                                                                                                                                                            |
| Evidence       | [results.json](docs/responsive/evidence/2026-10-06/results.json)                                                                                                                                                                                                                 |
| Screenshots    | [tasks-320](docs/responsive/evidence/2026-10-06/tasks-320.png), [maps-320](docs/responsive/evidence/2026-10-06/maps-320.png), [weekly-preview-390](docs/responsive/evidence/2026-10-06/weekly-preview-390.png), [tasks-dpr2](docs/responsive/evidence/2026-10-06/tasks-dpr2.png) |

Playwright 1.56.1 встановлено з дозволу в окремий тимчасовий tools-каталог.
Project package.json/lockfile не змінено. Тестові HTML/Vue fixtures не є production routes.

Історичний `docs/responsive/evidence/results.json` має 119 PASS / 81 FAIL для попередньої dirty revision; це **не поточний стан**.
Fresh baseline: 206 PASS / 2 FAIL. Два FAIL були відтворені як передчасна DOM-перевірка під час leave-transition та cascading state. Очікувану поведінку тестів не послаблено: тепер очікується фактичне від’єднання DOM і сценарії ізольовані.
Доданий resize check спочатку виявив перехідний overflow; generator badges отримали wrapping/containment, перевірка чекає JS/CSS navigation synchronization. Фінальний результат вище.

## 3. Viewport matrix

Усі розміри — **CSS viewport**, не фізична роздільна здатність монітора.

| Case | CSS viewport               | Scope                                           | Status  |
| ---- | -------------------------- | ----------------------------------------------- | ------- |
| V01  | 320 × 568                  | 15 routes + форми/результати                    | PASS    |
| V02  | 375 × 667                  | 15 routes + форми/результати                    | PASS    |
| V03  | 390 × 844                  | 15 routes + форми/результати                    | PASS    |
| V04  | 768 × 1024                 | 15 routes; drawer mode                          | PASS    |
| V05  | 1024 × 768                 | 15 routes; desktop mode                         | PASS    |
| V06  | 1280 × 800                 | 15 routes + форми/результати                    | PASS    |
| V07  | 1440 × 900                 | 15 routes + форми/результати                    | PASS    |
| V08  | 1920 × 1080                | 15 routes + форми/результати                    | PASS    |
| V09  | 2560 × 1440                | 15 routes + форми/результати                    | PASS    |
| V10  | 3840 × 2160                | 15 routes; normal cap і Maps wide mode          | PASS    |
| V11  | 1023/1024/1025 × 900       | Navigation boundary, collapse, drawer resize    | PASS    |
| V12  | 1440 × 900, DPR 2 emulated | Task layout; не реальний Retina                 | PASS    |
| V13  | Native 200% browser zoom   | Немає real-browser zoom evidence                | NOT RUN |
| V14  | 844 × 390                  | Task list bounds, task create form bounds/close | PASS    |

Navigation boundary актуалізовано з історичної пропозиції 768px до фактичного `lg=1024px`.
Додаткові bounds: 639/640/641, 767/768/769, 1279/1280/1281, 1535/1536/1537 — PASS для Task List.
Реальний Safari, iPhone, Retina та клавіатура не підтверджені цим Chromium run.

## 4. Route coverage

Для кожного маршруту нижче виконано 10 viewport bounds перевірок.
Повна інтеграція business-flow не випливає з bounds PASS.

| Module             | Route                            | Status / scope                                                      |
| ------------------ | -------------------------------- | ------------------------------------------------------------------- |
| Analytics Tasks    | `/analytics/tasks`               | PASS; populated/empty/error, selected interactions                  |
| Analytics Report   | `/analytics/report`              | PASS; API-disabled UI + weekly local preview, не aggregate API data |
| Tournament         | `/tournaments`                   | PASS; initial UI bounds, не реальна генерація                       |
| Promo              | `/promo`                         | PASS; initial/generated fixture, copy, draft retention              |
| Checklists         | `/checklists`                    | PASS; local synthetic list bounds                                   |
| Checklist detail   | `/checklists/responsive-fixture` | PASS; local synthetic detail bounds                                 |
| Banner Export      | `/banner-export`                 | PASS; initial + inspect fixture bounds                              |
| Maps list          | `/maps`                          | PASS; local synthetic list bounds                                   |
| Map view           | `/maps/responsive-fixture`       | PASS; canvas containment                                            |
| Map editor         | `/maps/responsive-fixture/edit`  | PASS; canvas containment, wide mode                                 |
| Dashboard          | `/dashboard`                     | PASS; bounds                                                        |
| Home               | `/home`                          | PASS; fixture auth, bounds                                          |
| News               | `/news`                          | PASS; current UI bounds                                             |
| Calendar           | `/calendar`                      | PASS; current UI bounds                                             |
| Currency converter | `/currency-converter`            | PASS; current UI bounds                                             |

## 5. Acceptance scenarios

### Shared shell

| ID  | Scenario                                                           | Status / evidence scope                                                 |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| S01 | Changed routes at narrow + desktop, uncontrolled document overflow | PASS; route matrix, 1px tolerance                                       |
| S02 | Dense tables / generated code locally contained                    | PASS; task keyboard scroll, generated Promo fixture                     |
| S03 | Navigation boundary resize + desktop collapsed state               | PASS; 1023/1024/1025                                                    |
| S04 | Drawer navigation/same route/Escape, focus recovery                | PASS                                                                    |
| S05 | Drawer Tab/Shift+Tab, background inert                             | PASS                                                                    |
| S06 | QHD/4K normal content cap, Maps wide mode                          | PASS                                                                    |
| S07 | Limited height / reduced motion                                    | PASS for tested landscape + reduced-motion context; native zoom NOT RUN |

### Modals/forms

| ID  | Scenario                                                              | Status / evidence scope                                     |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| M01 | Long form at narrow/landscape, close reachable                        | PASS; task create fixture, internal scroll                  |
| M02 | Named modal keyboard open/close, focus restore                        | PASS; task details and nested fixture                       |
| M03 | Nested dialogs / drawer + dialog, topmost Escape, lock ownership      | PASS; isolated overlay fixture                              |
| M04 | Long text/URL/labels/error containment                                | PASS for fixture content; full visual review still separate |
| M05 | On-screen keyboard                                                    | BLOCKED; real-device/browser session unavailable            |
| M06 | Resize preserves unsaved form input                                   | PASS; task create and Promo source                          |
| M07 | Failed save retains input, prevents duplicate submit, retry available | PASS; synthetic failed task create, no real write           |
| M08 | Native step + input hint and select/textarea error associations       | PASS; expanded overlay fixture                              |

### Analytics/regression

| ID  | Scenario                                             | Status / evidence scope                                                            |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A01 | Filter wrap, apply/reset, invalid date range         | PASS                                                                               |
| A02 | Task table local keyboard scroll                     | PASS; synthetic long row                                                           |
| A03 | Empty/error and API-disabled UI                      | PASS; task modes + report flags off; all loading variants not exhaustively covered |
| A04 | Weekly create/local preview                          | PASS; edit/legacy/persisted-zero domain scenarios NOT RUN                          |
| A05 | Open A then B / close during request                 | NOT RUN as dedicated race assertion                                                |
| A06 | KeepAlive shared overlay deactivation                | PASS; fixture; all feature timers/read lifecycles NOT RUN                          |
| A07 | Copy / export / download regression                  | PASS for Promo copy and task CSV; Banner ZIP/manifest NOT RUN                      |
| A08 | Second structurally different module reuses patterns | PASS; Promo/Tournament forms and Checklists/Maps shared components                 |

### Не перевірено інтеграційно

| Scenario                                 | Status  | Reason                                           |
| ---------------------------------------- | ------- | ------------------------------------------------ |
| Real Tasks API, auth/permissions         | NOT RUN | Only isolated fixtures                           |
| Aggregate Analytics Report data          | BLOCKED | Dedicated API readiness/contract не підтверджено |
| Saved Weekly Report persistence/edit     | BLOCKED | API readiness не підтверджено                    |
| Real Banner export ZIP/Figma permissions | NOT RUN | No production writes                             |
| Real Safari/iPhone                       | BLOCKED | No real-device/browser evidence                  |
| Actual Retina hardware                   | NOT RUN | Only DPR 2 emulation                             |
| Native 200% zoom                         | NOT RUN | Not substituted with viewport resizing           |
| Confluence publication                   | NOT RUN | Owner chose to publish personally                |

## 6. Quality verification log

Batch: reusable responsive model verification, shared accessibility and containment hardening, documentation.

- Baseline: `main` / `222d89e`; clean.
- Formatting: installed Prettier on changed code/tests/script and new documentation; global `npm run format` avoided to prevent unrelated churn.
- ESLint: installed `eslint .`, no `--fix` — PASS, exit 0.
- Build: `npm run build` — PASS, exit 0; Vite chunk >500kB warning recorded.
- Browser: `scripts/verify-responsive.mjs` — 209 PASS / 0 FAIL.
- Historical failures preserved separately; no API flags enabled.
- No new runtime dependencies, lockfile changes, backend edits, commits, pushes or deployment.
- Next batch: real Safari/iPhone keyboard + native zoom, then safe API acceptance and Confluence URL recording.

## 7. Reproduction and maintenance

See [GUIDELINES §11](docs/responsive/GUIDELINES.md) for setup/commands.
Use a new `RESPONSIVE_OUTPUT` directory per accepted run and inspect assertions plus screenshots.
Never “fix” a failure by changing expected product behavior to match a bug.

Document-overflow aid:
compare `document.documentElement.scrollWidth` with `clientWidth` allowing 1px rounding.
Also inspect local scrollers and clipped controls; bounds alone do not replace visual review.

Future evidence record:

```text
Date/tester:
Revision + relevant diff:
Route/scenario:
CSS viewport / DPR / zoom:
Browser/version / OS / real vs emulated:
Data source:
PASS / FAIL / BLOCKED / NOT RUN:
Evidence path / defect:
```

Не оголошувати весь OKR завершеним без явно прийнятих remaining gaps та підтвердженої Confluence публікації.
