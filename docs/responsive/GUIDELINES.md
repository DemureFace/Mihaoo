# Mihaoo Frontend Responsive & Adaptive Guidelines

Дата: 2026-10-06. Матеріал для публікації в Confluence власником.
Статус публікації: **NOT RUN — власник публікує самостійно; URL/page ID ще не підтверджено**.

## 1. Мета та межі

Модель забезпечує використання Mihaoo від вузьких телефонних до 4K-wide CSS viewport без окремих mobile-сторінок. Повторно використовуються глобальна оболонка, Base-контролі, container queries, локальні scrollers і спільний lifecycle модальних шарів.

Це frontend-модель, не новий API-контракт. Адаптація не змінює маршрути API, DTO, права доступу, формули SP/performance, seed-дані чи згенерований CMS-контент. Нереалізовані report API залишаються feature-flagged. Fixtures не підтверджують backend integration.

Детальні результати: [матриця перевірок](../../RESPONSIVE_TEST_MATRIX.md).
Шаблони: [PATTERNS.md](PATTERNS.md).

## 2. Стек і налаштування

- Vue 3, Composition API, JavaScript, `<script setup>`.
- Vite, Tailwind CSS v4, Vue Router, Vuex, Axios, Heroicons.
- Vue Flow для canvas Maps.
- CSS імпортується через `src/main.js` → `assets/global.css` → `assets/tailwind.css`.
- Активні CSS theme-токени оголошено в `@theme` файлу `assets/tailwind.css`. Наявність `tailwind.config.js` сама по собі не означає, що v4 завантажує його: у CSS немає `@config`.
- Нових runtime-залежностей для адаптації не потрібно.

### Breakpoints

Використовуються стандартні Tailwind viewport breakpoints:

| Variant | Мінімальна ширина |
| ------- | ----------------- |
| `sm`    | 640px             |
| `md`    | 768px             |
| `lg`    | 1024px            |
| `xl`    | 1280px            |
| `2xl`   | 1536px            |

Навігаційна межа **1024px**: JS `matchMedia('(max-width: 1023px)')` і CSS `lg` узгоджені. Пропозиція 768px зі старого handoff не є поточною реалізацією. Drawer на планшеті зберігає корисну ширину для форм і операційних таблиць.

Container query variants (`@lg`, `@4xl`, `@6xl`, `@7xl`) реагують на **ширину контейнера**, не viewport. Не плутати `@lg` і `lg`. Власний breakpoint для 4K не потрібен.

## 3. Глобальна оболонка

Власник layout — `src/App.vue`:

- header фіксований, висота 56px;
- sidebar починається під header і має висоту `calc(100dvh - 3.5rem)`;
- нижче 1024px sidebar — закритий за замовчуванням drawer шириною 224px;
- на desktop — sidebar 224px або collapsed 64px;
- mobile main не резервує ширину sidebar;
- App задає page gutters: 12px, 16px, 24px, 32px відповідно до breakpoint;
- `min-w-0` дозволяє дочірнім flex/grid-контейнерам звужуватись;
- стандартний content container центрується і має `max-width: 1920px`;
- `map-view` і `map-edit` використовують широку область без цього cap;
- route content кешується через `KeepAlive`.

Новій сторінці не слід дублювати фіксований header, відступ sidebar або глобальні page gutters. Внутрішній padding картки/форми залишається відповідальністю компонента.

## 4. Навігація

`TheHeader.vue` містить доступно названий opener із `aria-controls` та `aria-expanded`.
`SideBar.vue` підтримує вертикальне прокручування, collapse, dropdown і явні дії замість hover-only navigation.

Drawer:

- має `role="dialog"`, доступну назву й `aria-modal`;
- закритий sidebar є `inert` та `aria-hidden`;
- відкриття встановлює focus на surface;
- Tab/Shift+Tab утримуються в активному шарі;
- opener додатково дозволений у drawer focus cycle;
- backdrop, Escape, вибір поточного маршруту й навігація закривають drawer;
- перехід на desktop прибирає drawer та scroll lock.

Hover-анімації необов’язкові. Глобальні стилі враховують `prefers-reduced-motion`.

## 5. Модальні шари

`BaseModal.vue` використовує Teleport у body і `useModalLayer.js`.

`useModalLayer` має один стек власників для drawer і dialogs:

1. Після появи DOM реєструє surface.
2. Блокує background через `inert`.
3. Зберігає попередні inline overflow-стилі html/body.
4. Escape закриває лише верхній шар.
5. Tab і focusin не дозволяють випадково взаємодіяти з background.
6. Закриття верхнього шару відновлює focus на opener, якщо він видимий і не inert.
7. Scroll lock знімається тільки після видалення останнього власника.
8. `onDeactivated`/unmount очищують ownership; кешована модалка не залишається активною.

