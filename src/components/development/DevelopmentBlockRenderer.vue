<template>
  <article class="min-w-0 rounded-xl border border-black/10 bg-white p-4 [overflow-wrap:anywhere]">
    <template v-if="block.type === 'heading'">
      <h3 class="text-xl font-bold">{{ block.data?.text || block.title }}</h3>
    </template>

    <template v-else>
      <div class="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <h3 class="min-w-0 break-words font-semibold">{{ block.title }}</h3>
        <span class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          {{ definition?.label || block.type }}
        </span>
      </div>

      <p
        v-if="block.type === 'text' || block.type === 'development_goal'"
        class="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700"
      >
        {{ block.data?.text || 'No content yet.' }}
      </p>

      <div v-else-if="block.type === 'profile'" class="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="item in profileItems" :key="item.label" class="rounded-lg bg-neutral-50 p-3">
          <p class="text-xs font-semibold text-neutral-500">{{ item.label }}</p>
          <p class="mt-1 text-sm">{{ item.value || '—' }}</p>
        </div>
      </div>

      <div v-else-if="block.type === 'table'" class="mt-3 max-w-full overflow-x-auto rounded-lg border border-black/10">
        <table class="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.id"
                class="border-b border-black/10 bg-neutral-50 p-3"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="row.id">
              <td
                v-for="column in tableColumns"
                :key="column.id"
                class="max-w-md whitespace-pre-wrap border-b border-black/5 p-3 align-top"
              >
                {{ row.cells?.[column.id] ?? '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <dl v-else-if="fieldItems.length" class="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="item in fieldItems" :key="item.label" class="rounded-lg bg-neutral-50 p-3">
          <dt class="text-xs font-semibold text-neutral-500">{{ item.label }}</dt>
          <dd class="mt-1 whitespace-pre-wrap text-sm text-neutral-800">{{ item.value || '—' }}</dd>
        </div>
      </dl>

      <div v-else-if="listRows.length" class="mt-3 max-w-full overflow-x-auto rounded-lg border border-black/10">
        <table class="w-full min-w-[38rem] text-left text-sm">
          <thead>
            <tr>
              <th
                v-for="field in listFields"
                :key="field.key"
                class="border-b border-black/10 bg-neutral-50 p-3"
              >
                {{ field.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in listRows" :key="row.id">
              <td
                v-for="field in listFields"
                :key="field.key"
                class="max-w-sm whitespace-pre-wrap border-b border-black/5 p-3 align-top"
              >
                {{ displayValue(row[field.key]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="mt-3 text-sm text-neutral-500">No content yet.</p>
    </template>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { getDevelopmentBlockDefinition } from '@/modules/development/development.blocks.js'

  const props = defineProps({
    block: {
      type: Object,
      required: true,
    },
  })

  const definition = computed(() => getDevelopmentBlockDefinition(props.block.type))

  const profileItems = computed(() => [
    { label: 'Employee', value: props.block.data?.employee },
    { label: 'Role', value: props.block.data?.role },
    { label: 'Manager', value: props.block.data?.manager },
    { label: 'Start date', value: props.block.data?.startDate },
    { label: 'End date', value: props.block.data?.endDate },
  ])

  const tableColumns = computed(() =>
    Array.isArray(props.block.data?.columns) ? props.block.data.columns : [],
  )
  const tableRows = computed(() => (Array.isArray(props.block.data?.rows) ? props.block.data.rows : []))

  const fieldItems = computed(() => {
    if (definition.value?.editor?.kind !== 'fields') return []

    return definition.value.editor.fields.map((field) => ({
      label: field.label,
      value: displayValue(props.block.data?.[field.key]),
    }))
  })

  const listFields = computed(() =>
    definition.value?.editor?.kind === 'list' ? definition.value.editor.fields : [],
  )
  const listRows = computed(() => {
    if (definition.value?.editor?.kind !== 'list') return []
    const key = definition.value.editor.key
    return Array.isArray(props.block.data?.[key]) ? props.block.data[key] : []
  })

  function displayValue(value) {
    if (value === true) return 'Yes'
    if (value === false) return 'No'
    if (value == null || value === '') return '—'
    return String(value)
  }
</script>
