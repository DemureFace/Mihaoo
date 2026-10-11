<template>
  <section class="space-y-5">
    <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold">Import preview</h2>
        <p class="mt-2 text-sm text-neutral-600">
          Review detected blocks before confirmation. Nothing is imported until you confirm.
        </p>
      </div>
      <span class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
        {{ includedCount }} / {{ totalCount }} blocks included
      </span>
    </div>

    <div v-if="warnings.length" class="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 class="text-sm font-semibold text-amber-950">Warnings</h3>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
        <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
      </ul>
    </div>

    <div v-for="page in localPages" :key="page.id" class="space-y-4 rounded-xl border border-black/10 bg-white p-4">
      <div>
        <h3 class="font-bold">{{ page.title }}</h3>
        <p v-if="page.sourceSheet" class="mt-1 text-xs text-neutral-500">Source sheet: {{ page.sourceSheet }}</p>
      </div>

      <section v-for="section in page.sections" :key="section.id" class="space-y-3">
        <h4 class="text-sm font-semibold">{{ section.title }}</h4>

        <div class="space-y-3">
          <article
            v-for="block in section.blocks"
            :key="block.id"
            class="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-black/10 p-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(12rem,18rem)]"
          >
            <BaseCheckbox
              :id="`development-import-${block.id}`"
              :model-value="block.include"
              label="Include"
              @update:model-value="updateBlock(block.id, { include: $event })"
            />

            <div class="min-w-0">
              <p class="break-words font-semibold">{{ block.title }}</p>
              <p class="mt-1 text-xs text-neutral-500">
                {{ block.sourceSheet }}{{ block.sourceRange ? ` · ${block.sourceRange}` : '' }}
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                Detected: {{ block.detectedType }}
                <template v-if="block.confidence !== null"> · {{ Math.round(block.confidence * 100) }}% confidence</template>
              </p>
            </div>

            <BaseSelect
              :id="`development-import-type-${block.id}`"
              :model-value="block.targetType"
              label="Create as"
              :options="blockOptions"
              :disabled="!block.include"
              @update:model-value="updateBlock(block.id, { targetType: $event })"
            />
          </article>
        </div>
      </section>
    </div>

    <div class="rounded-xl border border-black/10 bg-white p-4">
      <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <BaseSelect
          id="development-import-mode"
          v-model="mode"
          label="Import mode"
          :options="modeOptions"
        />
        <BaseInput
          v-if="mode === 'new'"
          id="development-import-title"
          v-model="roadmapTitle"
          label="New roadmap title"
          maxlength="160"
          required
        />
      </div>

      <p v-if="mode === 'existing'" class="mt-3 text-sm text-neutral-600">
        The imported pages will be added to the roadmap selected before this import.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <BaseButton variant="primary" :disabled="disabled || !includedCount || !canConfirm" @click="confirm">
          Confirm import
        </BaseButton>
        <BaseButton variant="secondary" :disabled="disabled" @click="emit('cancel')">Cancel</BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import { DEVELOPMENT_BLOCK_DEFINITIONS, structuredCloneSafe } from '@/modules/development/development.blocks.js'

  const props = defineProps({
    pages: { type: Array, default: () => [] },
    warnings: { type: Array, default: () => [] },
    existingRoadmapId: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  })

  const emit = defineEmits(['confirm', 'cancel'])
  const localPages = ref([])
  const mode = ref(props.existingRoadmapId ? 'existing' : 'new')
  const roadmapTitle = ref('Imported roadmap')

  const modeOptions = computed(() => {
    const options = [{ value: 'new', label: 'Create a new roadmap' }]
    if (props.existingRoadmapId) options.push({ value: 'existing', label: 'Add pages to current roadmap' })
    return options
  })

  const blockOptions = DEVELOPMENT_BLOCK_DEFINITIONS.map((block) => ({ value: block.type, label: block.label }))

  const allBlocks = computed(() =>
    localPages.value.flatMap((page) => page.sections.flatMap((section) => section.blocks)),
  )
  const totalCount = computed(() => allBlocks.value.length)
  const includedCount = computed(() => allBlocks.value.filter((block) => block.include).length)
  const canConfirm = computed(() => mode.value === 'existing' || roadmapTitle.value.trim().length > 0)

  watch(
    () => props.pages,
    (pages) => {
      localPages.value = structuredCloneSafe(pages)
    },
    { immediate: true, deep: true },
  )

  function updateBlock(id, partial) {
    for (const page of localPages.value) {
      for (const section of page.sections) {
        const block = section.blocks.find((item) => item.id === id)
        if (block) Object.assign(block, partial)
      }
    }
  }

  function confirm() {
    emit('confirm', {
      mode: mode.value,
      roadmapId: mode.value === 'existing' ? props.existingRoadmapId : null,
      roadmapTitle: mode.value === 'new' ? roadmapTitle.value.trim() : null,
      requestId: crypto.randomUUID(),
      pages: structuredCloneSafe(localPages.value),
    })
  }
</script>
