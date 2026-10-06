<template>
  <BaseModal v-model="isOpen" size="xl">
    <form class="min-w-0 space-y-5" @submit.prevent="submit">
      <header class="border-b border-neutral-200 pb-5">
        <h2 class="text-2xl font-bold tracking-[-0.02em] text-black">
          {{ isDuplicate ? 'Створити схожу задачу' : 'Нова задача' }}
        </h2>

        <p class="mt-1 text-sm text-neutral-500">
          {{
            isDuplicate
              ? 'Основні дані скопійовані. Перевір поля та вкажи нового виконавця, SP і дату звіту.'
              : 'Одна форма створить окремий рядок Task List для кожного вибраного бренду.'
          }}
        </p>
      </header>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="referenceLoading" class="flex min-h-[260px] items-center justify-center">
        <div class="flex items-center gap-3 text-sm text-neutral-500">
          <span
            class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
          />

          Завантажуємо дані…
        </div>
      </div>

      <template v-else>
        <!-- General -->
        <section class="rounded-xl border border-neutral-200">
          <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <h3 class="text-sm font-bold text-black">Загальні дані</h3>
          </header>

          <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <BaseInput
              v-model="form.title"
              id="create-task-title"
              label="Назва"
              placeholder="Наприклад: Winter Tournament"
              class="md:col-span-2"
            />

            <BaseTextarea
              v-model="form.description"
              id="create-task-description"
              label="Опис"
              :rows="5"
              required
              class="md:col-span-2"
            />

            <BaseSelect
              v-model="form.platform"
              id="create-task-platform"
              label="Платформа"
              placeholder="Оберіть платформу"
              :options="platformOptions"
              required
            />

            <BaseSelect
              v-model="form.taskType"
              id="create-task-type"
              label="Тип задачі"
              placeholder="Оберіть тип"
              :options="taskTypeOptions"
              required
            />

            <BaseSelect
              v-model="form.requestedById"
              id="create-task-requester"
              label="Від кого"
              placeholder="Оберіть"
              :options="memberOptions"
              required
            />

            <BaseInput
              v-model="form.jiraKey"
              id="create-task-jira"
              label="Jira"
              placeholder="CONTENT-123"
            />

            <BaseInput
              v-model="form.reportDate"
              id="create-task-report-date"
              type="date"
              label="Дата звіту"
              required
            />

            <BaseInput
              v-model="form.dueDate"
              id="create-task-due-date"
              type="date"
              label="Deadline"
              hint="Optional"
            />
          </div>
        </section>

        <!-- Brands -->
        <section class="rounded-xl border border-neutral-200">
          <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <h3 class="text-sm font-bold text-black">Бренди</h3>

            <p class="mt-1 text-xs text-neutral-500">
              Доступні бренди залежать від вибраної платформи.
            </p>
          </header>

          <div class="p-4">
            <div
              v-if="!form.platform"
              class="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500"
            >
              Спочатку оберіть платформу.
            </div>

            <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <div
                v-for="brand in brandOptions"
                :key="brand.value"
                class="rounded-lg border border-neutral-200 p-3"
              >
                <BaseCheckbox
                  v-model="form.brands"
                  :id="`create-brand-${brand.value}`"
                  :value="brand.value"
                >
                  {{ brand.label }}
                </BaseCheckbox>
              </div>
            </div>

            <p v-if="form.platform && !form.brands.length" class="mt-3 text-xs text-neutral-500">
              Оберіть хоча б один бренд.
            </p>
          </div>
        </section>

        <!-- Assignment -->
        <section class="rounded-xl border border-neutral-200">
          <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <h3 class="text-sm font-bold text-black">Виконавець та SP</h3>
          </header>

          <div class="space-y-4 p-4">
            <BaseCheckbox v-model="form.differentExecutorsPerBrand" id="create-different-executors">
              Різні виконавці для брендів
            </BaseCheckbox>

            <div
              v-if="!form.differentExecutorsPerBrand"
              class="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <BaseSelect
                v-model="form.executorId"
                id="create-task-executor"
                label="Виконавець"
                placeholder="Оберіть"
                :options="memberOptions"
                required
              />

              <BaseInput
                v-model="form.storyPointsPerBrand"
                id="create-task-sp"
                label="SP на бренд"
                type="number"
                min="0"
                required
              />
            </div>

            <template v-else>
              <BaseInput
                v-model="form.storyPointsPerBrand"
                id="create-task-sp-multi"
                label="SP на бренд"
                type="number"
                min="0"
                required
              />

              <div v-if="form.brands.length" class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <BaseSelect
                  v-for="brand in selectedBrands"
                  :key="brand.value"
                  v-model="brandExecutors[brand.value]"
                  :id="`create-executor-${brand.value}`"
                  :label="`Виконавець · ${brand.label}`"
                  placeholder="Оберіть"
                  :options="memberOptions"
                  required
                />
              </div>

              <p v-else class="text-sm text-neutral-500">Спочатку оберіть бренди.</p>
            </template>
          </div>
        </section>

        <!-- Status -->
        <section class="rounded-xl border border-neutral-200">
          <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <h3 class="text-sm font-bold text-black">Статус</h3>
          </header>

          <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <BaseSelect
              v-model="form.status"
              id="create-task-status"
              label="Статус"
              :options="ANALYTICS_STATUSES"
              required
            />

            <BaseInput
              v-if="form.status === 'DONE'"
              v-model="form.closedAt"
              id="create-task-closed-at"
              type="date"
              label="Дата завершення"
              required
            />
          </div>
        </section>

        <footer class="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-5">
          <BaseButton type="button" :disabled="saving" @click="isOpen = false">
            Скасувати
          </BaseButton>

          <BaseButton type="submit" variant="primary" :loading="saving" :disabled="!canSubmit">
            Створити задачу
          </BaseButton>
        </footer>
      </template>
    </form>
  </BaseModal>
