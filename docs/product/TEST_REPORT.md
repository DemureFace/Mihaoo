# Mihaoo — frontend product test report

Дата: 2026-10-06.
Baseline: `main`, `9f88182`; clean перед batch.
Власник попросив виправити візуальні/функціональні баги та наповнити Dashboard/News.
Усі зміни batch залишаються локальними; commit/push/deploy не виконані.

## Виправлені дефекти

| Дефект                                                     | Причина / виправлення                                                                                                                          | Доказ                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Sidebar label зникає на hover                              | Unlayered global button hover перекривав Tailwind variants; legacy styles переміщені в base layer, plain/link/ghost мають явні hover utilities | Product contrast ≥4.5:1, включно з alpha-composited background                        |
| Зайві рамки Register / Show                                | Той самий CSS cascade conflict; variants керують прозорими border/background                                                                   | Product style assertions                                                              |
| Password text/autofill перекриває Show/Hide                | Не було reserved right padding; додано padding 80px, control 64px, bounded height, aria-pressed/name                                           | Product fit на 320/390/768/1440                                                       |
| Повторний Login/Registration submit                        | Не було локального submitting guard                                                                                                            | Script-setup forms, inline loading; Login double-submit fixture дає один POST         |
| Непрацююча Forgot Password дія                             | Backend reset endpoint відсутній                                                                                                               | Замість dead button — явна підказка звернутися до адміністратора; reset не імітується |
| Застаріла Signup підказка                                  | Текст вимагав uppercase/lowercase/number, не як backend DTO                                                                                    | Підказка відповідає чинній Latin/special policy                                       |
| Header logo production path                                | Literal /src asset path                                                                                                                        | Vite asset import; production preview naturalWidth >0                                 |
| Checklist «Позначити все» пропускає plain items            | Editor створює items без type, collector приймав тільки check                                                                                  | Collector підтримує plain/check; mark-all/reset PASS                                  |
| Escape із кешованого Checklist detail змінює інший маршрут | Listener прибирався тільки при unmount                                                                                                         | onDeactivated cleanup; News лишається News після Escape                               |
| Пошкоджений user JSON блокує bootstrap                     | JSON.parse без catch                                                                                                                           | Безпечне читання кешу, cached-user test PASS                                          |
| Maps import null/array/числова назва                       | Доступ до schema до object validation, неперевірені metadata types                                                                             | Контрольовані validation errors; roundtrip PASS                                       |

Auth-модалки зберігають native error/field semantics і чинні API/routes.
Network/API guards і доменні SP formulas не змінювалися.

## Наповнені сторінки

### Dashboard

- Hero й quick actions.
- 6 робочих модулів із переходами та штатними auth guards.
- Реальні локальні лічильники Checklists/Maps із явним описом джерела.
- Оновлення продукту та workflow перед запуском кампанії.
- Немає вигаданих командних KPI чи green backend health.

### News

- 4 curated frontend release notes у `src/data/productUpdates.js`.
- Search, categories, result count, empty/reset, native details і module links.
- Записи не є live news API, командними оголошеннями або підтвердженням deployment.
- Backend News CRUD/roles не реалізовано й не підмінено fake endpoint.

## Реальні результати

| Suite                            | Результат         | Scope / evidence                                                                                                                                             |
| -------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/verify-product.mjs`     | 9 PASS / 0 FAIL   | Hover/active contrast, password/link/duplicate submit, Dashboard, News, Checklist, Maps/import/history, corrupt auth cache; [results](evidence/results.json) |
| `scripts/verify-integration.mjs` | 7 PASS / 0 FAIL   | Backend-contract fixtures, auth/errors, server Checklists/Currency/Banner; [results](../integration/evidence/contracts.json)                                 |
| `scripts/verify-responsive.mjs`  | 260 PASS / 0 FAIL | 15 routes × matrix + forms/results/gallery/overlay interactions; [results](../responsive/evidence/product/results.json)                                      |
| Production preview smoke         | 11 routes PASS    | Unauthenticated routes/guards, logo asset, 320/1440 bounds, Login open/Escape; [results](evidence/build-smoke.json)                                          |
| ESLint                           | PASS, exit 0      | Check-only installed tool                                                                                                                                    |
| Build                            | PASS              | Vite main chunk >500kB warning remains                                                                                                                       |
| Formatting                       | Scoped Prettier   | Changed files only; global src formatting avoided                                                                                                            |

Browser: installed Chrome 150.0.7871.115, Chromium headless, macOS.
Main context DPR 1, reduced-motion; responsive suite separately emulates DPR 2.
No native 200% zoom or real device coverage claimed.

Screenshots:

- [Dashboard 1440](evidence/dashboard-1440.png)
- [News 320](evidence/news-320.png)
- [Login built frontend](evidence/login-built.png)

Screenshots are evidence artifacts, not proof of manual screenshot certification.
Automated checks used real browser geometry/styles and interactions.
An initial development run was blocked by a transient Vite/HMR overlay;
fresh stable rerun passed. An initial contrast assertion treated semi-transparent
background as opaque; alpha composition corrected without lowering the 4.5 threshold.

## Safety and reproduction

Product suite uses an isolated browser context with synthetic Maps/Checklist records
and a synthetic failed Login response. Local duplicate/delete/checkbox actions affect
only that context; no owner's browser storage is touched.
Unexpected external API traffic is blocked and fails the suite.
Production preview smoke blocks all external traffic.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/verify-product.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/verify-integration.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
RESPONSIVE_OUTPUT=docs/responsive/evidence/new-run node scripts/verify-responsive.mjs
```

Use local Vite, no production target. Playwright is external tooling, not a new project dependency.

## Неперевірено / залишкові ризики

«Повне тестування продукту» не зводиться до цих автоматичних PASS.
Окремо потрібні:

- Live auth success, account roles, DB CRUD/persistence, real Tasks writes.
- Real Figma access/export and translation backend.
- Aggregate Report/Weekly integration: endpoints/contract readiness не підтверджено.
- Реальний Safari/iPhone/keyboard/Retina й native zoom 200%.
- Checklist section/group editor behavior, full local CRUD matrix і storage quota recovery.
- Всі Maps canvas gestures/edge cases/import node/edge domain validation.
- Calendar лишається placeholder; власник у цьому batch просив Dashboard і News.
- Відомі Analytics domain issues: persisted zero metrics, pivot/date/identity semantics.
- Async auth save closure/navigation during in-flight write потребує окремої політики;
  disabled submit не є server rollback.
- Main bundle warning залишається; dependencies не оновлювалися.

Backend untouched; flags, API contracts, dependency manifests/lockfile unchanged.
No production writes, migrations, deployment settings, commits or pushes.

## Наступний coherent batch

Погоджене staging/disposable test account + DB: реальний Login/roles,
Tasks CRUD/export, Banner mock export/ZIP, Checklists completion persistence.
Окремо реальні Safari/mobile keyboard acceptance та поглиблені Maps/Checklist editor тести.
