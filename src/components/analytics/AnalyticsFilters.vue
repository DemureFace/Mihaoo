<template>
  <section
    class="sticky top-[70px] z-30 mb-[18px] overflow-hidden rounded-[14px] border border-black bg-white"
  >
    <div class="flex items-center gap-2 border-b border-neutral-200 p-4">
      <BaseButton
        v-for="preset in presets"
        :key="preset.value"
        size="sm"
        :variant="activePreset === preset.value ? 'primary' : 'secondary'"
        @click="setPreset(preset.value)"
      >
        {{ preset.label }}
      </BaseButton>

      <BaseButton
        size="sm"
        :variant="!draft.from && !draft.to ? 'primary' : 'secondary'"
        @click="clearPeriod"
      >
        Увесь час
      </BaseButton>

      <div class="ml-auto flex gap-2">
        <BaseButton @click="resetFilters">Скинути</BaseButton>

        <BaseButton variant="primary" :disabled="Boolean(dateError)" @click="applyFilters">
          Застосувати
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <BaseInput
        v-model="draft.search"
        id="analytics-search"
        label="Пошук"
        type="search"
        placeholder="Назва або Jira"
        class="sm:col-span-2"
      />

      <BaseInput
        v-model="draft.from"
        id="analytics-from"
        label="Від"
        type="date"
        :error="dateError"
      />

      <BaseInput v-model="draft.to" id="analytics-to" label="До" type="date" :error="dateError" />

      <BaseSelect
        v-model="draft.executorId"
        id="analytics-executor"
        label="Виконавець"
        placeholder="Усі виконавці"
        :options="memberOptions"
      />

      <BaseSelect
        v-model="draft.brand"
        id="analytics-brand"
        label="Бренд"
        placeholder="Усі бренди"
        :options="brands"
      />

      <BaseSelect
        v-model="draft.platform"
        id="analytics-platform"
        label="Платформа"
        placeholder="Усі платформи"
        :options="platforms"
      />

      <BaseSelect
        v-model="draft.taskType"
        id="analytics-task-type"
        label="Тип задачі"
        placeholder="Усі типи"
        :options="taskTypes"
      />

      <BaseSelect
        v-model="draft.requestedById"
        id="analytics-requester"
        label="Від кого"
        placeholder="Усі"
        :options="memberOptions"
      />

      <BaseSelect
        v-model="draft.status"
        id="analytics-status"
        label="Статус"
        placeholder="Усі статуси"
        :options="statuses"
      />
    </div>
  </section>
</template>

<script setup>
  import { computed, reactive, watch, onMounted } from 'vue'

  import { useStore } from 'vuex'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import {
    ANALYTICS_PLATFORMS,
    ANALYTICS_BRANDS,
    ANALYTICS_TASK_TYPES,
    ANALYTICS_STATUSES,
    createDefaultAnalyticsFilters,
  } from '@/constants/analytics'

  const store = useStore()

  const analytics = computed(() => store.state.analytics)

  const memberOptions = computed(() => {
    return analytics.value.members.map((member) => ({
      value: member.id,
      label: member.displayName,
    }))
  })

  const platforms = ANALYTICS_PLATFORMS

  const brands = ANALYTICS_BRANDS

  const taskTypes = ANALYTICS_TASK_TYPES

  const statuses = ANALYTICS_STATUSES

  const presets = [
    {
      label: 'Тиждень',
      value: 'week',
    },
    {
      label: 'Місяць',
      value: 'month',
    },
    {
      label: 'Квартал',
      value: 'quarter',
    },
  ]

  const draft = reactive({
    ...analytics.value.filters,
  })

  const dateError = computed(() => {
    if (draft.from && draft.to && draft.from > draft.to) {
      return 'Дата «Від» не може бути пізнішою за дату «До».'
    }

    return ''
  })

  function toInputDate(date) {
    const year = date.getFullYear()

    const month = String(date.getMonth() + 1).padStart(2, '0')

    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function getRange(type) {
    const now = new Date()

    let start
    let end

    if (type === 'week') {
      const day = now.getDay()

      const offset = day === 0 ? -6 : 1 - day

      start = new Date(now)

      start.setDate(now.getDate() + offset)

      end = new Date(start)

      end.setDate(start.getDate() + 6)
    }

    if (type === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)

      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    if (type === 'quarter') {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3

      start = new Date(now.getFullYear(), quarterStart, 1)

      end = new Date(now.getFullYear(), quarterStart + 3, 0)
    }

    return {
      from: toInputDate(start),
      to: toInputDate(end),
    }
  }

  const activePreset = computed(() => {
    for (const preset of presets) {
      const range = getRange(preset.value)

      if (draft.from === range.from && draft.to === range.to) {
        return preset.value
      }
    }

    return ''
  })

  function setPreset(type) {
    const range = getRange(type)

    draft.from = range.from

    draft.to = range.to
  }

  function clearPeriod() {
    draft.from = ''

    draft.to = ''
  }

  function applyFilters() {
    if (dateError.value) {
      return
    }

    store.commit('analytics/APPLY_FILTERS', {
      ...draft,
    })
  }

  function resetFilters() {
    const defaults = createDefaultAnalyticsFilters()

    Object.assign(draft, defaults)

    store.commit('analytics/RESET_FILTERS')
  }

  watch(
    () => analytics.value.filters,

    (filters) => {
      Object.assign(draft, filters)
    },

    {
      deep: true,
    },
  )

  onMounted(() => {
    store.dispatch('analytics/loadMembers')
  })

  watch(
    () => store.state.auth.accessToken,

    (token) => {
      if (token) {
        store.dispatch('analytics/loadMembers')
      }
    },
  )
</script>