</template>

<script setup>
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

  import { useStore } from 'vuex'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'

  import { ANALYTICS_STATUSES } from '@/constants/analytics'
  import { analyticsService } from '@/services/analytics.service'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    initialData: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'created'])

  const store = useStore()

  const referenceData = ref(null)

  const referenceLoading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const brandExecutors = reactive({})

  let controller = null

  function today() {
    const date = new Date()

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function createInitialForm() {
    return {
      title: '',
      description: '',
      platform: '',
      taskType: '',
      brands: [],
      differentExecutorsPerBrand: false,
      executorId: '',
      requestedById: '',
      dueDate: '',
      reportDate: today(),
      storyPointsPerBrand: '',
      jiraKey: '',
      status: 'IN_PROGRESS',
      closedAt: '',
    }
  }

  function formatInputDate(value) {
    if (!value) {
      return ''
    }

    return String(value).slice(0, 10)
  }

  function applyInitialData() {
    const data = props.initialData

    if (!data) {
      return
    }

    form.title = data.title || ''

    form.description = data.description || ''

    form.platform = data.platform || ''

    form.taskType = data.taskType || ''

    form.brands = Array.isArray(data.brands) ? [...data.brands] : []

    form.requestedById = data.requestedById ?? ''

    form.jiraKey = data.jiraKey || ''

    form.dueDate = formatInputDate(data.dueDate)

    // Навмисно НЕ переносимо:
    // executor
    // SP
    // status
    // reportDate
    form.executorId = ''
    form.storyPointsPerBrand = ''
    form.status = 'IN_PROGRESS'
    form.reportDate = today()
    form.closedAt = ''
    form.differentExecutorsPerBrand = false
  }

  const form = reactive(createInitialForm())

  const isOpen = computed({
    get: () => props.modelValue,

    set: (value) => {
      emit('update:modelValue', value)
    },
  })

  const memberOptions = computed(() => {
    return store.state.analytics.members.map((member) => ({
      value: member.id,
      label: member.displayName,
    }))
  })

  const platformOptions = computed(() => {
    return (
      referenceData.value?.platforms?.map((platform) => ({
        value: platform.code,
        label: platform.name,
      })) || []
    )
  })

  const taskTypeOptions = computed(() => {
    return (
      referenceData.value?.taskTypes?.map((type) => ({
        value: type.code,
        label: type.name,
      })) || []
    )
  })

  const randomBrand = computed(() => {
    return referenceData.value?.brands?.find((brand) => brand.code === 'RANDOM')
  })

  const brandOptions = computed(() => {
    if (!form.platform) {
      return []
    }

    const platformBrands = referenceData.value?.brandsByPlatform?.[form.platform] || []

    const result = platformBrands.map((brand) => ({
      value: brand.code,
      label: brand.name,
    }))

    if (randomBrand.value && !result.some((brand) => brand.value === 'RANDOM')) {
      result.push({
        value: randomBrand.value.code,
        label: randomBrand.value.name,
      })
    }

    return result
  })

  const isDuplicate = computed(() => {
    return Boolean(props.initialData)
  })

  const selectedBrands = computed(() => {
    return brandOptions.value.filter((brand) => form.brands.includes(brand.value))
  })

  const canSubmit = computed(() => {
    if (saving.value || referenceLoading.value) {
      return false
    }

    if (
      !form.description.trim() ||
      !form.platform ||
      !form.taskType ||
      !form.requestedById ||
      !form.reportDate ||
      !form.brands.length
    ) {
      return false
    }

    const storyPoints = Number(form.storyPointsPerBrand)

    if (!Number.isFinite(storyPoints) || storyPoints < 0) {
      return false
    }

    if (form.status === 'DONE' && !form.closedAt) {
      return false
    }

    if (!form.differentExecutorsPerBrand) {
      return Boolean(form.executorId)
    }

    return form.brands.every((brand) => Boolean(brandExecutors[brand]))
  })

  function getErrorMessage(requestError) {
    const response = requestError?.response?.data

    const message = response?.message || response?.error?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    return message || requestError?.message || 'Не вдалося створити задачу.'
  }

  function resetForm() {
    Object.assign(form, createInitialForm())

    Object.keys(brandExecutors).forEach((key) => {
      delete brandExecutors[key]
    })

    error.value = ''
  }

  function cancelRequest() {
    controller?.abort()

    controller = null
  }

  async function loadReferenceData() {
    cancelRequest()

    const currentController = new AbortController()

    controller = currentController

    referenceLoading.value = true
    error.value = ''

    try {
      if (!store.state.analytics.members.length) {
        await store.dispatch('analytics/loadMembers')
      }

      referenceData.value = await analyticsService.getReferenceData(currentController.signal)
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      error.value = getErrorMessage(requestError)
    } finally {
      if (controller === currentController) {
        controller = null

        referenceLoading.value = false
      }
    }
  }

  async function submit() {
    if (!canSubmit.value) {
      error.value = 'Заповни всі обов’язкові поля.'

      return
    }

    error.value = ''
    saving.value = true

    try {
      const payload = {
        description: form.description.trim(),

        platform: form.platform,

        taskType: form.taskType,

        brands: [...form.brands],

        requestedById: Number(form.requestedById),

        reportDate: form.reportDate,

        storyPointsPerBrand: Number(form.storyPointsPerBrand),

        status: form.status,
      }

      const title = form.title.trim()

      if (title) {
        payload.title = title
      }

      const jiraKey = form.jiraKey.trim()

      if (jiraKey) {
        payload.jiraKey = jiraKey
      }

      if (form.dueDate) {
        payload.dueDate = form.dueDate
      }

      if (form.status === 'DONE') {
        payload.closedAt = form.closedAt
      }

      if (form.differentExecutorsPerBrand) {
        payload.differentExecutorsPerBrand = true

        payload.brandExecutors = form.brands.map((brand) => ({
          brand,

          executorId: Number(brandExecutors[brand]),
        }))
      } else {
        payload.executorId = Number(form.executorId)
      }

      const result = await analyticsService.createTask(payload)

      emit('created', result)

      isOpen.value = false
    } catch (requestError) {
      error.value = getErrorMessage(requestError)
    } finally {
      saving.value = false
    }
  }

  watch(
    () => form.platform,

    () => {
      const validBrands = new Set(brandOptions.value.map((brand) => brand.value))

      form.brands = form.brands.filter((brand) => validBrands.has(brand))
    },
  )

  watch(
    () => [...form.brands],

    (brands) => {
      Object.keys(brandExecutors).forEach((brand) => {
        if (!brands.includes(brand)) {
          delete brandExecutors[brand]
        }
      })
    },
  )

  watch(
    () => form.status,

    (status) => {
      if (status !== 'DONE') {
        form.closedAt = ''
      }
    },
  )

  async function prepareOpen() {
    resetForm()

    await loadReferenceData()

    if (props.modelValue) {
      applyInitialData()
    }
  }

  watch(
    () => props.modelValue,

    (open) => {
      if (open) {
        prepareOpen()

        return
      }

      cancelRequest()

      saving.value = false
    },
  )

  onBeforeUnmount(() => {
    cancelRequest()
  })
</script>
