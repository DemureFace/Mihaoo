<template>
  <div class="space-y-4">
    <section class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-sm font-semibold">Columns</h3>
        <BaseButton variant="secondary" size="sm" :disabled="disabled" @click="addColumn">
          Add column
        </BaseButton>
      </div>

      <div
        v-for="(column, index) in columns"
        :key="column.id"
        class="flex min-w-0 items-end gap-2"
      >
        <BaseInput
          :id="`development-table-column-${column.id}`"
          :model-value="column.label"
          :label="`Column ${index + 1}`"
          :disabled="disabled"
          @update:model-value="updateColumn(index, $event)"
        />
        <BaseButton
          variant="danger"
          size="sm"
          :disabled="disabled || columns.length <= 1"
          @click="removeColumn(index)"
        >
          Remove
        </BaseButton>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-sm font-semibold">Rows</h3>
        <BaseButton variant="secondary" size="sm" :disabled="disabled" @click="addRow">
          Add row
        </BaseButton>
      </div>

      <div
        v-for="(row, rowIndex) in rows"
        :key="row.id"
        class="space-y-3 rounded-xl border border-black/10 p-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-semibold text-neutral-500">Row {{ rowIndex + 1 }}</span>
          <BaseButton variant="danger" size="sm" :disabled="disabled" @click="removeRow(rowIndex)">
            Remove row
          </BaseButton>
        </div>

        <div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <BaseInput
            v-for="column in columns"
            :id="`development-table-${row.id}-${column.id}`"
            :key="column.id"
            :model-value="row.cells?.[column.id] ?? ''"
            :label="column.label"
            :disabled="disabled"
            @update:model-value="updateCell(rowIndex, column.id, $event)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import { structuredCloneSafe } from '@/modules/development/development.blocks.js'

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({ columns: [], rows: [] }),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const columns = computed(() =>
    Array.isArray(props.modelValue?.columns) && props.modelValue.columns.length
      ? props.modelValue.columns
      : [{ id: 'column_1', label: 'Column 1' }],
  )

  const rows = computed(() => (Array.isArray(props.modelValue?.rows) ? props.modelValue.rows : []))

  function emitValue(next) {
    emit('update:modelValue', next)
  }

  function addColumn() {
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    const id = `column_${crypto.randomUUID().replaceAll('-', '_')}`
    next.columns.push({ id, label: `Column ${next.columns.length + 1}` })
    next.rows = next.rows.map((row) => ({
      ...row,
      cells: { ...(row.cells || {}), [id]: '' },
    }))
    emitValue(next)
  }

  function updateColumn(index, label) {
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    next.columns[index] = { ...next.columns[index], label }
    emitValue(next)
  }

  function removeColumn(index) {
    if (columns.value.length <= 1) return
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    const [removed] = next.columns.splice(index, 1)
    next.rows.forEach((row) => {
      if (row.cells) delete row.cells[removed.id]
    })
    emitValue(next)
  }

  function addRow() {
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    const id = `row_${crypto.randomUUID().replaceAll('-', '_')}`
    next.rows.push({
      id,
      cells: Object.fromEntries(next.columns.map((column) => [column.id, ''])),
    })
    emitValue(next)
  }

  function removeRow(index) {
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    next.rows.splice(index, 1)
    emitValue(next)
  }

  function updateCell(rowIndex, columnId, value) {
    const next = structuredCloneSafe({ columns: columns.value, rows: rows.value })
    next.rows[rowIndex] = {
      ...next.rows[rowIndex],
      cells: {
        ...(next.rows[rowIndex].cells || {}),
        [columnId]: value,
      },
    }
    emitValue(next)
  }
</script>
