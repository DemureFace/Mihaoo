<template>
  <div class="flex items-center gap-2 flex-wrap bg-white border border-black/10 rounded-2xl p-2">
    <button
      type="button"
      :disabled="!canUndo"
      class="tool-button"
      title="Undo"
      @click="$emit('undo')"
    >
      <ArrowUturnLeftIcon class="w-5 h-5" />
    </button>

    <button
      type="button"
      :disabled="!canRedo"
      class="tool-button"
      title="Redo"
      @click="$emit('redo')"
    >
      <ArrowUturnRightIcon class="w-5 h-5" />
    </button>

    <div class="w-px h-7 bg-black/10 mx-1" />

    <button type="button" class="tool-button" title="Fit view" @click="$emit('fit-view')">
      <ArrowsPointingInIcon class="w-5 h-5" />
    </button>

    <button
      type="button"
      :disabled="!canDuplicate"
      class="tool-button"
      title="Duplicate node"
      @click="$emit('duplicate-selection')"
    >
      <Square2StackIcon class="w-5 h-5" />
    </button>

    <button
      type="button"
      :disabled="!canDelete"
      class="tool-button text-red-600"
      title="Delete selected"
      @click="$emit('delete-selection')"
    >
      <TrashIcon class="w-5 h-5" />
    </button>

    <div class="w-px h-7 bg-black/10 mx-1" />

    <button type="button" class="tool-button" title="Import JSON" @click="fileInput?.click()">
      <ArrowUpTrayIcon class="w-5 h-5" />
    </button>

    <button type="button" class="tool-button" title="Export JSON" @click="$emit('export-json')">
      <ArrowDownTrayIcon class="w-5 h-5" />
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="
        application/json,.json
      "
      class="hidden"
      @change="handleFile"
    />

    <div class="ml-auto flex items-center gap-2">
      <button type="button" class="secondary-button" @click="$emit('duplicate-map')">
        Duplicate Map
      </button>

      <button type="button" class="secondary-button" @click="$emit('settings')">
        <Cog6ToothIcon class="w-4 h-4" />

        Settings
      </button>

      <BaseButton class="px-4 py-2" @click="$emit('save')">Save</BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    ArrowsPointingInIcon,
    Square2StackIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    Cog6ToothIcon,
  } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'

  defineProps({
    canUndo: {
      type: Boolean,
      default: false,
    },

    canRedo: {
      type: Boolean,
      default: false,
    },

    canDuplicate: {
      type: Boolean,
      default: false,
    },

    canDelete: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'undo',
    'redo',
    'fit-view',

    'duplicate-selection',
    'delete-selection',

    'import-json',
    'export-json',

    'duplicate-map',

    'settings',

    'save',
  ])

  const fileInput = ref(null)

  function handleFile(event) {
    const file = event.target.files?.[0]

    if (!file) return

    emit('import-json', file)

    event.target.value = ''
  }
</script>

<style scoped>
  .tool-button {
    display: inline-grid;
    place-items: center;

    width: 2.4rem;
    height: 2.4rem;

    border: 1px solid rgb(0 0 0 / 0.1);

    border-radius: 0.75rem;

    transition: all 0.2s ease;
  }

  .tool-button:hover:not(:disabled) {
    background: rgb(0 0 0 / 0.05);
  }

  .tool-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .secondary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;

    border: 1px solid rgb(0 0 0 / 0.1);

    border-radius: 0.75rem;

    padding: 0.55rem 0.8rem;

    font-size: 0.875rem;

    font-weight: 600;
  }

  .secondary-button:hover {
    background: rgb(0 0 0 / 0.04);
  }
</style>
