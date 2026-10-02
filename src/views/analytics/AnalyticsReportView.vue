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

        <BaseButton variant="primary" @click="openNewWeeklyReport">
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

        <p class="m-0 mt-1 text-[27px] font-bold leading-tight tracking-[-0.02em]">
          <span v-if="reportLoading">…</span>

          <span v-else-if="kpi.value !== null && kpi.value !== undefined">
            {{ kpi.raw ? formatMetric(kpi.value) : kpi.value }}
          </span>

          <span v-else>—</span>
        </p>

        <p class="mt-1 text-xs text-neutral-400">
          {{ kpi.description }}
        </p>
      </article>
    </div>

    <div
      v-if="!analyticsReportApiReady"
      class="rounded-[14px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
    >
      KPI будуть заповнені після підключення
      <code class="font-mono text-xs">GET /tasks/report</code>
      .
    </div>

    <div
      v-else-if="reportError"
      class="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ reportError }}

      <BaseButton variant="secondary" size="sm" class="ml-2" @click="loadAnalyticsReport">
        Повторити
      </BaseButton>
    </div>

    <AnalyticsWeeklyReportHistory
      :reports="weeklyReports"
      :loading="weeklyReportsLoading"
      :error="weeklyReportsError"
      :api-ready="weeklyReportsApiReady"
      :retryable="weeklyReportsApiReady"
      @open="handleWeeklyReportOpen"
      @retry="loadWeeklyReports"
    />

    <!-- Task types -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Куди пішла робота</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">
          Розподіл задач і фактично зарахованих SP за типом задачі
        </p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200 bg-neutral-50">
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Тип задачі</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">
                Completion
              </th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">SP</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Частка SP</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="reportLoading">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                Завантажуємо дані...
              </td>
            </tr>

            <tr
              v-for="row in taskTypeRows"
              v-else
              :key="row.taskType"
              class="border-b border-neutral-100 transition last:border-b-0"
              :class="row.filters ? 'cursor-pointer hover:bg-neutral-50' : ''"
              :tabindex="row.filters ? 0 : undefined"
              :role="row.filters ? 'button' : undefined"
              @click="row.filters && handleReportDrilldown(row.filters)"
              @keydown.enter="row.filters && handleReportDrilldown(row.filters)"
              @keydown.space.prevent="row.filters && handleReportDrilldown(row.filters)"
            >
              <td class="px-4 py-3 font-medium">
                {{ taskTypeName(row.taskType) }}

                <span class="ml-1 text-xs text-neutral-400">
                  {{ row.taskType }}
                </span>
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.count ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.doneCount ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ completionRateLabel(row.completionRate) }}
              </td>

              <td class="px-4 py-3 text-right font-semibold">
                {{ formatMetric(row.totalSP) }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ spShareLabel(row.totalSP) }}
              </td>
            </tr>

            <tr v-if="!reportLoading && analyticsReportApiReady && !taskTypeRows.length">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                За вибраними фільтрами немає даних.
              </td>
            </tr>

            <tr v-if="!analyticsReportApiReady">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                Дані зʼявляться після підключення Analytics Report API.
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

        <p class="mt-0.5 text-[13px] text-neutral-500">Розподіл задач та SP по членах команди</p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200 bg-neutral-50">
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Виконавець</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">
                Completion
              </th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">SP</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="reportLoading">
              <td colspan="5" class="px-4 py-10 text-center text-neutral-500">
                Завантажуємо дані...
              </td>
            </tr>

            <tr
              v-for="row in executorRows"
              v-else
              :key="row.executorId"
              class="border-b border-neutral-100 transition last:border-b-0"
              :class="row.filters ? 'cursor-pointer hover:bg-neutral-50' : ''"
              :tabindex="row.filters ? 0 : undefined"
              :role="row.filters ? 'button' : undefined"
              @click="row.filters && handleReportDrilldown(row.filters)"
              @keydown.enter="row.filters && handleReportDrilldown(row.filters)"
              @keydown.space.prevent="row.filters && handleReportDrilldown(row.filters)"
            >
              <td class="px-4 py-3">
                <p class="m-0 font-medium">
                  {{ row.executorName || store.getters['analytics/memberName'](row.executorId) }}
                </p>
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.count ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.doneCount ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ completionRateLabel(row.completionRate) }}
              </td>

              <td class="px-4 py-3 text-right font-semibold">
                {{ formatMetric(row.totalSP) }}
              </td>
            </tr>

            <tr v-if="!reportLoading && analyticsReportApiReady && !executorRows.length">
              <td colspan="5" class="px-4 py-10 text-center text-neutral-500">
                За вибраними фільтрами немає даних.
              </td>
            </tr>

            <tr v-if="!analyticsReportApiReady">
              <td colspan="5" class="px-4 py-10 text-center text-neutral-500">
                Дані зʼявляться після підключення Analytics Report API.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Brands -->
    <section class="overflow-hidden rounded-[14px] border border-black bg-white">
      <header class="border-b border-neutral-200 px-[18px] py-4">
        <h2 class="m-0 text-lg font-bold">Бренди</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">Розподіл задач та SP між брендами</p>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200 bg-neutral-50">
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Brand</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">
                Completion
              </th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">SP</th>

              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Частка SP</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="reportLoading">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                Завантажуємо дані...
              </td>
            </tr>

            <tr
              v-for="row in brandRows"
              v-else
              :key="row.brand"
              class="border-b border-neutral-100 transition last:border-b-0"
              :class="row.filters ? 'cursor-pointer hover:bg-neutral-50' : ''"
              :tabindex="row.filters ? 0 : undefined"
              :role="row.filters ? 'button' : undefined"
              @click="row.filters && handleReportDrilldown(row.filters)"
              @keydown.enter="row.filters && handleReportDrilldown(row.filters)"
              @keydown.space.prevent="row.filters && handleReportDrilldown(row.filters)"
            >
              <td class="px-4 py-3 font-medium">
                {{ reportBrandName(row.brand) }}

                <span class="ml-1 text-xs text-neutral-400">
                  {{ row.brand }}
                </span>
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.count ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ row.doneCount ?? 0 }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ completionRateLabel(row.completionRate) }}
              </td>

              <td class="px-4 py-3 text-right font-semibold">
                {{ formatMetric(row.totalSP) }}
              </td>

              <td class="px-4 py-3 text-right">
                {{ spShareLabel(row.totalSP) }}
              </td>
            </tr>

            <tr v-if="!reportLoading && analyticsReportApiReady && !brandRows.length">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                За вибраними фільтрами немає даних.
              </td>
            </tr>

            <tr v-if="!analyticsReportApiReady">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
                Дані зʼявляться після підключення Analytics Report API.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AnalyticsPeriodDynamics
      :rows="periodRows"
      :loading="reportLoading"
      :api-ready="analyticsReportApiReady"
      @drilldown="handleReportDrilldown"
    />

    <AnalyticsPeriodBrandPivot
      :rows="periodBrandRows"
      :brands="periodBrandCodes"
      :loading="reportLoading"
      :api-ready="analyticsReportApiReady"
      @drilldown="handleReportDrilldown"
    />

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

        <div class="flex gap-2">
          <BaseButton variant="secondary" size="sm" @click="openNewWeeklyReport">
            Новий звіт
          </BaseButton>

          <BaseButton variant="primary" size="sm" @click="editPreparedReport">
            Редагувати
          </BaseButton>
        </div>
      </footer>
    </section>

    <AnalyticsWeeklyReportModal
      v-model="weeklyReportOpen"
      :report="weeklyReportEditSource"
      :saving="weeklyReportSaving"
      :submit-error="weeklyReportSubmitError"
      :api-ready="weeklyReportsApiReady"
      @prepared="handleWeeklyReportPrepared"
    />

    <AnalyticsWeeklyReportDetailsModal
      v-model="weeklyReportDetailsOpen"
      :report="selectedWeeklyReport"
      :loading="weeklyReportDetailsLoading"
      :error="weeklyReportDetailsError"
      :allow-edit="weeklyReportsApiReady"
      @edit="handleWeeklyReportEdit"
    />
  </section>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { DocumentPlusIcon } from '@heroicons/vue/24/outline'
  import { analyticsService } from '@/services/analytics.service'

  import AnalyticsWeeklyReportModal from '@/components/analytics/AnalyticsWeeklyReportModal.vue'
  import AnalyticsWeeklyReportHistory from '@/components/analytics/AnalyticsWeeklyReportHistory.vue'
  import AnalyticsWeeklyReportDetailsModal from '@/components/analytics/AnalyticsWeeklyReportDetailsModal.vue'
  import AnalyticsPeriodDynamics from '@/components/analytics/AnalyticsPeriodDynamics.vue'
  import AnalyticsPeriodBrandPivot from '@/components/analytics/AnalyticsPeriodBrandPivot.vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  const store = useStore()

  const router = useRouter()

  const analytics = computed(() => store.state.analytics)

  const analyticsReportApiReady = ref(import.meta.env.VITE_ANALYTICS_REPORT_API_READY === 'true')

  const reportData = ref(null)

  const reportLoading = ref(false)

  const reportError = ref('')

  const weeklyReportOpen = ref(false)
  const weeklyReportEditSource = ref(null)

  const preparedReport = ref(null)
  const weeklyReports = ref([])

  const weeklyReportsLoading = ref(false)

  const weeklyReportsError = ref('')

  const weeklyReportSaving = ref(false)

  const weeklyReportSubmitError = ref('')

  const weeklyReportsApiReady = ref(import.meta.env.VITE_WEEKLY_REPORTS_API_READY === 'true')

  const weeklyReportDetailsOpen = ref(false)

  const selectedWeeklyReport = ref(null)

  const weeklyReportDetailsLoading = ref(false)

  const weeklyReportDetailsError = ref('')

  function normalizeReportFilterDate(value) {
    if (!value) {
      return ''
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10)
    }

    return value
  }

  function handleReportDrilldown(filters) {
    if (!filters) {
      return
    }

    const nextFilters = {
      ...analytics.value.filters,
      ...filters,
    }

    if (nextFilters.from) {
      nextFilters.from = normalizeReportFilterDate(nextFilters.from)
    }

    if (nextFilters.to) {
      nextFilters.to = normalizeReportFilterDate(nextFilters.to)
    }

    store.commit('analytics/APPLY_FILTERS', nextFilters)

    router.push({
      name: 'analytics-tasks',
    })
  }

  function handleWeeklyReportEdit(report) {
    weeklyReportDetailsOpen.value = false

    weeklyReportSubmitError.value = ''

    weeklyReportEditSource.value = report

    weeklyReportOpen.value = true
  }

  function getApiErrorMessage(error, fallback) {
    const response = error?.response?.data

    return response?.error?.message || response?.message || fallback
  }

  async function loadAnalyticsReport() {
    if (!analyticsReportApiReady.value) {
      return
    }

    reportLoading.value = true
    reportError.value = ''

    try {
      reportData.value = await analyticsService.getAnalyticsReport(analytics.value.filters)
    } catch (error) {
      reportData.value = null

      reportError.value = getApiErrorMessage(error, 'Не вдалося завантажити Analytics Report.')
    } finally {
      reportLoading.value = false
    }
  }

  function openNewWeeklyReport() {
    weeklyReportEditSource.value = null

    weeklyReportSubmitError.value = ''

    weeklyReportOpen.value = true
  }

  function editPreparedReport() {
    if (!preparedReport.value) {
      return
    }

    weeklyReportSubmitError.value = ''

    weeklyReportEditSource.value = {
      ...preparedReport.value,

      sprintName: preparedReportMeta.value?.sprintName,

      sprintPeriod: preparedReportMeta.value?.sprintPeriod,

      specialist: preparedReportMeta.value?.specialist,
    }

    weeklyReportOpen.value = true
  }

  async function loadWeeklyReports() {
    if (!weeklyReportsApiReady.value) {
      return
    }

    weeklyReportsLoading.value = true
    weeklyReportsError.value = ''

    try {
      weeklyReports.value = await analyticsService.listWeeklyReports()
    } catch (error) {
      weeklyReports.value = []

      weeklyReportsError.value = getApiErrorMessage(error, 'Не вдалося завантажити Weekly Reports.')
    } finally {
      weeklyReportsLoading.value = false
    }
  }

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

  async function handleWeeklyReportPrepared(payload, meta) {
    weeklyReportSubmitError.value = ''

    // Backend ще не підключений:
    // просто формуємо локальний Preview.
    if (!weeklyReportsApiReady.value) {
      preparedReport.value = payload
      preparedReportMeta.value = meta

      weeklyReportOpen.value = false

      return
    }

    weeklyReportSaving.value = true

    try {
      let savedReport

      if (meta.mode === 'edit' && meta.reportId) {
        savedReport = await analyticsService.updateWeeklyReport(meta.reportId, payload)
      } else {
        savedReport = await analyticsService.createWeeklyReport(payload)
      }

      preparedReport.value = savedReport

      preparedReportMeta.value = {
        ...meta,

        mode: 'edit',

        reportId: savedReport?.id || meta.reportId || null,

        sprintName: savedReport?.sprint?.name || savedReport?.sprintName || meta.sprintName,

        specialist:
          savedReport?.specialist?.displayName ||
          savedReport?.teamMember?.displayName ||
          savedReport?.specialistName ||
          meta.specialist,
      }

      weeklyReportEditSource.value = null

      weeklyReportOpen.value = false

      await loadWeeklyReports()
    } catch (error) {
      weeklyReportSubmitError.value = getApiErrorMessage(
        error,
        meta.mode === 'edit'
          ? 'Не вдалося оновити Weekly Report.'
          : 'Не вдалося зберегти Weekly Report.',
      )
    } finally {
      weeklyReportSaving.value = false
    }
  }

  function formatMetric(value) {
    return Number(value || 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function brandName(code) {
    return store.getters['analytics/brandLabel'](code)
  }

  const kpis = computed(() => {
    const data = reportData.value?.kpi

    return [
      {
        key: 'totalTasks',
        label: 'Усього задач',
        value: data?.totalTasks,
        description: 'Кількість задач у вибраному наборі',
        raw: true,
      },
      {
        key: 'doneTasks',
        label: 'Закрито задач',
        value: data?.doneTasks,
        description: 'Кількість задач зі статусом Done',
        raw: true,
      },
      {
        key: 'completionRate',
        label: 'Completion Rate',
        value:
          data?.completionRate === null || data?.completionRate === undefined
            ? null
            : `${formatPercent(data.completionRate)}%`,
        raw: false,
        description: 'Частка завершених задач',
      },
      {
        key: 'totalSP',
        label: 'SP за період',
        value: data?.totalSP,
        description: 'Фактично зараховані Story Points',
        raw: true,
      },
    ]
  })

  function formatPercent(value) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return 0
    }

    const percent = number <= 1 ? number * 100 : number

    return Number(percent.toFixed(1))
  }

  const taskTypeRows = computed(() => {
    return reportData.value?.taskTypes || []
  })

  const executorRows = computed(() => {
    return reportData.value?.executors || []
  })

  const brandRows = computed(() => {
    return reportData.value?.brands || []
  })

  const periodRows = computed(() => {
    return reportData.value?.periodDynamics || reportData.value?.periods || []
  })

  const periodBrandPivot = computed(() => {
    return reportData.value?.periodBrandPivot || reportData.value?.periodBrand || null
  })

  const periodBrandRows = computed(() => {
    const pivot = periodBrandPivot.value

    if (!pivot) {
      return []
    }

    if (Array.isArray(pivot)) {
      return pivot
    }

    return pivot.rows || []
  })

  const periodBrandCodes = computed(() => {
    const pivot = periodBrandPivot.value

    if (pivot && !Array.isArray(pivot) && Array.isArray(pivot.brands)) {
      return pivot.brands.map((brand) =>
        typeof brand === 'string' ? brand : brand.code || brand.brand,
      )
    }

    const codes = new Set()

    periodBrandRows.value.forEach((row) => {
      const cells = row.cells || row.values || row.brands || {}

      if (Array.isArray(cells)) {
        cells.forEach((cell) => {
          const code = cell.brandCode || cell.brand

          if (code) {
            codes.add(code)
          }
        })

        return
      }

      Object.keys(cells).forEach((code) => {
        codes.add(code)
      })
    })

    return [...codes]
  })

  function taskTypeName(code) {
    return store.getters['analytics/taskTypeLabel'](code)
  }

  function reportBrandName(code) {
    return store.getters['analytics/brandLabel'](code)
  }

  function completionRateLabel(value) {
    if (value === null || value === undefined) {
      return '—'
    }

    return `${formatPercent(value)}%`
  }

  function spShareLabel(value) {
    const total = Number(reportData.value?.kpi?.totalSP) || 0

    const current = Number(value) || 0

    if (total <= 0) {
      return '—'
    }

    return `${formatPercent(current / total)}%`
  }

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

  onMounted(() => {
    if (weeklyReportsApiReady.value) {
      loadWeeklyReports()
    }

    if (analyticsReportApiReady.value) {
      loadAnalyticsReport()
    }
  })

  watch(
    () => analytics.value.filterVersion,
    () => {
      if (analyticsReportApiReady.value) {
        loadAnalyticsReport()
      }
    },
  )
</script>
