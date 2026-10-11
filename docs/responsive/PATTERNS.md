# Mihaoo — reusable responsive patterns

Дата: 2026-10-06. Доповнення до [GUIDELINES.md](GUIDELINES.md).
Приклади для копіювання й адаптації, не нові production features або API-контракти.

## 1. Сторінка з діями й таблицею

App уже задає gutters, header offset і content cap. Сторінка відповідає лише за внутрішню структуру.

```vue
<template>
  <section class="min-w-0 space-y-4">
    <header class="flex min-w-0 flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold sm:text-3xl">Module</h1>
      <BaseActionBar class="sm:ml-auto">
        <BaseButton :loading="loading" @click="reload">Refresh</BaseButton>
        <BaseButton variant="primary" @click="editorOpen = true">Create</BaseButton>
      </BaseActionBar>
    </header>

    <p v-if="loading" role="status">Loading…</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="!rows.length">No data</p>
    <BaseTableScroll v-else label="Module records" class="rounded-xl border border-black">
      <table class="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            <th scope="col" class="p-3 text-left">Title</th>
            <th scope="col" class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td class="max-w-80 break-words p-3">{{ row.title }}</td>
            <td class="p-3">
              <BaseButton size="sm" @click="openDetails(row)">Open</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseTableScroll>
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import BaseActionBar from '@/components/base/BaseActionBar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseTableScroll from '@/components/base/BaseTableScroll.vue'

  const loading = ref(false)
  const error = ref('')
  const rows = ref([])
  const editorOpen = ref(false)

  // Replace with the existing feature's approved service/store boundary.
  function reload() {}
  function openDetails(row) {
    // Keep the native button; implement the existing detail flow here.
    console.info(row.id)
  }
</script>
```

Перед production-використанням реалізувати handlers; прибрати demonstration logging.
Не позначати порожній handler як працюючу функцію. Loading/error/empty — взаємовиключні стани.

Реальний reference: `src/views/analytics/AnalyticsTaskListView.vue`.

## 2. Форма в модалці

Не додавайте власний scroll lock або Escape listener. `BaseModal` керує шарами.

```vue
<template>
  <BaseModal v-model="open" size="lg" aria-label="Edit module record">
    <form class="min-w-0 space-y-4" @submit.prevent="submit">
      <h2 class="text-xl font-bold">Edit record</h2>
      <p id="editor-context" class="break-words text-sm">Required fields are marked.</p>

      <BaseFormGrid>
        <BaseInput
          v-model="draft.title"
          id="module-editor-title"
          label="Title"
          required
          maxlength="200"
          aria-describedby="editor-context"
          :error="errors.title"
        />
        <BaseInput
          v-model="draft.amount"
          id="module-editor-amount"
          label="Amount"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="0"
        />
      </BaseFormGrid>

      <BaseTextarea
        v-model="draft.description"
        id="module-editor-description"
        label="Description"
        :rows="5"
      />

      <p v-if="submitError" role="alert" class="break-words text-red-700">
        {{ submitError }}
      </p>
      <BaseActionBar class="justify-end">
        <BaseButton type="button" :disabled="saving" @click="open = false">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="saving">Save</BaseButton>
      </BaseActionBar>
    </form>
  </BaseModal>
</template>
```

Script контракт:

- `open` — ref або writable computed;
- `draft` — єдиний reactive object, не mobile/desktop копії;
- `errors` — feature validation;
- `saving` — захист повторного submit;
- `submitError` — підтверджений failure;
- `submit` — наявний service/store handler, не вигаданий endpoint.

При зміні viewport draft не перестворюється.
`BaseModal` закривається через Escape/backdrop: якщо feature має незавершений write, потрібна окрема, явно узгоджена політика save lifecycle. Disabled Cancel сам по собі не блокує всі способи закриття.

References:
`AnalyticsTaskCreateModal.vue`, `AnalyticsWeeklyReportModal.vue`.
Використання reference не означає, що всі його доменні ризики вже закриті.

