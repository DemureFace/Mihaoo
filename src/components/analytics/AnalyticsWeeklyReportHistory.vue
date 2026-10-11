<template>
  <section class="overflow-hidden rounded-[14px] border border-black bg-white">
    <header
      class="flex flex-col gap-3 border-b border-neutral-200 px-[18px] py-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h2 class="m-0 text-lg font-bold">Історія Weekly Reports</h2>

        <p class="mt-1 text-[13px] text-neutral-500">Заповнені тижневі звіти команди по Sprint.</p>
      </div>

      <span
        v-if="reports.length"
        class="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600"
      >
        {{ reports.length }} reports
      </span>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex min-h-[180px] items-center justify-center px-4 py-10">
      <div class="text-center">
        <div
          class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
        />

        <p class="mt-3 text-sm text-neutral-500">Завантажуємо Weekly Reports...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="px-4 py-8">
      <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
        <p class="m-0 text-sm font-semibold text-red-700">Не вдалося завантажити Weekly Reports</p>

        <p class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>

        <BaseButton
          v-if="retryable"
          variant="secondary"
          size="sm"
          class="mt-3"
          @click="emit('retry')"
        >
          Спробувати ще раз
        </BaseButton>
      </div>
    </div>

    <!-- API not connected -->
    <div v-else-if="!apiReady" class="px-4 py-12 text-center">
      <p class="m-0 text-sm font-semibold text-black">
        Історія буде доступна після підключення Weekly Report API
      </p>

      <p class="mx-auto mt-1 max-w-md text-sm text-neutral-500">
        UI уже готовий. Після появи
        <code class="font-mono text-xs">GET /weekly-reports</code>
        сюди підключимо історичні та нові звіти з Analytics DB.
      </p>
    </div>

    <!-- Real empty state -->
    <div v-else-if="!reports.length" class="px-4 py-12 text-center">
      <p class="m-0 text-sm font-semibold text-black">Weekly Reports поки немає</p>

      <p class="mt-1 text-sm text-neutral-500">Після створення першого звіту він зʼявиться тут.</p>
    </div>

    <!-- Table -->
    <BaseTableScroll v-else label="Дані звіту">
      <table class="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Sprint</th>

            <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Specialist</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done SP</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Planned SP</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Performance</th>

            <th class="w-[110px] px-4 py-3 text-right text-xs font-semibold text-neutral-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="report in reports"
            :key="report.id"
            class="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
          >
            <td class="px-4 py-3">
              <p class="m-0 font-semibold text-black">
                {{ sprintName(report) }}
              </p>

              <p v-if="sprintPeriod(report)" class="mt-0.5 text-xs text-neutral-400">
                {{ sprintPeriod(report) }}
              </p>
            </td>

            <td class="px-4 py-3">
              <p class="m-0 font-medium">
                {{ specialistName(report) }}
              </p>

              <p v-if="specialistEmail(report)" class="mt-0.5 text-xs text-neutral-400">
                {{ specialistEmail(report) }}
              </p>
            </td>

            <td class="px-4 py-3 text-right">
              {{ report.tasksAmount ?? 0 }}
            </td>

            <td class="px-4 py-3 text-right font-semibold">
              {{ formatNumber(report.doneStoryPoints) }}
            </td>

            <td class="px-4 py-3 text-right">
              {{ formatNumber(report.plannedStoryPoints) }}
            </td>

            <td class="px-4 py-3 text-right">
              <span
                class="inline-flex min-w-[64px] justify-center rounded-full border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-semibold"
              >
                {{ performanceLabel(report.performancePercent) }}
              </span>
            </td>

            <td class="px-4 py-3 text-right">
              <BaseButton variant="secondary" size="sm" @click="emit('open', report)">
                Відкрити
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseTableScroll>
  </section>
</template>

<script setup>
  import BaseTableScroll from '@/components/base/BaseTableScroll.vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  defineProps({
    reports: {
      type: Array,
      default: () => [],
    },

    loading: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: '',
    },

    apiReady: {
      type: Boolean,
      default: false,
    },

    retryable: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['open', 'retry'])

  function formatNumber(value) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return '0'
    }

    return number.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function performanceLabel(value) {
    if (value === null || value === undefined) {
      return '—'
    }

    return `${formatNumber(value)}%`
  }

  function sprintName(report) {
    return report.sprint?.name || report.sprintName || `Sprint ${report.sprintId || '—'}`
  }

  function sprintPeriod(report) {
    const start = report.sprint?.startDate || report.startDate

    const end = report.sprint?.endDate || report.endDate

    if (!start || !end) {
      return ''
    }

    return `${formatDate(start)} — ${formatDate(end)}`
  }

  function specialistName(report) {
    return (
      report.specialist?.displayName ||
      report.teamMember?.displayName ||
      report.specialistName ||
      '—'
    )
  }

  function specialistEmail(report) {
    return report.specialist?.email || report.teamMember?.email || report.specialistEmail || ''
  }

  function formatDate(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }
</script>
