<template>
  <aside class="min-w-0 space-y-4">
    <div>
      <h2 class="text-sm font-bold">Properties</h2>
      <p class="mt-1 text-xs leading-5 text-neutral-500">
        Edit the selected block. Changes remain in the current draft until Save.
      </p>
    </div>

    <div v-if="!block" class="rounded-xl border border-dashed border-black/20 bg-white p-4 text-sm text-neutral-500">
      Select a block on the canvas to edit its properties.
    </div>

    <template v-else>
      <BaseInput
        :id="`development-block-title-${block.id}`"
        :model-value="block.title"
        label="Block title"
        :disabled="disabled"
        maxlength="160"
        @update:model-value="patch({ title: $event })"
      />

      <BaseSelect
        :id="`development-block-span-${block.id}`"
        :model-value="block.layout?.span || 12"
        label="Width"
        :options="DEVELOPMENT_BLOCK_SPANS"
        :disabled="disabled"
        @update:model-value="patchLayout(Number($event))"
      />

      <div class="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
        <p class="font-semibold text-black">{{ definition?.label || block.type }}</p>
        <p class="mt-1">{{ definition?.description || 'Unknown block type preserved as read-only data.' }}</p>
      </div>

      <template v-if="definition?.editor?.kind === 'text'">
        <BaseTextarea
          :id="`development-block-text-${block.id}`"
          :model-value="String(block.data?.[definition.editor.key] ?? '')"
          :label="definition.editor.label"
          :rows="definition.editor.rows || 5"
          :disabled="disabled"
          @update:model-value="patchData({ [definition.editor.key]: $event })"
        />
      </template>

      <template v-else-if="definition?.editor?.kind === 'fields'">
        <div class="space-y-3">
          <template v-for="field in definition.editor.fields" :key="field.key">
            <BaseTextarea
              v-if="field.type === 'textarea'"
              :id="fieldId(field.key)"
              :model-value="String(block.data?.[field.key] ?? '')"
              :label="field.label"
              :rows="3"
              :disabled="disabled"
              @update:model-value="patchData({ [field.key]: $event })"
            />
            <BaseSelect
              v-else-if="field.type === 'select'"
              :id="fieldId(field.key)"
              :model-value="block.data?.[field.key] ?? ''"
              :label="field.label"
              :options="field.options || []"
              :disabled="disabled"
              @update:model-value="patchData({ [field.key]: $event })"
            />
            <BaseInput
              v-else
              :id="fieldId(field.key)"
              :model-value="block.data?.[field.key] ?? ''"
              :label="field.label"
              :type="field.type || 'text'"
              :disabled="disabled"
              @update:model-value="patchData({ [field.key]: $event })"
            />
          </template>
        </div>
      </template>

      <DevelopmentListEditor
        v-else-if="definition?.editor?.kind === 'list'"
        :model-value="Array.isArray(block.data?.[definition.editor.key]) ? block.data[definition.editor.key] : []"
        :fields="definition.editor.fields"
        :add-label="definition.editor.addLabel"
        :disabled="disabled"
        @update:model-value="patchData({ [definition.editor.key]: $event })"
      />

      <DevelopmentTableEditor
        v-else-if="definition?.editor?.kind === 'table'"
        :model-value="block.data || {}"
        :disabled="disabled"
        @update:model-value="patch({ data: $event })"
      />

      <p v-else class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        This block type is preserved, but this frontend version does not expose editable fields for it.
      </p>
    </template>
  </aside>
</template>

<script setup>
  import { computed } from 'vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import DevelopmentListEditor from '@/components/development/DevelopmentListEditor.vue'
  import DevelopmentTableEditor from '@/components/development/DevelopmentTableEditor.vue'
  import {
    DEVELOPMENT_BLOCK_SPANS,
    getDevelopmentBlockDefinition,
  } from '@/modules/development/development.blocks.js'

  const props = defineProps({
    block: {
      type: Object,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update'])

  const definition = computed(() => getDevelopmentBlockDefinition(props.block?.type))

  function fieldId(key) {
    return `development-block-${props.block?.id || 'none'}-${key}`
  }

  function patch(partial) {
    if (!props.block || props.disabled) return
    emit('update', { ...partial })
  }

  function patchLayout(span) {
    patch({
      layout: {
        ...(props.block.layout || {}),
        span,
      },
    })
  }

  function patchData(partial) {
    patch({
      data: {
        ...(props.block.data || {}),
        ...partial,
      },
    })
  }
</script>
