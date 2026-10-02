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

        <BaseButton variant="primary" @click="weeklyReportOpen = true">
          <DocumentPlusIcon class="h-4 w-4" />

          Заповнити тижневий звіт
        </BaseButton>

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

    <AnalyticsWeeklyReportHistory
      :reports="weeklyReports"
      :loading="weeklyReportsLoading"
      :error="weeklyReportsError"
      :api-ready="weeklyReportsApiReady"
      @open="handleWeeklyReportOpen"
    />

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
    <section
      v-if="preparedReport"
      class="overflow-hidden rounded-[14px] border border-black bg-white"
    >
      <header
        class="flex flex-col gap-4 border-b border-neutral-200 px-[18px] py-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Weekly Report Preview
          </p>

          <h2 class="m-0 mt-1 text-lg font-bold">
            {{ preparedReportMeta?.sprintName || 'Weekly Report' }}
          </h2>

          <p class="mt-1 text-sm text-neutral-500">
            {{ preparedReportMeta?.sprintPeriod }}
          </p>
        </div>

        <div class="text-left sm:text-right">
          <p class="m-0 text-xs text-neutral-400">Specialist</p>

          <p class="mt-1 text-sm font-semibold">
            {{ preparedReportMeta?.specialist || '—' }}
          </p>
        </div>
      </header>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-px bg-neutral-200 lg:grid-cols-4">
        <article class="bg-white p-4">
          <p class="m-0 text-xs text-neutral-500">Tasks</p>

          <p class="mt-1 text-2xl font-bold">
            {{ preparedReport.tasksAmount }}
          </p>
        </article>

        <article class="bg-white p-4">
          <p class="m-0 text-xs text-neutral-500">Done SP</p>

          <p class="mt-1 text-2xl font-bold">
            {{ formatMetric(preparedReport.doneStoryPoints) }}
          </p>
        </article>

        <article class="bg-white p-4">
          <p class="m-0 text-xs text-neutral-500">Planned SP</p>

          <p class="mt-1 text-2xl font-bold">
            {{ formatMetric(preparedReport.plannedStoryPoints) }}
          </p>
        </article>

        <article class="bg-black p-4 text-white">
          <p class="m-0 text-xs text-white/60">Performance</p>

          <p class="mt-1 text-2xl font-bold">
            {{
              preparedReport.performancePercent !== null
                ? `${formatMetric(preparedReport.performancePercent)}%`
                : '—'
            }}
          </p>
        </article>
      </div>

      <!-- Additional -->
      <div class="grid grid-cols-1 border-t border-neutral-200 sm:grid-cols-3">
        <div class="px-4 py-3">
          <p class="m-0 text-xs text-neutral-500">Team Lead Activity</p>

          <p class="mt-1 font-semibold">
            {{ formatMetric(preparedReport.teamLeadActivitySp) }}
            SP
          </p>
        </div>

        <div class="border-t border-neutral-200 px-4 py-3 sm:border-l sm:border-t-0">
          <p class="m-0 text-xs text-neutral-500">Preview Task</p>

          <p class="mt-1 font-semibold">
            {{ formatMetric(preparedReport.previewTaskSp) }}
            SP
          </p>
        </div>

        <div class="border-t border-neutral-200 px-4 py-3 sm:border-l sm:border-t-0">
          <p class="m-0 text-xs text-neutral-500">Vacation</p>

          <p class="mt-1 font-semibold">
            {{ formatMetric(preparedReport.vacationSp) }}
            SP
          </p>
        </div>
      </div>

      <!-- Brands -->
      <div class="border-t border-neutral-200">
        <div class="px-[18px] py-3">
          <h3 class="m-0 text-sm font-bold">Розподіл по брендах</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr class="border-y border-neutral-200 bg-neutral-50">
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Brand</th>

                <th class="px-4 py-2.5 text-right text-xs font-semibold text-neutral-500">Tasks</th>

                <th class="px-4 py-2.5 text-right text-xs font-semibold text-neutral-500">SP</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="metric in preparedReport.brandMetrics"
                :key="metric.brandCode"
                class="border-b border-neutral-100 last:border-b-0"
              >
                <td class="px-4 py-3 font-medium">
                  {{ brandName(metric.brandCode) }}

                  <span class="ml-1 text-xs text-neutral-400">
                    {{ metric.brandCode }}
                  </span>
                </td>

                <td class="px-4 py-3 text-right">
                  {{ metric.tasksAmount }}
                </td>

                <td class="px-4 py-3 text-right font-semibold">
                  {{ formatMetric(metric.storyPoints) }}
                </td>
              </tr>

              <tr v-if="!preparedReport.brandMetrics?.length">
                <td colspan="3" class="px-4 py-8 text-center text-neutral-500">
                  По брендах немає введених даних.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer
        class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-[18px] py-3"
      >
        <p class="m-0 text-xs text-neutral-500">
          Preview сформований локально. Збереження підключимо через Weekly Report API.
        </p>

        <BaseButton variant="secondary" size="sm" @click="weeklyReportOpen = true">
          Заповнити заново
        </BaseButton>
      </footer>
    </section>

    <AnalyticsWeeklyReportModal v-model="weeklyReportOpen" @prepared="handleWeeklyReportPrepared" />
    
    <AnalyticsWeeklyReportDetailsModal
      v-model="weeklyReportDetailsOpen"
      :report="selectedWeeklyReport"
      :loading="weeklyReportDetailsLoading"
      :error="weeklyReportDetailsError"
      :allow-edit="weeklyReportsApiReady"
    />
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useStore } from 'vuex'
  import { DocumentPlusIcon } from '@heroicons/vue/24/outline'
  import { analyticsService } from '@/services/analytics.service'

  import AnalyticsWeeklyReportModal from '@/components/analytics/AnalyticsWeeklyReportModal.vue'
  import AnalyticsWeeklyReportHistory from '@/components/analytics/AnalyticsWeeklyReportHistory.vue'
  import AnalyticsWeeklyReportDetailsModal from '@/components/analytics/AnalyticsWeeklyReportDetailsModal.vue'
  import BaseButton from '@/components/base/BaseButton.vue'

  const store = useStore()

  const analytics = computed(() => store.state.analytics)

  const weeklyReportOpen = ref(false)

  const preparedReport = ref(null)
  const weeklyReports = ref([])

  const weeklyReportsLoading = ref(false)

  const weeklyReportsError = ref('')

  const weeklyReportsApiReady = ref(false)

  const weeklyReportDetailsOpen = ref(false)

  const selectedWeeklyReport = ref(null)

  const weeklyReportDetailsLoading = ref(false)

  const weeklyReportDetailsError = ref('')

  async function handleWeeklyReportOpen(report) {
    selectedWeeklyReport.value = report

    weeklyReportDetailsError.value = ''

    weeklyReportDetailsOpen.value = true

    if (!weeklyReportsApiReady.value) {
      return
    }

    weeklyReportDetailsLoading.value = true

    try {
      selectedWeeklyReport.value = await analyticsService.getWeeklyReport(report.id)
    } catch (error) {
      const response = error?.response?.data

      weeklyReportDetailsError.value =
        response?.error?.message || response?.message || 'Не вдалося завантажити Weekly Report.'
    } finally {
      weeklyReportDetailsLoading.value = false
    }
  }
  const preparedReportMeta = ref(null)

  function handleWeeklyReportPrepared(payload, meta) {
    preparedReport.value = payload
    preparedReportMeta.value = meta
  }

  function formatMetric(value) {
    return Number(value || 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function brandName(code) {
    return store.getters['analytics/brandLabel'](code)
  }

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
