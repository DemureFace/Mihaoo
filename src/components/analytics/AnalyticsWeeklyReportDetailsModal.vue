<template>
  <BaseModal aria-label="Деталі тижневого звіту" v-model="open" size="lg">
    <div class="min-w-0 space-y-6">
      <header class="min-w-0">
        <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
          Weekly Report
        </p>

        <h2 class="m-0 mt-1 text-2xl font-bold">
          {{ sprintName }}
        </h2>

        <p v-if="sprintPeriod" class="mt-1 text-sm text-neutral-500">
          {{ sprintPeriod }}
        </p>
      </header>

      <div v-if="loading" class="py-16 text-center">
        <div
          class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
        />

        <p class="mt-3 text-sm text-neutral-500">Завантажуємо Weekly Report...</p>
      </div>

      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
        <p class="m-0 text-sm font-semibold text-red-700">Не вдалося завантажити Weekly Report</p>

        <p class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <template v-else-if="report">
        <!-- Specialist -->
        <section class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="m-0 text-xs text-neutral-500">Specialist</p>

          <p class="mt-1 text-base font-semibold">
            {{ specialistName }}
          </p>

          <p v-if="specialistEmail" class="mt-0.5 text-xs text-neutral-400">
            {{ specialistEmail }}
          </p>
        </section>

        <!-- Summary -->
        <section>
          <h3 class="m-0 mb-3 text-base font-bold">Підсумок</h3>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
              <p class="m-0 text-xs text-neutral-500">Tasks</p>

              <p class="mt-1 text-2xl font-bold">
                {{ report.tasksAmount ?? 0 }}
              </p>
            </article>

            <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
              <p class="m-0 text-xs text-neutral-500">Done SP</p>

              <p class="mt-1 text-2xl font-bold">
                {{ formatNumber(report.doneStoryPoints) }}
              </p>
            </article>

            <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
              <p class="m-0 text-xs text-neutral-500">Planned SP</p>

              <p class="mt-1 text-2xl font-bold">
                {{ formatNumber(report.plannedStoryPoints) }}
              </p>
            </article>

            <article class="rounded-xl border border-black bg-black p-3 text-white">
              <p class="m-0 text-xs text-white/60">Performance</p>

              <p class="mt-1 text-2xl font-bold">
                {{ performanceLabel }}
              </p>
            </article>
          </div>
        </section>

        <!-- Additional activity -->
        <section>
          <h3 class="m-0 mb-3 text-base font-bold">Додаткова активність</h3>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article class="rounded-xl border border-black/10 p-3">
              <p class="m-0 text-xs text-neutral-500">Team Lead Activity</p>

              <p class="mt-1 font-semibold">
                {{ formatNumber(report.teamLeadActivitySp) }}
                SP
              </p>
            </article>

            <article class="rounded-xl border border-black/10 p-3">
              <p class="m-0 text-xs text-neutral-500">Preview Task</p>

              <p class="mt-1 font-semibold">
                {{ formatNumber(report.previewTaskSp) }}
                SP
              </p>
            </article>

            <article class="rounded-xl border border-black/10 p-3">
              <p class="m-0 text-xs text-neutral-500">Vacation</p>

              <p class="mt-1 font-semibold">
                {{ formatNumber(report.vacationSp) }}
                SP
              </p>
            </article>
          </div>
        </section>

        <!-- Brands -->
        <section class="overflow-hidden rounded-xl border border-black">
          <header class="border-b border-neutral-200 px-4 py-3">
            <h3 class="m-0 text-base font-bold">Розподіл по брендах</h3>
          </header>

          <BaseTableScroll label="Дані звіту">
            <table class="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Brand</th>

                  <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">Tasks</th>

                  <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">SP</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="metric in brandMetrics"
                  :key="metric.id || metric.brandCode || metric.brand"
                  class="border-b border-neutral-100 last:border-b-0"
                >
                  <td class="px-4 py-3 font-medium">
                    {{ brandLabel(metric) }}

                    <span class="ml-1 text-xs text-neutral-400">
                      {{ brandCode(metric) }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-right">
                    {{ metric.tasksAmount ?? 0 }}
                  </td>

                  <td class="px-4 py-3 text-right font-semibold">
                    {{ formatNumber(metric.storyPoints) }}
                  </td>
                </tr>

                <tr v-if="!brandMetrics.length">
                  <td colspan="3" class="px-4 py-8 text-center text-sm text-neutral-500">
                    Для цього звіту немає breakdown по брендах.
                  </td>
                </tr>
              </tbody>
            </table>
          </BaseTableScroll>
        </section>

        <footer class="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4">
          <BaseButton variant="secondary" @click="close">Закрити</BaseButton>

          <BaseButton v-if="allowEdit" variant="primary" @click="emit('edit', report)">
            Редагувати
          </BaseButton>
        </footer>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
  import BaseTableScroll from '@/components/base/BaseTableScroll.vue'

  import { computed } from 'vue'
  import { useStore } from 'vuex'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    report: {
      type: Object,
      default: null,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: '',
    },

    allowEdit: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'edit'])

  const store = useStore()

  const open = computed({
    get() {
      return props.modelValue
    },

    set(value) {
      emit('update:modelValue', value)
    },
  })

  const sprintName = computed(() => {
    return (
      props.report?.sprint?.name ||
      props.report?.sprintName ||
      `Sprint ${props.report?.sprintId || '—'}`
    )
  })

  const sprintPeriod = computed(() => {
    const start = props.report?.sprint?.startDate || props.report?.startDate

    const end = props.report?.sprint?.endDate || props.report?.endDate

    if (!start || !end) {
      return ''
    }

    return `${formatDate(start)} — ${formatDate(end)}`
  })

  const specialistName = computed(() => {
    return (
      props.report?.specialist?.displayName ||
      props.report?.teamMember?.displayName ||
      props.report?.specialistName ||
      '—'
    )
  })

  const specialistEmail = computed(() => {
    return (
      props.report?.specialist?.email ||
      props.report?.teamMember?.email ||
      props.report?.specialistEmail ||
      ''
    )
  })

  const performanceLabel = computed(() => {
    const value = props.report?.performancePercent

    if (value === null || value === undefined) {
      return '—'
    }

    return `${formatNumber(value)}%`
  })

  const brandMetrics = computed(() => {
    return props.report?.brandMetrics || props.report?.metrics || []
  })

  function brandCode(metric) {
    return metric.brandCode || metric.brand || '—'
  }

  function brandLabel(metric) {
    const code = brandCode(metric)

    return store.getters['analytics/brandLabel'](code)
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
      year: 'numeric',
    }).format(date)
  }

  function close() {
    emit('update:modelValue', false)
  }
</script>
