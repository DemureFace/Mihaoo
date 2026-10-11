<template>
  <section class="min-w-0 space-y-4 rounded-xl border border-black/10 bg-white p-4">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Mihaoo file</p>
      <h2 class="mt-1 text-lg font-bold">Import a roadmap file</h2>
      <p class="mt-2 text-sm leading-6 text-neutral-600">
        Restore or transfer a roadmap exported from Mihaoo. The imported file creates a new local
        roadmap and never overwrites an existing one.
      </p>
    </div>

    <input
      ref="input"
      type="file"
      accept=".mihaoo-roadmap.json,.mihaoo-roadmap,.json,application/json"
      class="sr-only"
      :disabled="disabled"
      @change="onChange"
    />

    <button
      type="button"
      class="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/20 bg-neutral-50 p-5 text-center transition hover:border-black/40 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      @click="input?.click()"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="font-semibold">Choose Mihaoo roadmap file</span>
      <span class="mt-2 text-sm text-neutral-500">
        .mihaoo-roadmap.json or .json · up to 10 MB
      </span>
      <span v-if="dragging" class="mt-2 text-xs font-semibold">Drop file here</span>
    </button>

    <div v-if="loading" role="status" class="text-sm text-neutral-600">Reading roadmap file...</div>

    <div v-if="parsed" class="space-y-4 rounded-xl border border-black/10 bg-neutral-50 p-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Ready to import</p>
        <h3 class="mt-1 break-words font-bold [overflow-wrap:anywhere]">
          {{ parsed.roadmap.title }}
        </h3>
        <p class="mt-1 break-words text-xs text-neutral-500 [overflow-wrap:anywhere]">
          {{ parsed.fileName }}
        </p>
      </div>

      <dl class="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-lg bg-white p-3">
          <dt class="text-xs font-semibold text-neutral-500">Pages</dt>
          <dd class="mt-1 text-lg font-bold">{{ parsed.summary.pages }}</dd>
        </div>
        <div class="rounded-lg bg-white p-3">
          <dt class="text-xs font-semibold text-neutral-500">Sections</dt>
          <dd class="mt-1 text-lg font-bold">{{ parsed.summary.sections }}</dd>
        </div>
        <div class="rounded-lg bg-white p-3">
          <dt class="text-xs font-semibold text-neutral-500">Blocks</dt>
          <dd class="mt-1 text-lg font-bold">{{ parsed.summary.blocks }}</dd>
        </div>
        <div class="rounded-lg bg-white p-3">
          <dt class="text-xs font-semibold text-neutral-500">Format</dt>
          <dd class="mt-1 text-sm font-bold">v{{ parsed.formatVersion }}</dd>
        </div>
      </dl>

      <BaseInput
        id="development-portable-import-title"
        v-model="title"
        label="Import as"
        maxlength="160"
        :disabled="disabled || loading"
        required
      />

      <p class="text-xs leading-5 text-neutral-500">
        Access permissions and owner information are not carried inside the file. The imported copy
        belongs to the currently signed-in Mihaoo user.
      </p>
    </div>

    <p
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      {{ error }}
    </p>

    <div class="flex flex-wrap gap-2">
      <BaseButton
        v-if="parsed"
        variant="primary"
        :disabled="disabled || loading || !title.trim()"
        @click="confirm"
      >
        Import as new roadmap
      </BaseButton>
      <BaseButton v-if="parsed" variant="secondary" :disabled="disabled || loading" @click="clear">
        Clear
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import { DevelopmentError } from '@/modules/development/development.model.js'
  import { readDevelopmentRoadmapFile } from '@/modules/development/development.portable.js'

  defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['import'])
  const input = ref(null)
  const parsed = ref(null)
  const title = ref('')
  const error = ref('')
  const loading = ref(false)
  const dragging = ref(false)

  async function acceptFile(file) {
    error.value = ''
    parsed.value = null
    title.value = ''

    if (!file) return

    loading.value = true
    try {
      const result = await readDevelopmentRoadmapFile(file)
      parsed.value = result
      title.value = result.roadmap.title
    } catch (cause) {
      error.value =
        cause instanceof DevelopmentError
          ? cause.message
          : 'This roadmap file could not be read.'
    } finally {
      loading.value = false
    }
  }

  function onChange(event) {
    void acceptFile(event.target.files?.[0] || null)
  }

  function onDrop(event) {
    dragging.value = false
    void acceptFile(event.dataTransfer?.files?.[0] || null)
  }

  function clear() {
    parsed.value = null
    title.value = ''
    error.value = ''
    dragging.value = false
    if (input.value) input.value.value = ''
  }

  function confirm() {
    if (!parsed.value || !title.value.trim()) return
    emit('import', {
      payload: parsed.value,
      title: title.value.trim(),
    })
  }
</script>
