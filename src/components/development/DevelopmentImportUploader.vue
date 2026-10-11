<template>
  <section class="space-y-4 rounded-xl border border-black/10 bg-white p-5">
    <div>
      <h2 class="text-lg font-bold">Import spreadsheet</h2>
      <p class="mt-2 text-sm leading-6 text-neutral-600">
        Upload an existing .xlsx roadmap. Mihaoo sends it to the backend parser and shows a review step before anything is imported.
      </p>
    </div>

    <label
      class="block min-w-0 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition"
      :class="dragging ? 'border-black bg-neutral-50' : 'border-black/20 bg-white'"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="input"
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        class="sr-only"
        :disabled="disabled"
        @change="onChange"
      />
      <span class="font-semibold">Choose XLSX file</span>
      <span class="mt-2 block text-sm text-neutral-500">or drag it here · up to 20 MB</span>
    </label>

    <div v-if="file" class="rounded-lg bg-neutral-50 p-3 text-sm">
      <p class="font-semibold [overflow-wrap:anywhere]">{{ file.name }}</p>
      <p class="mt-1 text-xs text-neutral-500">{{ formattedSize }}</p>
    </div>

    <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      {{ error }}
    </p>

    <div class="flex flex-wrap gap-2">
      <BaseButton variant="primary" :disabled="disabled || !file" @click="submit">
        Analyze spreadsheet
      </BaseButton>
      <BaseButton v-if="file" variant="secondary" :disabled="disabled" @click="clear">
        Clear
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { DevelopmentError } from '@/modules/development/development.model.js'
  import { validateRoadmapSpreadsheet } from '@/modules/development/development.import.client.js'

  defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['upload'])
  const input = ref(null)
  const file = ref(null)
  const error = ref('')
  const dragging = ref(false)

  const formattedSize = computed(() => {
    if (!file.value) return ''
    const mb = file.value.size / (1024 * 1024)
    return `${mb.toFixed(mb >= 1 ? 1 : 2)} MB`
  })

  function acceptFile(next) {
    error.value = ''
    try {
      file.value = validateRoadmapSpreadsheet(next)
    } catch (cause) {
      file.value = null
      error.value = cause instanceof DevelopmentError ? cause.message : 'Choose a valid XLSX file.'
    }
  }

  function onChange(event) {
    acceptFile(event.target.files?.[0] || null)
  }

  function onDrop(event) {
    dragging.value = false
    acceptFile(event.dataTransfer?.files?.[0] || null)
  }

  function clear() {
    file.value = null
    error.value = ''
    if (input.value) input.value.value = ''
  }

  function submit() {
    if (!file.value) return
    emit('upload', file.value)
  }
</script>
