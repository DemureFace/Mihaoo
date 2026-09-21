<template>
  <section
    class="min-w-0 overflow-hidden rounded-[14px] border border-black bg-white"
    :aria-busy="analytics.loading"
  >
    <!-- Header -->
    <header class="flex flex-wrap items-center gap-4 border-b border-neutral-200 px-[18px] py-4">
      <div>
        <h2 class="m-0 text-lg font-bold text-black">Таск Ліст</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">
          Одна задача на один бренд · Видимість — уся команда
        </p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <BaseButton :loading="analytics.loading" @click="reload()">Оновити</BaseButton>

        <BaseButton disabled>Експорт CSV</BaseButton>

        <BaseButton variant="primary" disabled>+ Нова задача</BaseButton>
      </div>
    </header>

    <!-- Filters -->

    <!-- Info -->
    <div
      class="border-b border-neutral-200 bg-neutral-50 px-[18px] py-3 text-[13px] text-neutral-500"
    >
      Поки підключено тільки перегляд даних. Створення, редагування та CSV додамо наступним кроком.
      Дата в таблиці — поточний
      <span class="font-semibold text-neutral-700">reportDate</span>
      з API.
    </div>

    <!-- Loading -->
    <div
      v-if="analytics.loading"
      class="flex min-h-[260px] items-center justify-center px-6 py-12 text-sm text-neutral-500"
      role="status"
    >
      <div class="flex items-center gap-3">
        <span
          class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
        />

        Завантажуємо задачі…
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="analytics.error"
      class="flex min-h-[220px] flex-col items-center justify-center gap-4 px-6 py-12 text-center"
      role="alert"
    >
      <div>
        <p class="m-0 text-sm font-semibold text-red-700">Не вдалося завантажити задачі</p>

        <p class="mt-1 max-w-[520px] text-sm text-neutral-500">
          {{ analytics.error }}
        </p>
      </div>

      <BaseButton @click="reload()">Повторити</BaseButton>
    </div>

    <template v-else>
      <!-- Warning -->
      <div
        v-if="analytics.warning"
        class="border-b border-neutral-200 bg-amber-50 px-[18px] py-3 text-[13px] text-amber-800"
        role="status"
      >
        {{ analytics.warning }}
      </div>

      <!-- Empty -->
      <div
        v-if="!analytics.rows.length"
        class="flex min-h-[260px] items-center justify-center px-6 py-12 text-center text-sm text-neutral-500"
        role="status"
      >
        <div>
          <p class="m-0 font-semibold text-black">Задач не знайдено</p>

          <p class="mt-1">Зміни фільтри або перевір наявність задач у базі.</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto" tabindex="0" aria-label="Таблиця задач">
        <table class="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr>
              <th
                v-for="[key, label] in columns"
                :key="key"
                scope="col"
                class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
                :class="{
                  'text-right': key === 'id' || key === 'sp',
                }"
              >
                {{ label }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in analytics.rows"
              :key="row.id"
              class="border-b border-neutral-100 transition hover:bg-neutral-100"
            >
              <td
                v-for="[key] in columns"
                :key="key"
                class="whitespace-nowrap px-3.5 py-2.5 text-black"
                :class="getCellClass(key)"
              >
                <!-- Status -->
                <span
                  v-if="key === 'status'"
                  class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  :class="
                    row.status === 'DONE'
                      ? 'border-green-700 bg-green-50 text-green-800'
                      : 'border-blue-700 bg-blue-50 text-blue-800'
                  "
                >
                  {{ cellText(row, key) }}
                </span>

                <!-- Brand -->
                <span
                  v-else-if="key === 'brand'"
                  class="inline-flex rounded-full border border-black bg-white px-2.5 py-0.5 text-xs font-semibold text-black"
                >
                  {{ row.brand }}
                </span>

                <!-- Jira -->
                <span
                  v-else-if="key === 'jira' && row.jira !== '—'"
                  class="font-medium underline underline-offset-2"
                >
                  {{ row.jira }}
                </span>

                <!-- Normal cell -->
                <template v-else>
                  {{ cellText(row, key) }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <footer
        class="flex flex-wrap items-center gap-3 border-t border-neutral-200 px-[18px] py-3 text-[13px] text-neutral-500"
      >
        <span>
          На сторінці:
          <span class="font-semibold text-black">
            {{ analytics.rows.length }}
          </span>
          рядків
        </span>

        <template v-if="analytics.total !== null">
          <span>·</span>

          <span>
            Усього:
            <span class="font-semibold text-black">
              {{ analytics.total }}
            </span>
          </span>
        </template>

        <div class="ml-auto flex items-center gap-2">
          <BaseButton
            size="sm"
            :disabled="analytics.loading || analytics.page === 1"
            @click="reload(analytics.page - 1)"
          >
            ‹
          </BaseButton>

          <span class="min-w-[70px] text-center">
            Сторінка
            <span class="font-semibold text-black">
              {{ analytics.page }}
            </span>
          </span>

          <BaseButton
            size="sm"
            :disabled="analytics.loading || !analytics.hasNext"
            @click="reload(analytics.page + 1)"
          >
            ›
          </BaseButton>
        </div>
      </footer>
    </template>
  </section>
</template>

<script setup>
  import {
    computed,
    reactive,
    watch,
    onMounted,
    onBeforeUnmount,
    onActivated,
    onDeactivated,
  } from 'vue'
  import { useStore } from 'vuex'
  import BaseButton from '@/components/base/BaseButton.vue'
  const store = useStore()
  const analytics = computed(() => store.state.analytics)

  const columns = [
    ['id', '№'],
    ['jira', 'Jira'],
    ['title', 'Назва'],
    ['type', 'Тип'],
    ['platform', 'Платформа'],
    ['brand', 'Бренд'],
    ['assignee', 'Виконавець'],
    ['reporter', 'Від кого'],
    ['sp', 'SP'],
    ['status', 'Статус'],
    ['reportDate', 'Дата звіту'],
  ]

  const numberFormat = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 2,
  })

  function cellText(row, key) {
    if (key === 'status') {
      return (
        {
          DONE: 'Done',
          IN_PROGRESS: 'In Progress',
        }[row.status] || row.status
      )
    }

    if (key === 'sp') {
      return Number.isFinite(row.sp) ? numberFormat.format(row.sp) : '—'
    }

    if (key === 'reportDate') {
      // Зберігаємо календарний день API без перерахунку
      // в локальну часову зону.
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(row.reportDate || '')

      return match ? `${match[3]}.${match[2]}.${match[1]}` : '—'
    }

    return row[key] ?? '—'
  }

  function getCellClass(key) {
    return [
      key === 'title' ? 'min-w-[240px] whitespace-normal font-medium' : '',

      key === 'id' || key === 'sp' ? 'text-right tabular-nums' : '',

      key === 'id' ? 'text-neutral-500' : '',
    ]
  }

  let controller
  let active = false

  function reload(page = analytics.value.page) {
    controller?.abort()

    controller = new AbortController()

    return store.dispatch('analytics/load', {
      page,
      signal: controller.signal,
    })
  }
  watch(
    () => analytics.value.filterVersion,

    () => {
      if (active) {
        reload(1)
      }
    },
  )

  function activate() {
    if (active) return

    active = true
    reload()
  }

  function deactivate() {
    if (!active) return

    active = false
    controller?.abort()
    store.commit('analytics/CLEAR_RESULT')
  }

  watch(
    () => store.state.auth.accessToken,
    () => {
      if (active) reload()
    },
  )

  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)
</script>
