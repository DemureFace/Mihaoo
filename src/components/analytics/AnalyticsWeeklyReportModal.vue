<template>
  <BaseModal v-model="open" size="xl">
    <div class="space-y-6">
      <header class="pr-10">
        <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
          Analytics
        </p>

        <h2 class="m-0 mt-1 text-2xl font-bold tracking-[-0.02em] text-black">
          {{ isEdit ? 'Редагування тижневого звіту' : 'Тижневий звіт' }}
        </h2>

        <p class="mt-1 text-sm text-neutral-500">
          {{
            isEdit
              ? 'Онови результати роботи за вибраний Sprint.'
              : 'Заповни результати роботи за вибраний Sprint.'
          }}
        </p>
      </header>

      <!-- General -->
      <section class="rounded-xl border border-black/10 bg-neutral-50 p-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseSelect
            v-model="sprintId"
            id="weekly-report-sprint"
            label="Sprint"
            placeholder="Оберіть Sprint"
            :options="sprintOptions"
            :disabled="sprintsLoading || isEdit"
            :error="errors.sprintId"
            required
          />

          <BaseInput
            :model-value="specialistValue"
            id="weekly-report-user"
            label="Specialist"
            disabled
          />

          <BaseInput
            v-model="plannedStoryPoints"
            id="weekly-report-planned-sp"
            label="Planned SP"
            type="number"
            min="0"
            placeholder="0"
            :error="errors.plannedStoryPoints"
            required
          />
        </div>

        <p v-if="sprintsError" class="mt-3 text-xs font-medium text-red-600">
          {{ sprintsError }}
        </p>
      </section>

      <!-- Brand metrics -->
      <section class="overflow-hidden rounded-xl border border-black">
        <header class="border-b border-neutral-200 px-4 py-3">
          <h3 class="m-0 text-base font-bold">Робота по брендах</h3>

          <p class="mt-1 text-xs text-neutral-500">
            Вкажи кількість задач та фактично виконані SP.
          </p>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-neutral-200 bg-neutral-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Бренд</th>

                <th class="w-[190px] px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                  Tasks
                </th>

                <th class="w-[190px] px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                  Story Points
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="metric in brandMetrics"
                :key="metric.brandCode"
                class="border-b border-neutral-100 last:border-b-0"
              >
                <td class="px-4 py-3">
                  <span class="font-semibold text-black">
                    {{ metric.brandLabel }}
                  </span>

                  <span class="ml-2 text-xs text-neutral-400">
                    {{ metric.brandCode }}
                  </span>
                </td>

                <td class="px-4 py-2">
                  <BaseInput
                    v-model="metric.tasksAmount"
                    :id="`weekly-brand-${metric.brandCode}-tasks`"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </td>

                <td class="px-4 py-2">
                  <BaseInput
                    v-model="metric.storyPoints"
                    :id="`weekly-brand-${metric.brandCode}-sp`"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </td>
              </tr>

              <tr v-if="!brandMetrics.length">
                <td colspan="3" class="px-4 py-10 text-center text-sm text-neutral-500">
                  Не вдалося завантажити бренди.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Additional work -->
      <section class="rounded-xl border border-black/10 p-4">
        <h3 class="m-0 text-base font-bold">Додаткова активність</h3>

        <p class="mt-1 text-xs text-neutral-500">Ці SP також входять у Done SP за тиждень.</p>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <BaseInput
            v-model="teamLeadActivitySp"
            id="weekly-report-team-lead"
            label="Team Lead Activity SP"
            type="number"
            min="0"
            placeholder="0"
          />

          <BaseInput
            v-model="previewTaskSp"
            id="weekly-report-preview"
            label="Preview Task SP"
            type="number"
            min="0"
            placeholder="0"
          />

          <BaseInput
            v-model="vacationSp"
            id="weekly-report-vacation"
            label="Vacation SP"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
      </section>

      <!-- Summary -->
      <section>
        <h3 class="m-0 mb-3 text-base font-bold">Підсумок</h3>

        <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
            <p class="m-0 text-xs text-neutral-500">Tasks</p>

            <p class="mt-1 text-2xl font-bold">
              {{ totalTasks }}
            </p>
          </article>

          <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
            <p class="m-0 text-xs text-neutral-500">Brand SP</p>

            <p class="mt-1 text-2xl font-bold">
              {{ formatNumber(totalBrandSp) }}
            </p>
          </article>

          <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
            <p class="m-0 text-xs text-neutral-500">Done SP</p>

            <p class="mt-1 text-2xl font-bold">
              {{ formatNumber(doneStoryPoints) }}
            </p>
          </article>

          <article class="rounded-xl border border-black/10 bg-neutral-50 p-3">
            <p class="m-0 text-xs text-neutral-500">Planned SP</p>

            <p class="mt-1 text-2xl font-bold">
              {{ formatNumber(plannedSpNumber) }}
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

      <div
        v-if="formError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ formError }}
      </div>
      <div
        v-if="submitError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ submitError }}
      </div>
      <footer
        class="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="m-0 text-xs text-neutral-500">
          {{
            apiReady
              ? 'Після підтвердження звіт буде збережено в Analytics DB.'
              : 'Збереження буде доступне після підключення Weekly Report API.'
          }}
        </p>

        <div class="flex gap-2">
          <BaseButton variant="secondary" @click="close">Скасувати</BaseButton>

          <BaseButton variant="primary" :loading="saving" :disabled="saving" @click="prepareReport">
            {{
              saving
                ? 'Зберігаємо...'
                : isEdit
                  ? 'Оновити звіт'
                  : apiReady
                    ? 'Зберегти звіт'
                    : 'Підготувати звіт'
            }}
          </BaseButton>
        </div>
      </footer>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue'

  import { useStore } from 'vuex'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'

  import { analyticsService } from '@/services/analytics.service'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    report: {
      type: Object,
      default: null,
    },

    saving: {
      type: Boolean,
      default: false,
    },

    submitError: {
      type: String,
      default: '',
    },

    apiReady: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'prepared'])

  const store = useStore()

  const sprintId = ref('')
  const plannedStoryPoints = ref('')

  const teamLeadActivitySp = ref('')
  const previewTaskSp = ref('')
  const vacationSp = ref('')

  const sprints = ref([])
  const sprintsLoading = ref(false)
  const sprintsError = ref('')

  const brandMetrics = ref([])

  const formError = ref('')

  const errors = reactive({
    sprintId: '',
    plannedStoryPoints: '',
  })

  const open = computed({
    get() {
      return props.modelValue
    },

    set(value) {
      emit('update:modelValue', value)
    },
  })

  const currentUser = computed(() => {
    return store.state.auth.user?.email || 'Current user'
  })

  const isEdit = computed(() => {
    return Boolean(props.report)
  })

  const specialistValue = computed(() => {
    return (
      props.report?.specialist?.displayName ||
      props.report?.teamMember?.displayName ||
      props.report?.specialistName ||
      props.report?.specialist ||
      currentUser.value
    )
  })

  const sprintOptions = computed(() => {
    return sprints.value.map((sprint) => ({
      value: sprint.id,

      label: `${sprint.name} · ${formatDate(sprint.startDate)} — ${formatDate(sprint.endDate)}`,
    }))
  })

  const totalTasks = computed(() => {
    return brandMetrics.value.reduce(
      (sum, metric) => sum + Math.max(0, toInteger(metric.tasksAmount)),
      0,
    )
  })

  const totalBrandSp = computed(() => {
    return round2(
      brandMetrics.value.reduce(
        (sum, metric) => sum + Math.max(0, toNumber(metric.storyPoints)),
        0,
      ),
    )
  })

  const plannedSpNumber = computed(() => {
    return Math.max(0, toNumber(plannedStoryPoints.value))
  })

  const additionalSp = computed(() => {
    return round2(
      Math.max(0, toNumber(teamLeadActivitySp.value)) +
        Math.max(0, toNumber(previewTaskSp.value)) +
        Math.max(0, toNumber(vacationSp.value)),
    )
  })

  const doneStoryPoints = computed(() => {
    return round2(totalBrandSp.value + additionalSp.value)
  })

  const performancePercent = computed(() => {
    if (plannedSpNumber.value <= 0) {
      return null
    }

    return round2((doneStoryPoints.value / plannedSpNumber.value) * 100)
  })

  const performanceLabel = computed(() => {
    if (performancePercent.value === null) {
      return '—'
    }

    return `${formatNumber(performancePercent.value)}%`
  })

  watch(
    () => props.modelValue,
    async (value) => {
      if (!value) {
        return
      }

      resetForm()

      await Promise.all([loadSprints(), store.dispatch('analytics/loadReferenceData')])

      initializeBrands()

      if (props.report) {
        populateForm(props.report)
      }
    },
  )

  watch(
    () => store.state.analytics.referenceData,
    () => {
      if (props.modelValue && !brandMetrics.value.length) {
        initializeBrands()
      }
    },
  )

  async function loadSprints() {
    sprintsLoading.value = true
    sprintsError.value = ''

    try {
      sprints.value = await analyticsService.listSprints()

      selectCurrentSprint()
    } catch {
      sprints.value = []

      sprintsError.value = 'Не вдалося завантажити Sprint.'
    } finally {
      sprintsLoading.value = false
    }
  }

  function initializeBrands() {
    const brands = store.state.analytics.referenceData?.brands || []

    brandMetrics.value = brands.map((brand) => ({
      brandCode: brand.code,
      brandLabel: brand.name,
      tasksAmount: '',
      storyPoints: '',
    }))
  }

  function populateForm(report) {
    sprintId.value = report.sprintId || report.sprint?.id || ''

    plannedStoryPoints.value = report.plannedStoryPoints ?? ''

    teamLeadActivitySp.value = report.teamLeadActivitySp ?? ''

    previewTaskSp.value = report.previewTaskSp ?? ''

    vacationSp.value = report.vacationSp ?? ''

    const existingMetrics = report.brandMetrics || report.metrics || []

    brandMetrics.value = brandMetrics.value.map((metric) => {
      const existing = existingMetrics.find((item) => {
        const code = item.brandCode || item.brand

        return code === metric.brandCode
      })

      if (!existing) {
        return metric
      }

      return {
        ...metric,

        tasksAmount: existing.tasksAmount ?? '',

        storyPoints: existing.storyPoints ?? '',
      }
    })
  }

  function selectCurrentSprint() {
    if (!sprints.value.length) {
      return
    }

    const today = new Date()

    const currentSprint = sprints.value.find((sprint) => {
      const start = new Date(sprint.startDate)

      const end = new Date(sprint.endDate)

      end.setHours(23, 59, 59, 999)

      return today >= start && today <= end
    })

    sprintId.value = currentSprint?.id || sprints.value[0]?.id || ''
  }

  function validate() {
    errors.sprintId = ''
    errors.plannedStoryPoints = ''
    formError.value = ''

    if (!sprintId.value) {
      errors.sprintId = 'Оберіть Sprint.'
    }

    if (plannedStoryPoints.value === '') {
      errors.plannedStoryPoints = 'Вкажи Planned SP.'
    }

    const hasNegativeValue =
      brandMetrics.value.some(
        (metric) => toNumber(metric.tasksAmount) < 0 || toNumber(metric.storyPoints) < 0,
      ) ||
      toNumber(teamLeadActivitySp.value) < 0 ||
      toNumber(previewTaskSp.value) < 0 ||
      toNumber(vacationSp.value) < 0 ||
      toNumber(plannedStoryPoints.value) < 0

    if (hasNegativeValue) {
      formError.value = 'Значення не можуть бути відʼємними.'
    }

    return !errors.sprintId && !errors.plannedStoryPoints && !formError.value
  }

  const selectedSprint = computed(() => {
    return sprints.value.find((sprint) => Number(sprint.id) === Number(sprintId.value))
  })

  function prepareReport() {
    if (!validate()) {
      return
    }

    const payload = {
      sprintId: Number(sprintId.value),

      plannedStoryPoints: round2(plannedSpNumber.value),

      tasksAmount: totalTasks.value,

      doneStoryPoints: doneStoryPoints.value,

      performancePercent: performancePercent.value,

      teamLeadActivitySp: round2(Math.max(0, toNumber(teamLeadActivitySp.value))),

      previewTaskSp: round2(Math.max(0, toNumber(previewTaskSp.value))),

      vacationSp: round2(Math.max(0, toNumber(vacationSp.value))),

      brandMetrics: brandMetrics.value
        .map((metric) => ({
          brandCode: metric.brandCode,

          tasksAmount: Math.max(0, toInteger(metric.tasksAmount)),

          storyPoints: round2(Math.max(0, toNumber(metric.storyPoints))),
        }))
        .filter((metric) => metric.tasksAmount > 0 || metric.storyPoints > 0),
    }

    emit('prepared', payload, {
      mode: isEdit.value ? 'edit' : 'create',

      reportId: props.report?.id || null,

      sprintName:
        selectedSprint.value?.name ||
        props.report?.sprint?.name ||
        props.report?.sprintName ||
        `Sprint ${sprintId.value}`,

      sprintPeriod: selectedSprint.value
        ? `${formatDate(selectedSprint.value.startDate)} — ${formatDate(
            selectedSprint.value.endDate,
          )}`
        : props.report?.sprintPeriod || '',

      specialist: specialistValue.value,
    })
  }

  function resetForm() {
    sprintId.value = ''
    plannedStoryPoints.value = ''

    teamLeadActivitySp.value = ''
    previewTaskSp.value = ''
    vacationSp.value = ''

    brandMetrics.value = []

    formError.value = ''

    errors.sprintId = ''
    errors.plannedStoryPoints = ''
  }

  function close() {
    emit('update:modelValue', false)
  }

  function toNumber(value) {
    const parsed = Number.parseFloat(value)

    return Number.isFinite(parsed) ? parsed : 0
  }

  function toInteger(value) {
    const parsed = Number.parseInt(value, 10)

    return Number.isFinite(parsed) ? parsed : 0
  }

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function formatDate(value) {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }
</script>