Не додавайте власний `document.body.style.overflow = ''` у сторінку: це може розблокувати background іншої модалки.

### Вигляд

- Mobile: нижнє вирівнювання, повна доступна ширина з size cap, max-height від `100dvh`, внутрішній scroll, safe-area padding.
- Від `sm`: центрування і desktop padding.
- Розміри: `sm`, `md`, `lg`, `xl`.
- Sticky close action залишається доступною під час прокручування.

Передавайте змістовний `aria-label`; default `Dialog` недостатній для нового feature.
Не робіть окремий mobile modal без обґрунтованої необхідності.

## 6. Контракти повторно використовуваних компонентів

| Компонент           | Використання                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `BaseActionBar`     | flex-wrap для дій; min-width containment; можна додавати alignment через class                                |
| `BaseFormGrid`      | `columns=2` або `3`; одна колонка за замовчуванням; named container `/form`; адаптується до ширини контейнера |
| `BaseTableScroll`   | локальний горизонтальний scroll; обов’язковий `label`; keyboard-focusable region; native table всередині      |
| `BaseInput`         | унікальний `id`, label, error/hint, v-model; native attrs передаються input                                   |
| `BaseSelect`        | options `{value,label}`, зберігає тип `_value`; error пов’язаний із select                                    |
| `BaseTextarea`      | label, error/hint, rows, readonly, resize; native attrs передаються textarea                                  |
| `BaseButton`        | variants, loading/disabled, router links/href; wrapping; min-height 44px                                      |
| `BaseModal`         | v-model, size, aria-label; спільний ownership lifecycle                                                       |
| `GeneratorLayout`   | спільний form/result layout Tournament і Promo                                                                |
| `GeneratedArtifact` | відображення CMS text і copy у локально обмеженій області                                                     |

Для полів:

- `class`/`style` застосовуються до wrapper;
- `step`, `inputmode`, `maxlength`, accessibility attrs та native events передаються actual control;
- мобільний font-size 16px, щоб не залежати від zoom для введення;
- `aria-invalid` відображає наявність error;
- error/hint IDs додаються до переданого `aria-describedby`, а не замінюють контекст сторінки;
- унікальність `id` — відповідальність caller.

Дані не нормалізуються під вигляд. Наприклад, BaseInput не округлює SP і не змінює доменну валідацію.

## 7. Overflow і таблиці

Не використовуйте blanket `html/body { overflow-x: hidden }`.
Виправляйте причину: `min-w-0`, `w-full`, `max-w-full`, `minmax(0,1fr)`, перенесення довгих рядків, правильний локальний scroll.

Щільна таблиця має зберігати читабельну min-width. На телефоні користувач прокручує **таблицю**, а не документ. Не прибирайте колонки чи дії для підгонки screenshot.

`BaseTableScroll` не замінює table semantics. Використовуйте `<table>`, `<th>`, `<td>`; інтерактивна дія — native button/link у клітинці.

Maps canvas має локальне clipping/pan, а не приховування page-level overflow. Wide mode не звільняє від containment.

## 8. Фільтри, spacing і sticky UI

`AnalyticsFilters.vue` — container-responsive приклад:

- presets переносяться;
- Reset/Apply мають доступну ширину на малих контейнерах;
- grid змінює кількість колонок за container queries;
- фільтри не sticky, тому не займають більшість mobile viewport.

Внутрішні padding: переважно 12–16px на mobile, 16–24px для більших контейнерів.
Заголовки: mobile `text-2xl`, більший екран `sm:text-3xl`.
URL і довгі labels мають переноситись або мати доступний локальний scroll. Truncate не повинен приховувати єдиний спосіб отримати важливі дані.

## 9. Lifecycle, запити й стан

Resize не має скидати form values. Не створюйте окремі mobile/desktop екземпляри форми через `v-if`, якщо це втрачає стан.

`KeepAlive` означає, що `onBeforeUnmount` недостатньо для всіх feature-resources:

- читання можна abort під час deactivation;
- listeners/timers потрібно прибирати відповідно до власника;
- відновлення на activation не повинно дублювати запити;
- abort write-запиту не означає rollback backend.

Analytics Task List має activation/deactivation handling. Shared overlay cleanup протестовано окремо. Це не підтверджує кожний asynchronous business-flow інших модулів.

## 10. Етапи підключення нового модуля

1. Зберегти baseline і переглянути локальні diffs.
2. Перевірити поточний route, auth, API boundary і потрібну ширину.
3. Прибрати дублювання глобальних gutters тільки після перевірки.
4. Використати `BaseActionBar` і `BaseFormGrid`.
5. Обгорнути щільні таблиці в `BaseTableScroll`.
6. Використати `BaseModal`, унікальні IDs і доступні labels.
7. Перевірити довгі рядки, error/empty/loading/disabled states.
8. Перевірити KeepAlive і stale responses без production writes.
9. Пройти вузький + desktop regression, потім повну матрицю.
10. Записати фактичні результати, прогалини й ревізію.

