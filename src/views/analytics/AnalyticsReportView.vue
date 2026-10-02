<template>
  <section class="space-y-[22px]">
    <!-- Filter summary -->
    <section class="rounded-[14px] border border-black bg-white px-[18px] py-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="m-0 text-lg font-bold">Звіт</h2>

          <p class="mt-1 text-[13px] text-neutral-500">
            Агреговані показники використовують ті самі фільтри, що й Task List.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="item in activeFilterLabels"
            :key="item"
            class="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700"
          >
            {{ item }}
          </span>

          <span
            v-if="!activeFilterLabels.length"
            class="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500"
          >
            Увесь період · усі задачі
          </span>
        </div>
      </div>
    </section>

    <!-- KPI -->
    <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="kpi in kpis"
        :key="kpi.key"
        class="rounded-[14px] border border-black bg-white px-4 py-3"
      >
        <p class="m-0 text-xs font-medium text-neutral-500">
          {{ kpi.label }}
        </p>

        <p class="m-0 mt-1 text-[27px] font-bold leading-tight tracking-[-0.02em]">—</p>

        <p class="mt-1 text-xs text-neutral-400">
          {{ kpi.description }}
        </p>
      </article>
    </div>

    <!-- Task types -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Куди пішла робота</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">
          Розподіл закритих задач і SP за типом задачі
        </p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200">
              <th class="px-4 py-3 text-left text-xs text-neutral-500">Тип задачі</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">Задачі</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">SP</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">Частка SP</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colspan="4" class="px-4 py-12 text-center text-sm text-neutral-500">
                Дані ще не підключені.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Executors -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Виконавці</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">Закриті задачі та SP по членах команди</p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200">
              <th class="px-4 py-3 text-left text-xs text-neutral-500">Виконавець</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">Задачі</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">SP</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">Середній SP</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colspan="4" class="px-4 py-12 text-center text-sm text-neutral-500">
                Дані ще не підключені.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Dynamics -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Динаміка</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">
          Зміна кількості виконаних задач і SP у часі
        </p>
      </header>

      <div class="px-[18px] py-12 text-center">
        <p class="m-0 text-sm font-medium text-black">Графік буде тут</p>

        <p class="mt-1 text-sm text-neutral-500">
          Підключимо після появи агрегованих даних з backend.
        </p>
      </div>
    </section>

    <!-- Period × brand -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Період × бренд</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">Розподіл SP між брендами по періодах</p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200">
              <th class="px-4 py-3 text-left text-xs text-neutral-500">Період</th>

              <th class="px-4 py-3 text-left text-xs text-neutral-500">Бренд</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">Задачі</th>

              <th class="px-4 py-3 text-right text-xs text-neutral-500">SP</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colspan="4" class="px-4 py-12 text-center text-sm text-neutral-500">
                Дані ще не підключені.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'

  const store = useStore()

  const analytics = computed(() => store.state.analytics)

  const kpis = [
    {
      key: 'completed',
      label: 'Закрито задач',
      description: 'Кількість Done за вибраний період',
    },
    {
      key: 'storyPoints',
      label: 'SP за період',
      description: 'Зараховані Story Points',
    },
    {
      key: 'average',
      label: 'Середній SP на задачу',
      description: 'SP / кількість закритих задач',
    },
    {
      key: 'executors',
      label: 'Активні виконавці',
      description: 'Люди із закритими задачами у періоді',
    },
  ]

  const activeFilterLabels = computed(() => {
    const filters = analytics.value.filters

    const result = []

    if (filters.from || filters.to) {
      result.push(`Період: ${filters.from || '…'} — ${filters.to || '…'}`)
    }

    if (filters.executorId) {
      result.push(
        `Виконавець: ${store.getters['analytics/memberName'](Number(filters.executorId))}`,
      )
    }

    if (filters.requestedById) {
      result.push(
        `Від кого: ${store.getters['analytics/memberName'](Number(filters.requestedById))}`,
      )
    }

    if (filters.brand) {
      result.push(`Бренд: ${store.getters['analytics/brandLabel'](filters.brand)}`)
    }

    if (filters.platform) {
      result.push(`Платформа: ${store.getters['analytics/platformLabel'](filters.platform)}`)
    }

    if (filters.taskType) {
      result.push(`Тип: ${store.getters['analytics/taskTypeLabel'](filters.taskType)}`)
    }

    if (filters.status) {
      result.push(filters.status === 'DONE' ? 'Статус: Done' : 'Статус: In Progress')
    }

    if (filters.search) {
      result.push(`Пошук: ${filters.search}`)
    }

    return result
  })
</script>
