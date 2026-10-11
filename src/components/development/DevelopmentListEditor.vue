<template>
  <div class="space-y-3">
    <div
      v-for="(item, index) in normalizedItems"
      :key="item.id"
      class="space-y-3 rounded-xl border border-black/10 bg-white p-3"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-semibold text-neutral-500">Item {{ index + 1 }}</span>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="ghost"
            size="sm"
            :disabled="disabled || index === 0"
            aria-label="Move item up"
            @click="move(index, index - 1)"
          >
            Up
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            :disabled="disabled || index === normalizedItems.length - 1"
            aria-label="Move item down"
            @click="move(index, index + 1)"
          >
            Down
          </BaseButton>
          <BaseButton
            variant="danger"
            size="sm"
            :disabled="disabled"
            aria-label="Remove item"
            @click="remove(index)"
          >
            Remove
          </BaseButton>
        </div>
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <template v-for="field in fields" :key="field.key">
          <BaseTextarea
            v-if="field.type === 'textarea'"
            :id="fieldId(item.id, field.key)"
            :model-value="stringValue(item[field.key])"
            :label="field.label"
            :rows="3"
            :disabled="disabled"
            @update:model-value="updateField(index, field.key, $event)"
          />

          <BaseSelect
            v-else-if="field.type === 'select'"
            :id="fieldId(item.id, field.key)"
            :model-value="item[field.key] ?? ''"
            :label="field.label"
            :options="field.options || []"
            :disabled="disabled"
            @update:model-value="updateField(index, field.key, $event)"
          />

          <BaseCheckbox
            v-else-if="field.type === 'checkbox'"
            :id="fieldId(item.id, field.key)"
            :model-value="Boolean(item[field.key])"
            :label="field.label"
            :disabled="disabled"
            @update:model-value="updateField(index, field.key, $event)"
          />

          <BaseInput
            v-else
            :id="fieldId(item.id, field.key)"
            :model-value="item[field.key] ?? ''"
            :label="field.label"
            :type="field.type || 'text'"
            :disabled="disabled"
            @update:model-value="updateField(index, field.key, $event)"
          />
        </template>
      </div>
    </div>

    <BaseButton variant="secondary" :disabled="disabled" @click="add">
      {{ addLabel }}
    </BaseButton>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import { structuredCloneSafe } from '@/modules/development/development.blocks.js'

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      default: () => [],
    },
    addLabel: {
      type: String,
      default: 'Add item',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const normalizedItems = computed(() =>
    props.modelValue.map((item, index) => ({
      id: item?.id || `tmp_${index}`,
      ...item,
    })),
  )

  function stringValue(value) {
    return value == null ? '' : String(value)
  }

  function fieldId(itemId, key) {
    return `development-list-${String(itemId).replace(/[^A-Za-z0-9_-]/g, '_')}-${key}`
  }

  function emitItems(items) {
    emit('update:modelValue', items.map((item) => ({ ...item })))
  }

  function add() {
    if (props.disabled) return

    const item = {
      id: `tmp_${crypto.randomUUID().replaceAll('-', '_')}`,
    }

    props.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        item[field.key] = false
      } else if (field.type === 'select') {
        item[field.key] = field.options?.[0]?.value ?? ''
      } else {
        item[field.key] = ''
      }
    })

    emitItems([...structuredCloneSafe(props.modelValue), item])
  }

  function remove(index) {
    if (props.disabled) return
    const next = structuredCloneSafe(props.modelValue)
    next.splice(index, 1)
    emitItems(next)
  }

  function move(fromIndex, toIndex) {
    if (props.disabled || fromIndex === toIndex) return
    const next = structuredCloneSafe(props.modelValue)
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= next.length || toIndex >= next.length) return
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    emitItems(next)
  }

  function updateField(index, key, value) {
    if (props.disabled) return
    const next = structuredCloneSafe(props.modelValue)
    next[index] = {
      ...next[index],
      [key]: value,
    }
    emitItems(next)
  }
</script>