## 3. Container-responsive filters

```vue
<section class="@container min-w-0 rounded-xl border border-black p-3 sm:p-4">
  <BaseActionBar>
    <!-- Existing preset actions -->
  </BaseActionBar>
  <div class="mt-3 grid min-w-0 grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
    <!-- BaseInput / BaseSelect with unique IDs -->
  </div>
</section>
```

Ширину визначає контейнер після sidebar і page gutters.
Не використовуйте viewport `lg:grid-cols-3`, якщо фактичний контейнер може бути значно вужчим.
Не робіть великий filters block sticky на mobile.

Reference: `src/components/analytics/AnalyticsFilters.vue`.

## 4. Generator form/result

Для workflow, подібного до Promo/Tournament:

- використовувати `GeneratorLayout`;
- форму розкласти через `BaseFormGrid`;
- результат передати в slot `result`;
- CMS text передати `GeneratedArtifact`, не змінюючи output заради layout;
- loading/error залишити feature-owned;
- не показувати fixtures у production на місці API failure.

References: `src/views/PromoView.vue`, `src/views/TournamentView.vue`.

## 5. Новий drawer або спеціальний modal surface

Перевага — `BaseModal`. Якщо surface принципово інша, використати спільний composable:

```js
const open = ref(false)
const surface = ref(null)
const { visible, zIndex, isTop } = useModalLayer({
  open,
  surface,
  close: () => {
    open.value = false
  },
})
```

DOM-контракт:

- `v-if="visible"` для surface;
- ref `surface`;
- `role="dialog"`, `aria-modal="true"`, доступна назва, `tabindex="-1"`;
- layer-aware z-index;
- dismissal backdrop лише коли `isTop`;
- explicit close action;
- max-height на `100dvh`, локальний scroll;
- opener має бути доступний для focus restoration.

Не створювати другий ownership stack. Якщо drawer лишається mounted закритим, зробити його inert/aria-hidden, як у App.
Приклад ізолованої перевірки: `tests/responsive/OverlayHarness.vue`.

## 6. Review checklist нового модуля

### Код

- [ ] App залишається власником глобальних gutters.
- [ ] Flex/grid children мають потрібний `min-w-0`.
- [ ] Довгі title/URL/error не створюють document overflow.
- [ ] Щільні таблиці в локальному keyboard-accessible scroller.
- [ ] Функції/колонки/дії не приховані лише для підгонки mobile.
- [ ] Form IDs унікальні; labels і descriptions пов’язані.
- [ ] Modal названий; focus/Tab/Escape/shared lock працюють.
- [ ] Resize зберігає draft.
- [ ] KeepAlive cleanup перевірено для feature-owned resources.
- [ ] API/DTO/auth/formulas/CMS output не змінено.

### Evidence

- [ ] 320×568 і 1440×900 regression.
- [ ] Повна матриця 320–3840px.
- [ ] 1023/1024/1025 навігаційна межа.
- [ ] 844×390, long content, error/empty/loading.
- [ ] Keyboard та nested overlay.
- [ ] Data source позначено fixtures / UI without API / real test API.
- [ ] Browser/version, OS, DPR, zoom і revision записано.
- [ ] Неперевірені real-device/API сценарії не позначено PASS.
- [ ] ESLint, build і scoped formatting виконано.
- [ ] Handoff і матриця оновлені.

## 7. Шаблон журналу batch

```text
Batch:
Baseline branch/commit:
Pre-existing local changes:
Changed files:
Implemented behavior:
Formatting scope and result:
ESLint result:
Build result:
Browser/version, OS, CSS viewport, DPR, zoom:
Data source and network safety:
PASS/FAIL/BLOCKED/NOT RUN:
Evidence paths:
Known limitations:
Next coherent batch:
Commit/push/deploy:
Confluence URL/page ID or publication NOT RUN:
```

Ці шаблони не потребують нового бібліотечного шару. Вони використовують чинні Base-компоненти й показують спосіб підключити доменну логіку без її дублювання.
