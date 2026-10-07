<template>
  <aside class="min-w-0 space-y-4">
    <div>
      <h2 class="text-sm font-bold">Block library</h2>
      <p class="mt-1 text-xs leading-5 text-neutral-500">
        Add structured Development blocks to the active section.
      </p>
    </div>

    <div v-for="category in DEVELOPMENT_BLOCK_CATEGORIES" :key="category" class="space-y-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ category }}
      </h3>

      <div class="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <BaseButton
          v-for="block in blocksByCategory(category)"
          :key="block.type"
          variant="secondary"
          class="min-w-0 justify-start text-left"
          :disabled="disabled"
          :title="block.description"
          @click="emit('add', block.type)"
        >
          <span class="min-w-0">
            <span class="block font-semibold">{{ block.label }}</span>
            <span class="mt-0.5 block text-xs font-normal text-neutral-500">
              {{ block.description }}
            </span>
          </span>
        </BaseButton>
      </div>
    </div>
  </aside>
</template>

<script setup>
  import BaseButton from '@/components/base/BaseButton.vue'
  import {
    DEVELOPMENT_BLOCK_CATEGORIES,
    DEVELOPMENT_BLOCK_DEFINITIONS,
  } from '@/modules/development/development.blocks.js'

  defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['add'])

  function blocksByCategory(category) {
    return DEVELOPMENT_BLOCK_DEFINITIONS.filter((block) => block.category === category)
  }
</script>
