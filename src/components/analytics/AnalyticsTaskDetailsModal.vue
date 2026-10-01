<template>
  <BaseModal v-model="isOpen" size="xl">
    <div class="min-h-[320px]">
      <div v-if="loading" class="flex min-h-[320px] items-center justify-center">
        <div class="flex items-center gap-3 text-sm text-neutral-500">
          <span
            class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
          />

          Завантажуємо задачу…
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center"
      >
        <div>
          <p class="font-semibold text-red-700">Не вдалося завантажити задачу</p>

          <p class="mt-1 text-sm text-neutral-500">
            {{ error }}
          </p>
        </div>

        <BaseButton @click="loadTask">Повторити</BaseButton>
      </div>

      <template v-else-if="task">
        <!-- Header -->
        <header class="border-b border-neutral-200 pb-5 pr-10">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full border border-black px-2.5 py-1 text-xs font-semibold">
                  #{{ selectedBrand?.id || taskId }}
                </span>

                <span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold">
                  {{ formatPlatform(task.platform) }}
                </span>

                <span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold">
                  {{ taskTypeLabel(task.taskType) }}
                </span>
              </div>

              <h2 class="mt-3 text-2xl font-bold tracking-[-0.02em]">
                {{ task.title || 'Без назви' }}
              </h2>
            </div>

            <BaseButton v-if="!editing" size="sm" variant="primary" @click="startEditing">
              Редагувати
            </BaseButton>

            <BaseButton v-else size="sm" @click="cancelEditing">Скасувати</BaseButton>
          </div>
        </header>

        <!-- VIEW -->
        <div v-if="!editing" class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
          <div class="min-w-0 space-y-5">
            <!-- Description -->
            <section v-if="task.description" class="rounded-xl border border-neutral-200 p-4">
              <h3 class="text-sm font-bold">Опис</h3>

              <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                {{ task.description }}
              </p>
            </section>

            <!-- Brands -->
            <section class="overflow-hidden rounded-xl border border-neutral-200">
              <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                <h3 class="text-sm font-bold">Бренди</h3>
              </header>

              <div class="overflow-x-auto">
                <table class="w-full min-w-[650px] border-collapse text-sm">
                  <thead>
                    <tr class="border-b border-neutral-200">
                      <th class="px-4 py-3 text-left text-xs text-neutral-500">Бренд</th>

                      <th class="px-4 py-3 text-left text-xs text-neutral-500">Виконавець</th>

                      <th class="px-4 py-3 text-right text-xs text-neutral-500">SP</th>

                      <th class="px-4 py-3 text-left text-xs text-neutral-500">Статус</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="brandRow in task.brands || []"
                      :key="brandRow.id"
                      class="cursor-pointer border-b border-neutral-100 transition last:border-0 hover:bg-neutral-50"
                      :class="brandRow.id === selectedBrandId ? 'bg-neutral-100' : ''"
                      @click="selectBrand(brandRow.id)"
                    >
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <span
                            class="rounded-full border border-black px-2.5 py-0.5 text-xs font-semibold"
                          >
                            {{ formatBrand(brandRow.brand) }}
                          </span>

                          <span v-if="brandRow.deletedAt" class="text-xs font-medium text-red-600">
                            Видалено
                          </span>
                        </div>
                      </td>

                      <td class="px-4 py-3">
                        {{ brandRow.executor?.displayName || '—' }}
                      </td>

                      <td class="px-4 py-3 text-right tabular-nums">
                        {{ formatNumber(brandRow.storyPoints) }}
                      </td>

                      <td class="px-4 py-3">
                        <span
                          class="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          :class="statusClasses(brandRow.status)"
                        >
                          {{ statusLabel(brandRow.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Comments -->
            <section class="overflow-hidden rounded-xl border border-neutral-200">
              <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                <h3 class="text-sm font-bold">Коментарі</h3>

                <p class="mt-0.5 text-xs text-neutral-500">
                  {{ task.comments?.length || 0 }} коментарів
                </p>
              </header>

              <div v-if="task.comments?.length" class="divide-y divide-neutral-100">
                <article v-for="comment in task.comments" :key="comment.id" class="px-4 py-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-semibold">
                      {{ comment.author?.displayName || 'Unknown user' }}
                    </span>

                    <span class="text-xs text-neutral-400">
                      {{ formatDateTime(comment.createdAt) }}
                    </span>

                    <span v-if="comment.taskBrandId" class="ml-auto text-xs text-neutral-400">
                      #{{ comment.taskBrandId }}
                    </span>
                  </div>

                  <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                    {{ comment.body }}
                  </p>
                </article>
              </div>

              <div v-else class="px-4 py-10 text-center text-sm text-neutral-500">
                Коментарів поки немає.
              </div>
              <div class="border-t border-neutral-200 bg-neutral-50 p-4">
                <BaseTextarea
                  v-model="commentText"
                  id="task-comment"
                  label="Новий коментар"
                  :rows="3"
                  placeholder="Напиши коментар..."
                  :disabled="commentSaving || Boolean(selectedBrand?.deletedAt)"
                />

                <div v-if="commentError" class="mt-2 text-sm font-medium text-red-600">
                  {{ commentError }}
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p class="text-xs text-neutral-500">
                    Коментар буде додано до
                    <span class="font-semibold text-black">
                      {{ formatBrand(selectedBrand?.brand) }}
                    </span>
                    · #{{ selectedBrand?.id || '—' }}
                  </p>

                  <BaseButton
                    variant="primary"
                    size="sm"
                    :loading="commentSaving"
                    :disabled="!canSubmitComment"
                    @click="submitComment"
                  >
                    Додати коментар
                  </BaseButton>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="space-y-4">
            <section class="rounded-xl border border-neutral-200 p-4">
              <h3 class="text-sm font-bold">Загальні дані</h3>

              <dl class="mt-4 space-y-4">
                <DetailRow label="Jira" :value="task.jiraKey || '—'" />

                <DetailRow label="Від кого" :value="task.requestedBy?.displayName || '—'" />

                <DetailRow label="Дата звіту" :value="formatDate(task.reportDate)" />

                <DetailRow label="Deadline" :value="formatDate(task.dueDate)" />
              </dl>
            </section>

            <section class="rounded-xl border border-neutral-200 p-4">
              <h3 class="text-sm font-bold">Поточний рядок</h3>

              <dl class="mt-4 space-y-4">
                <DetailRow label="Brand" :value="formatBrand(selectedBrand?.brand)" />

                <DetailRow label="Executor" :value="selectedBrand?.executor?.displayName || '—'" />

                <DetailRow label="Estimate SP" :value="formatNumber(selectedBrand?.storyPoints)" />

                <div>
                  <dt class="text-xs font-medium text-neutral-500">Status</dt>

                  <dd class="mt-1">
                    <span
                      v-if="selectedBrand"
                      class="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      :class="statusClasses(selectedBrand.status)"
                    >
                      {{ statusLabel(selectedBrand.status) }}
                    </span>

                    <span v-else>—</span>
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <!-- EDIT -->
        <div v-else class="mt-5 space-y-5">
          <div
            v-if="editError"
            class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {{ editError }}
          </div>

          <!-- Shared fields -->
          <section class="rounded-xl border border-neutral-200">
            <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <h3 class="text-sm font-bold">Загальні дані задачі</h3>

              <p class="mt-1 text-xs text-neutral-500">
                Ці поля зміняться одразу для всіх брендів у цій задачі.
              </p>
            </header>

            <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <BaseInput
                v-model="groupForm.title"
                id="task-edit-title"
                label="Назва"
                required
                class="md:col-span-2"
              />

              <BaseTextarea
                v-model="groupForm.description"
                id="task-edit-description"
                label="Опис"
                :rows="5"
                class="md:col-span-2"
              />

              <BaseSelect
                v-model="groupForm.taskType"
                id="task-edit-type"
                label="Тип задачі"
                :options="taskTypeOptions"
                required
              />

              <BaseSelect
                v-model="groupForm.requestedById"
                id="task-edit-requester"
                label="Від кого"
                :options="requesterOptions"
                required
              />

              <BaseInput
                v-model="groupForm.jiraKey"
                id="task-edit-jira"
                label="Jira"
                placeholder="CONTENT-123"
              />

              <BaseInput
                v-model="groupForm.dueDate"
                id="task-edit-due-date"
                type="date"
                label="Deadline"
                hint="Порожнє поле залишить поточний deadline без змін."
              />
            </div>

            <footer class="flex justify-end border-t border-neutral-200 p-4">
              <BaseButton
                variant="primary"
                :loading="groupSaving"
                :disabled="brandSaving"
                @click="saveGroup"
              >
                Зберегти загальні дані
              </BaseButton>
            </footer>
          </section>

          <!-- Brand row fields -->
          <section class="rounded-xl border border-neutral-200">
            <header class="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold">Рядок бренду</h3>

                <span class="rounded-full border border-black px-2.5 py-0.5 text-xs font-semibold">
                  {{ formatBrand(selectedBrand?.brand) }}
                </span>
              </div>

              <p class="mt-1 text-xs text-neutral-500">
                Зміни застосуються тільки до вибраного бренду.
              </p>
            </header>

            <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              <BaseSelect
                v-model="brandForm.executorId"
                id="task-edit-executor"
                label="Виконавець"
                :options="executorOptions"
                required
              />

              <BaseInput
                v-model="brandForm.storyPoints"
                id="task-edit-sp"
                label="Story Points"
                type="number"
                min="0"
                required
              />

              <BaseSelect
                v-model="brandForm.status"
                id="task-edit-status"
                label="Статус"
                :options="ANALYTICS_STATUSES"
                required
              />
            </div>

            <footer class="flex justify-end border-t border-neutral-200 p-4">
              <BaseButton
                variant="primary"
                :loading="brandSaving"
                :disabled="groupSaving || Boolean(selectedBrand?.deletedAt)"
                @click="saveBrand"
              >
                Зберегти рядок
              </BaseButton>
            </footer>
          </section>
        </div>

        <footer class="mt-6 flex justify-end border-t border-neutral-200 pt-5">
          <BaseButton @click="isOpen = false">Закрити</BaseButton>
        </footer>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

  import { useStore } from 'vuex'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'

  import DetailRow from '@/components/analytics/DetailRow.vue'

  import { ANALYTICS_STATUSES, ANALYTICS_TASK_TYPES } from '@/constants/analytics'

  import { analyticsService } from '@/services/analytics.service'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    taskId: {
      type: Number,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'updated'])

  const store = useStore()

  const task = ref(null)
  const selectedBrandId = ref(null)

  const loading = ref(false)
  const error = ref('')

  const editing = ref(false)
  const editError = ref('')

  const groupSaving = ref(false)
  const brandSaving = ref(false)

  const commentText = ref('')
  const commentSaving = ref(false)
  const commentError = ref('')

  let controller = null

  const groupForm = reactive({
    title: '',
    description: '',
    taskType: '',
    requestedById: '',
    jiraKey: '',
    dueDate: '',
  })

  const brandForm = reactive({
    executorId: '',
    storyPoints: '',
    status: '',
  })

  const isOpen = computed({
    get: () => props.modelValue,

    set: (value) => {
      emit('update:modelValue', value)
    },
  })

  const selectedBrand = computed(() => {
    return task.value?.brands?.find((row) => row.id === selectedBrandId.value) || null
  })
  const canSubmitComment = computed(() => {
    return (
      Boolean(selectedBrand.value) &&
      !selectedBrand.value?.deletedAt &&
      commentText.value.trim().length > 0 &&
      !commentSaving.value
    )
  })

  const taskTypeOptions = computed(() => {
    const options = [...ANALYTICS_TASK_TYPES]

    if (task.value?.taskType && !options.some((option) => option.value === task.value.taskType)) {
      options.push({
        value: task.value.taskType,
        label: task.value.taskType,
      })
    }

    return options
  })

  const requesterOptions = computed(() => {
    const options = store.state.analytics.members.map((member) => ({
      value: member.id,
      label: member.displayName,
    }))

    const requester = task.value?.requestedBy

    if (requester?.id && !options.some((option) => option.value === requester.id)) {
      options.push({
        value: requester.id,
        label: requester.displayName,
      })
    }

    return options
  })

  const executorOptions = computed(() => {
    const options = store.state.analytics.members.map((member) => ({
      value: member.id,
      label: member.displayName,
    }))

    const executor = selectedBrand.value?.executor

    if (executor?.id && !options.some((option) => option.value === executor.id)) {
      options.push({
        value: executor.id,
        label: executor.displayName,
      })
    }

    return options
  })

  const numberFormat = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 2,
  })

  function formatNumber(value) {
    const number = Number(value)

    return Number.isFinite(number) ? numberFormat.format(number) : '—'
  }

  function formatPlatform(value) {
    return value === 'P8' ? '8P' : value || '—'
  }

  function formatBrand(value) {
    if (!value) return '—'

    return value === 'RANDOM' ? 'Random' : value
  }

  function taskTypeLabel(value) {
    return ANALYTICS_TASK_TYPES.find((item) => item.value === value)?.label || value || '—'
  }

  function statusLabel(value) {
    return (
      {
        IN_PROGRESS: 'In Progress',
        DONE: 'Done',
      }[value] ||
      value ||
      '—'
    )
  }

  function statusClasses(status) {
    return status === 'DONE'
      ? 'border-green-700 bg-green-50 text-green-800'
      : 'border-blue-700 bg-blue-50 text-blue-800'
  }

  function formatDate(value) {
    if (!value) return '—'

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

    return match ? `${match[3]}.${match[2]}.${match[1]}` : '—'
  }

  function formatInputDate(value) {
    if (!value) return ''

    return String(value).slice(0, 10)
  }

  function formatDateTime(value) {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat('uk-UA', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  }

  function getErrorMessage(requestError) {
    const response = requestError?.response?.data

    const message = response?.message || response?.error?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    return message || requestError?.message || 'Сталася помилка.'
  }

  function hydrateForms() {
    if (!task.value) return

    groupForm.title = task.value.title || ''

    groupForm.description = task.value.description || ''

    groupForm.taskType = task.value.taskType || ''

    groupForm.requestedById = task.value.requestedById ?? task.value.requestedBy?.id ?? ''

    groupForm.jiraKey = task.value.jiraKey || ''

    groupForm.dueDate = formatInputDate(task.value.dueDate)

    hydrateBrandForm()
  }

  function hydrateBrandForm() {
    const row = selectedBrand.value

    if (!row) return

    brandForm.executorId = row.executorId ?? row.executor?.id ?? ''

    brandForm.storyPoints = row.storyPoints ?? ''

    brandForm.status = row.status || ''
  }

  function selectBrand(id) {
    selectedBrandId.value = id

    commentError.value = ''

    if (editing.value) {
      hydrateBrandForm()
    }
  }

  function startEditing() {
    editError.value = ''
    editing.value = true

    hydrateForms()
  }

  function cancelEditing() {
    editError.value = ''
    editing.value = false

    hydrateForms()
  }

  function cancelRequest() {
    controller?.abort()
    controller = null
  }

  async function loadTask() {
    if (!props.taskId) return

    cancelRequest()

    const currentController = new AbortController()

    controller = currentController

    loading.value = true
    error.value = ''

    try {
      const result = await analyticsService.getTask(props.taskId, currentController.signal)

      task.value = result

      selectedBrandId.value = result.brands?.some((row) => row.id === props.taskId)
        ? props.taskId
        : result.brands?.[0]?.id || null

      hydrateForms()
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      error.value = getErrorMessage(requestError)
    } finally {
      if (controller === currentController) {
        controller = null
        loading.value = false
      }
    }
  }

  async function refreshTask() {
    const result = await analyticsService.getTask(selectedBrandId.value || props.taskId)

    task.value = result

    hydrateForms()

    emit('updated')
  }

  async function submitComment() {
    const body = commentText.value.trim()

    if (!body || !selectedBrand.value) {
      return
    }

    commentError.value = ''
    commentSaving.value = true

    try {
      await analyticsService.addTaskComment(selectedBrand.value.id, body)

      commentText.value = ''

      await refreshTask()
    } catch (requestError) {
      commentError.value = getErrorMessage(requestError)
    } finally {
      commentSaving.value = false
    }
  }

  async function saveGroup() {
    editError.value = ''

    const title = groupForm.title.trim()

    if (!title) {
      editError.value = 'Назва задачі обов’язкова.'

      return
    }

    groupSaving.value = true

    try {
      const payload = {
        title,
        taskType: groupForm.taskType,

        requestedById: Number(groupForm.requestedById),

        jiraKey: groupForm.jiraKey.trim(),
      }

      const description = groupForm.description.trim()

      if (description) {
        payload.description = description
      }

      if (groupForm.dueDate) {
        payload.dueDate = groupForm.dueDate
      }

      task.value = await analyticsService.updateTaskGroup(selectedBrandId.value, payload)

      hydrateForms()

      emit('updated')
    } catch (requestError) {
      editError.value = getErrorMessage(requestError)
    } finally {
      groupSaving.value = false
    }
  }

  async function saveBrand() {
    editError.value = ''

    if (!selectedBrand.value) {
      return
    }

    const storyPoints = Number(brandForm.storyPoints)

    if (!Number.isFinite(storyPoints) || storyPoints < 0) {
      editError.value = 'Story Points мають бути числом 0 або більше.'

      return
    }

    if (!brandForm.executorId) {
      editError.value = 'Оберіть виконавця.'

      return
    }

    brandSaving.value = true

    try {
      await analyticsService.updateTaskBrand(selectedBrand.value.id, {
        executorId: Number(brandForm.executorId),

        storyPoints,

        status: brandForm.status,
      })

      await refreshTask()
    } catch (requestError) {
      editError.value = getErrorMessage(requestError)
    } finally {
      brandSaving.value = false
    }
  }

  watch(
    [() => props.modelValue, () => props.taskId],

    ([open, taskId]) => {
      if (open && taskId) {
        editing.value = false

        loadTask()

        return
      }

      cancelRequest()

      task.value = null
      selectedBrandId.value = null

      editing.value = false

      error.value = ''
      editError.value = ''

      commentText.value = ''
      commentError.value = ''
      commentSaving.value = false

      loading.value = false
    },

    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    cancelRequest()
  })
</script>
