<template>
  <section class="min-w-0 space-y-5">
    <DevelopmentModuleNav />

    <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Development / Builder</p>
        <h1 class="mt-1 break-words text-2xl font-bold">{{ draft?.title || 'Roadmap builder' }}</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Build pages from reusable blocks. Changes are saved only through the Development backend.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" @click="router.push({ name: 'development-workspace', params: { id: roadmapId } })">
          Preview
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="savePending"
          :disabled="!canMutate || !dirty || savePending"
          @click="save"
        >
          Save changes
        </BaseButton>
      </div>
    </div>

    <div v-if="!DEVELOPMENT_API_READY" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Development API is not connected, so this roadmap cannot be loaded.
    </div>

    <div
      v-else-if="!DEVELOPMENT_BUILDER_API_READY"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      Builder UI is ready, but mutations stay disabled until the Builder backend task is integrated and verified.
    </div>

    <div v-if="loadError" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ loadError }}</p>
      <BaseButton variant="secondary" @click="load">Try again</BaseButton>
    </div>

    <p v-else-if="loadPending" role="status" class="text-sm text-neutral-600">
      Loading roadmap builder...
    </p>

    <template v-else-if="draft">
      <div class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-3">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</span>
          <span class="text-sm font-semibold">{{ dirty ? 'Unsaved changes' : 'Saved' }}</span>
          <span aria-hidden="true" class="text-neutral-300">/</span>
          <span class="text-xs text-neutral-500">Version {{ draft.version }}</span>
        </div>
        <p class="text-xs text-neutral-500">
          Role: {{ draft.myRole }}
        </p>
      </div>

      <div v-if="saveError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
        {{ saveError }}
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_22rem]">
        <div class="min-w-0 rounded-xl border border-black/10 bg-neutral-50 p-4 xl:sticky xl:top-20 xl:self-start">
          <DevelopmentBlockLibrary :disabled="!canMutate || !selectedSection" @add="addBlock" />
        </div>

        <main class="min-w-0 space-y-4">
          <section class="space-y-3 rounded-xl border border-black/10 bg-white p-4">
            <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold">Pages</h2>
                <p class="mt-1 text-xs text-neutral-500">Each roadmap can contain multiple pages.</p>
              </div>
              <BaseButton variant="secondary" size="sm" :disabled="!canMutate" @click="addPage">
                Add page
              </BaseButton>
            </div>

            <div class="flex min-w-0 flex-wrap gap-2">
              <BaseButton
                v-for="page in draft.pages"
                :key="page.id"
                :variant="selectedPage?.id === page.id ? 'primary' : 'secondary'"
                :aria-current="selectedPage?.id === page.id ? 'page' : undefined"
                @click="selectPage(page.id)"
              >
                {{ page.title }}
              </BaseButton>
            </div>

            <div v-if="selectedPage" class="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <BaseInput
                :id="`development-page-title-${selectedPage.id}`"
                :model-value="selectedPage.title"
                label="Page title"
                :disabled="!canMutate"
                maxlength="160"
                @update:model-value="updatePageTitle"
              />

              <div class="flex flex-wrap items-end gap-2">
                <BaseButton variant="ghost" size="sm" :disabled="!canMutate || pageIndex === 0" @click="movePage(-1)">
                  Move left
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  :disabled="!canMutate || pageIndex === draft.pages.length - 1"
                  @click="movePage(1)"
                >
                  Move right
                </BaseButton>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :disabled="!canMutate || draft.pages.length <= 1"
                  @click="confirmPageDelete = true"
                >
                  Delete page
                </BaseButton>
              </div>
            </div>

            <div v-if="confirmPageDelete" class="rounded-lg border border-red-200 bg-red-50 p-3">
              <p class="text-sm text-red-900">Delete this page and all blocks inside it from the current draft?</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <BaseButton variant="danger" size="sm" @click="removePage">Delete page</BaseButton>
                <BaseButton variant="secondary" size="sm" @click="confirmPageDelete = false">Cancel</BaseButton>
              </div>
            </div>
          </section>

          <section v-if="selectedPage" class="space-y-4 rounded-xl border border-black/10 bg-white p-4">
            <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold">Sections</h2>
                <p class="mt-1 text-xs text-neutral-500">Blocks are added to the active section.</p>
              </div>
              <BaseButton variant="secondary" size="sm" :disabled="!canMutate" @click="addSection">
                Add section
              </BaseButton>
            </div>

            <div class="flex min-w-0 flex-wrap gap-2">
              <BaseButton
                v-for="section in selectedPage.sections"
                :key="section.id"
                :variant="selectedSection?.id === section.id ? 'primary' : 'secondary'"
                @click="selectSection(section.id)"
              >
                {{ section.title }}
              </BaseButton>
            </div>

            <div v-if="selectedSection" class="space-y-3">
              <div class="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <BaseInput
                  :id="`development-section-title-${selectedSection.id}`"
                  :model-value="selectedSection.title"
                  label="Section title"
                  :disabled="!canMutate"
                  maxlength="160"
                  @update:model-value="updateSectionTitle"
                />

                <div class="flex flex-wrap items-end gap-2">
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :disabled="!canMutate || sectionIndex === 0"
                    @click="moveSection(-1)"
                  >
                    Move up
                  </BaseButton>
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :disabled="!canMutate || sectionIndex === selectedPage.sections.length - 1"
                    @click="moveSection(1)"
                  >
                    Move down
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    size="sm"
                    :disabled="!canMutate || selectedPage.sections.length <= 1"
                    @click="confirmSectionDelete = true"
                  >
                    Delete section
                  </BaseButton>
                </div>
              </div>

              <div v-if="confirmSectionDelete" class="rounded-lg border border-red-200 bg-red-50 p-3">
                <p class="text-sm text-red-900">Delete this section and all blocks inside it from the current draft?</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <BaseButton variant="danger" size="sm" @click="removeSection">Delete section</BaseButton>
                  <BaseButton variant="secondary" size="sm" @click="confirmSectionDelete = false">Cancel</BaseButton>
                </div>
              </div>

              <div
                v-if="!selectedSection.blocks.length"
                class="rounded-xl border border-dashed border-black/20 bg-neutral-50 p-8 text-center"
              >
                <h3 class="font-semibold">No blocks in this section</h3>
                <p class="mt-2 text-sm text-neutral-600">Choose a block from the library to start building.</p>
              </div>

              <div v-else class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-12">
                <DevelopmentBuilderBlock
                  v-for="(block, index) in selectedSection.blocks"
                  :key="block.id"
                  :block="block"
                  :selected="selectedBlock?.id === block.id"
                  :disabled="!canMutate"
                  :first="index === 0"
                  :last="index === selectedSection.blocks.length - 1"
                  :class="spanClass(block.layout?.span)"
                  @select="selectBlock(block.id)"
                  @move-up="moveBlock(block.id, -1)"
                  @move-down="moveBlock(block.id, 1)"
                  @duplicate="duplicateBlock(block.id)"
                  @delete="deleteBlock(block.id)"
                />
              </div>
            </div>
          </section>
        </main>

        <div class="min-w-0 rounded-xl border border-black/10 bg-neutral-50 p-4 xl:sticky xl:top-20 xl:self-start">
          <DevelopmentBlockProperties
            :block="selectedBlock"
            :disabled="!canMutate"
            @update="updateBlock"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import DevelopmentModuleNav from '@/components/development/DevelopmentModuleNav.vue'
  import DevelopmentBlockLibrary from '@/components/development/DevelopmentBlockLibrary.vue'
  import DevelopmentBuilderBlock from '@/components/development/DevelopmentBuilderBlock.vue'
  import DevelopmentBlockProperties from '@/components/development/DevelopmentBlockProperties.vue'
  import { useDevelopmentBuilder } from '@/composables/useDevelopmentBuilder.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import {
    DEVELOPMENT_API_READY,
    DEVELOPMENT_BUILDER_API_READY,
    developmentApi,
    developmentBuilderApi,
  } from '@/services/development.service.js'

  defineOptions({ name: 'DevelopmentBuilderView' })

  const route = useRoute()
  const router = useRouter()
  const roadmapId = typeof route.params.id === 'string' ? route.params.id : ''

  const loadRequest = useDevelopmentRequest()
  const saveRequest = useDevelopmentRequest()
  const confirmPageDelete = ref(false)
  const confirmSectionDelete = ref(false)

  const {
    draft,
    dirty,
    selectedPage,
    selectedSection,
    selectedBlock,
    load: loadDraft,
    clear: clearDraft,
    markSaved,
    selectPage,
    selectSection,
    selectBlock,
    addPage,
    updatePageTitle,
    deletePage,
    movePage,
    addSection,
    updateSectionTitle,
    deleteSection,
    moveSection,
    addBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
  } = useDevelopmentBuilder()

  const loadPending = loadRequest.pending
  const loadError = loadRequest.error
  const savePending = saveRequest.pending
  const saveError = saveRequest.error

  const canMutate = computed(
    () =>
      DEVELOPMENT_BUILDER_API_READY &&
      Boolean(draft.value?.capabilities?.canEditStructure),
  )

  const pageIndex = computed(() =>
    Math.max(0, draft.value?.pages?.findIndex((page) => page.id === selectedPage.value?.id) ?? 0),
  )

  const sectionIndex = computed(() =>
    Math.max(
      0,
      selectedPage.value?.sections?.findIndex(
        (section) => section.id === selectedSection.value?.id,
      ) ?? 0,
    ),
  )

  function spanClass(span) {
    return {
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      6: 'md:col-span-6',
      8: 'md:col-span-8',
      12: 'md:col-span-12',
    }[span || 12]
  }

  async function load() {
    if (!DEVELOPMENT_API_READY) return
    const result = await loadRequest.run((signal) => developmentApi.get(roadmapId, { signal }))
    if (result) loadDraft(result)
  }

  async function save() {
    if (!canMutate.value || !dirty.value || !draft.value) return

    const result = await saveRequest.run((signal) =>
      developmentBuilderApi.saveSnapshot(
        roadmapId,
        {
          expectedVersion: draft.value.version,
          pages: draft.value.pages,
        },
        { signal },
      ),
    )

    if (result) markSaved(result)
  }

  function removePage() {
    confirmPageDelete.value = false
    deletePage()
  }

  function removeSection() {
    confirmSectionDelete.value = false
    deleteSection()
  }

  useDevelopmentLifecycle(load, () => {
    confirmPageDelete.value = false
    confirmSectionDelete.value = false
    loadRequest.clear()
    saveRequest.clear()
    clearDraft()
  })
</script>