Приклади повторного використання вже є в Analytics, Promo/Tournament, Checklists, Banner Export і Maps. Не копіюйте layout-класи App у ці сторінки.

## 11. Локальна перевірка

Основна матриця CSS viewport:
320×568, 375×667, 390×844, 768×1024, 1024×768, 1280×800,
1440×900, 1920×1080, 2560×1440, 3840×2160.

Додатково: navigation 1023/1024/1025, стандартні boundaries,
844×390 landscape, DPR 2 emulation, keyboard/focus, nested dialogs.

```sh
npm run dev -- --host 127.0.0.1
```

В іншому terminal, з доступним Playwright:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
RESPONSIVE_OUTPUT=docs/responsive/evidence/your-run \
node scripts/verify-responsive.mjs
```

Шлях визначається локальним встановленням; не додавайте machine-specific home directory до коду. Якщо Playwright відсутній, погодьте окреме встановлення інструмента без incidental dependency upgrades. Harness використовує встановлений Chrome за замовчуванням; `RESPONSIVE_BROWSER` задає channel.

Safety:

- base URL дозволений лише loopback;
- синтетичні auth/data fixtures існують тільки в browser context;
- fixture API-відповіді перехоплюються, непередбачений зовнішній traffic блокується;
- production writes не виконуються;
- report flags не вмикаються заради screenshots;
- застарілий evidence не перезаписується без потреби.

Перевірки якості:

```sh
npx eslint .
npm run build
```

`npm run lint` виконує `--fix`; це не check-only.
`npm run format` форматує весь `src/`; для scoped batch використовуйте installed Prettier на змінених файлах і перевіряйте diff.

## 12. Обмеження та приймання

Automation bounds — не повна visual certification. Емуляція viewport/DPR не є реальним iPhone/Retina. `visualViewport.scale=1` не доводить тест native browser zoom 200%.

Окремо потрібні:

- реальний Safari/iPhone та екранна клавіатура;
- native 200% browser zoom;
- real-device Retina;
- дозволена test API integration для backend-dependent flows;
- тест aggregate report data після підтвердження draft contract.

Відомі доменні ризики поза responsive batch:

- persisted нульові Weekly metrics;
- pivot falsy codes;
- edit identity без ID, numeric validation та date/drilldown semantics;
- не всі timers/read requests інших KeepAlive views мають deactivation cleanup.
  Ця робота їх не змінює і не оголошує перевіреними.

### Результати OKR

1. Реалізація й тестування: оцінювати лише за scope актуального evidence.
2. Документація: цей файл готовий для перенесення; публікацію виконує власник.
3. Повторне використання: shared components і [шаблони](PATTERNS.md), з прикладами в різних модулях.

Не оголошувати весь OKR закритим без явно прийнятих прогалин та підтвердженої Confluence publication.

## Інтерактивна галерея в застосунку

Маршрут `/responsive-showcase`, пункт **Responsive** у sidebar.
Компонент: `src/views/ResponsiveShowcaseView.vue`, lazy-loaded; синтетичні дані не потребують входу.

- Analytics: локальні фільтри, KPI-лічильники, table scroll, створення demo-задачі та modal details.
- Promo / Tournament: Base-форма і справжній `GeneratedArtifact` із Copy / Expand.
- Checklists: читабельні checkbox-пункти, progress і reset; це приклад патерну, не робочий checklist repository.
- Banner Export: форма campaign/format і локальний scroller; без Figma inspect або export jobs.
- Maps: справжній `MapCard`; дії показують demo-повідомлення, схема процесу явно позначена як не Vue Flow canvas.

Ширина preview: 375px, 768px або доступна ширина. Це container preview, не емуляція viewport/DPR.
Модальні вікна використовують реальний viewport через BaseModal.
На вузькому екрані preview обмежується доступною шириною без document overflow.
Draft і demo-стан зберігаються при зміні ширини; галерея не записує їх у localStorage чи backend.
Глобальна оболонка зберігає звичайний auth lifecycle; посилання на робочі модулі мають їхні штатні guards.

## 13. Перенесення в Confluence

1. Створити сторінку **Mihaoo Frontend Responsive & Adaptive Guidelines**.
2. Перенести розділи цього файлу, tables і code blocks.
3. Додати дочірню сторінку **Reusable Patterns** із `PATTERNS.md`.
4. Прикріпити актуальний JSON і screenshots із evidence, не історичні FAIL як поточний результат.
5. Додати посилання на repository revision і матрицю, записати обмеження.
6. Після публікації внести page URL/ID у handoff; до цього статус publication — NOT RUN.
