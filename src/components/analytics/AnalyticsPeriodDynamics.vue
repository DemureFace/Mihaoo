<template>
  <section class="overflow-hidden rounded-[14px] border border-black bg-white">
    <header class="border-b border-neutral-200 px-[18px] py-4">
      <h2 class="m-0 text-lg font-bold">Динаміка</h2>

      <p class="mt-0.5 text-[13px] text-neutral-500">
        Зміна задач та фактично зарахованих SP між Sprint
      </p>
    </header>

    <div v-if="loading" class="px-4 py-12 text-center text-sm text-neutral-500">
      Завантажуємо динаміку...
    </div>

    <div v-else-if="!apiReady" class="px-4 py-12 text-center text-sm text-neutral-500">
      Динаміка зʼявиться після підключення Analytics Report API.
    </div>

    <div v-else-if="!rows.length" class="px-4 py-12 text-center text-sm text-neutral-500">
      За вибраними фільтрами немає даних.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Sprint</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Completion</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Total SP</th>

            <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Done SP</th>

            <th class="w-[220px] px-4 py-3 text-left text-xs font-semibold text-neutral-500">
              SP Dynamics
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in rows"
            :key="rowKey(row)"
            class="border-b border-neutral-100 transition last:border-b-0"
            :class="row.filters ? 'cursor-pointer hover:bg-neutral-50' : ''"
            :tabindex="row.filters ? 0 : undefined"
            :role="row.filters ? 'button' : undefined"
            @click="openRow(row)"
            @keydown.enter="openRow(row)"
            @keydown.space.prevent="openRow(row)"
          >
            <td class="px-4 py-3">
              <p class="m-0 font-semibold">
                {{ sprintName(row) }}
              </p>

              <p v-if="sprintPeriod(row)" class="mt-0.5 text-xs text-neutral-400">
                {{ sprintPeriod(row) }}
              </p>
            </td>

            <td class="px-4 py-3 text-right">
              {{ row.totalTasks ?? 0 }}
            </td>

            <td class="px-4 py-3 text-right">
              {{ row.doneTasks ?? 0 }}
            </td>

            <td class="px-4 py-3 text-right">
              {{ completionLabel(row.completionRate) }}
            </td>

            <td class="px-4 py-3 text-right font-semibold">
              {{ formatNumber(row.totalSP) }}
            </td>

            <td class="px-4 py-3 text-right">
              {{ formatNumber(row.doneSP) }}
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    class="h-full rounded-full bg-black transition-all"
                    :style="{
                      width: `${barWidth(row.totalSP)}%`,
                    }"
                  />
                </div>

                <span class="w-12 text-right text-xs font-medium text-neutral-500">
                  {{ formatNumber(row.totalSP) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    rows: {
      type: Array,
      default: () => [],
    },

    loading: {
      type: Boolean,
      default: false,
    },

    apiReady: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['drilldown'])

  const maxSp = computed(() => {
    if (!props.rows.length) {
      return 0
    }

    return Math.max(...props.rows.map((row) => Number(row.totalSP) || 0))
  })

  function openRow(row) {
    if (!row?.filters) {
      return
    }

    emit('drilldown', row.filters)
  }

  function barWidth(value) {
    const current = Number(value) || 0

    if (maxSp.value <= 0) {
      return 0
    }

    return Math.min(100, Math.max(0, (current / maxSp.value) * 100))
  }

  function completionLabel(value) {
    if (value === null || value === undefined) {
      return '—'
    }

    const number = Number(value)

    if (!Number.isFinite(number)) {
      return '—'
    }

    return `${Number((number * 100).toFixed(1))}%`
  }

  function rowKey(row) {
    return row.sprintId || row.sprint?.id || sprintName(row)
  }

  function sprintName(row) {
    return row.sprintName || row.sprint?.name || `Sprint ${row.sprintId || row.sprint?.id || '—'}`
  }

  function sprintPeriod(row) {
    const start = row.startDate || row.sprint?.startDate

    const end = row.endDate || row.sprint?.endDate

    if (!start || !end) {
      return ''
    }

    return `${formatDate(start)} — ${formatDate(end)}`
  }

  function formatNumber(value) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return '0'
    }

    return number.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function formatDate(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    }).format(date)
  }
</script>
