<template>
  <article class="min-w-0 rounded-xl border border-black/10 bg-white p-4">
    <h4 class="break-words font-semibold [overflow-wrap:anywhere]">{{ block.title }}</h4>
    <p v-if="text !== null" class="mt-3 whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{{ text }}</p>
    <ul v-else-if="checklist" class="mt-3 space-y-2 pl-5 text-sm">
      <li v-for="item in checklist" :key="item.id" class="break-words [overflow-wrap:anywhere]">
        <span class="font-semibold">{{ item.done ? 'Done:' : 'To do:' }}</span> {{ item.text }}
      </li>
    </ul>
    <div v-else-if="table" class="mt-3 max-w-full overflow-x-auto rounded-lg border border-black/10"
      role="region" :aria-label="`${block.title} table`" tabindex="0">
      <table class="w-full min-w-[32rem] text-left text-sm">
        <thead><tr><th v-for="column in table.columns" :key="column.id" class="border-b border-black/10 bg-neutral-50 p-3">{{ column.label }}</th></tr></thead>
        <tbody><tr v-for="row in table.rows" :key="row.id"><td v-for="column in table.columns" :key="column.id"
          class="max-w-md whitespace-pre-wrap break-words border-b border-black/5 p-3 align-top [overflow-wrap:anywhere]">{{ row.cells[column.id] ?? '' }}</td></tr></tbody>
      </table>
    </div>
    <p v-else class="mt-3 text-sm text-neutral-500">This block type is preserved on the server. Its interactive renderer is part of the next builder batch.</p>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { isRecord, validId } from '@/modules/development/development.model.js'
  const props = defineProps({ block: { type: Object, required: true } })
  const text = computed(() => props.block.type === 'text' && props.block.schemaVersion === 1 &&
    typeof props.block.data.text === 'string' ? props.block.data.text : null)
  const checklist = computed(() => {
    const items = props.block.data.items
    return props.block.type === 'checklist' && props.block.schemaVersion === 1 && Array.isArray(items) &&
      items.length <= 500 && items.every((item) => isRecord(item) && validId(item.id) && typeof item.text === 'string' && typeof item.done === 'boolean') &&
      new Set(items.map((item) => item.id)).size === items.length ? items : null
  })
  const table = computed(() => {
    const { columns, rows } = props.block.data
    if (props.block.type !== 'table' || props.block.schemaVersion !== 1 || !Array.isArray(columns) || !Array.isArray(rows) ||
      !columns.length || columns.length > 30 || rows.length > 500) return null
    if (!columns.every((column) => isRecord(column) && validId(column.id) && typeof column.label === 'string')) return null
    if (new Set(columns.map((column) => column.id)).size !== columns.length) return null
    if (!rows.every((row) => isRecord(row) && validId(row.id) && isRecord(row.cells) &&
      columns.every((column) => row.cells[column.id] == null || ['string', 'number', 'boolean'].includes(typeof row.cells[column.id])))) return null
    if (new Set(rows.map((row) => row.id)).size !== rows.length) return null
    return { columns, rows }
  })
</script>
