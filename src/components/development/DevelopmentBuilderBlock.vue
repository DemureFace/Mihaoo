<template>
  <div
    class="min-w-0 rounded-xl border-2 bg-white p-2 transition"
    :class="selected ? 'border-black' : 'border-transparent hover:border-black/20'"
  >
    <div class="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-50 p-2">
      <BaseButton
        variant="plain"
        class="min-w-0 flex-1 justify-start text-left"
        :aria-pressed="selected"
        @click="emit('select')"
      >
        <span class="min-w-0 truncate text-xs font-semibold">{{ block.title }}</span>
      </BaseButton>

      <div class="flex flex-wrap gap-1">
        <BaseButton variant="ghost" size="sm" :disabled="disabled || first" @click="emit('move-up')">
          Up
        </BaseButton>
        <BaseButton variant="ghost" size="sm" :disabled="disabled || last" @click="emit('move-down')">
          Down
        </BaseButton>
        <BaseButton variant="ghost" size="sm" :disabled="disabled" @click="emit('duplicate')">
          Duplicate
        </BaseButton>
        <BaseButton variant="danger" size="sm" :disabled="disabled" @click="confirmDelete = true">
          Delete
        </BaseButton>
      </div>
    </div>

    <DevelopmentBlockRenderer :block="block" @click="emit('select')" />

    <div v-if="confirmDelete" class="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <p class="text-sm text-red-900">Delete this block from the current draft?</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <BaseButton variant="danger" size="sm" :disabled="disabled" @click="confirm">
          Delete block
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="confirmDelete = false">
          Cancel
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import DevelopmentBlockRenderer from '@/components/development/DevelopmentBlockRenderer.vue'

  defineProps({
    block: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    first: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
  })

  const emit = defineEmits(['select', 'move-up', 'move-down', 'duplicate', 'delete'])
  const confirmDelete = ref(false)

  function confirm() {
    confirmDelete.value = false
    emit('delete')
  }
</script>
