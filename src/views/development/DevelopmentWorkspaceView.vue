<template>
  <section class="min-w-0 space-y-5">
    <DevelopmentModuleNav />

    <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <BaseButton variant="secondary" @click="router.push({ name: 'development-roadmaps' })">
        Back to roadmaps
      </BaseButton>

      <div v-if="roadmap" class="flex flex-wrap gap-2">
        <BaseButton
          v-if="roadmap.capabilities.canEditStructure"
          variant="secondary"
          :disabled="!DEVELOPMENT_BUILDER_API_READY"
          @click="router.push({ name: 'development-builder', params: { id: roadmap.id } })"
        >
          Edit in Builder
        </BaseButton>
        <BaseButton
          v-if="roadmap.capabilities.canEditStructure"
          variant="secondary"
          :disabled="!DEVELOPMENT_IMPORT_API_READY"
          @click="openImport"
        >
          Import XLSX
        </BaseButton>
        <BaseButton
          v-if="roadmap.capabilities.canEditStructure"
          variant="secondary"
          :disabled="!DEVELOPMENT_TEMPLATES_API_READY"
          @click="templateOpen = true"
        >
          Save as template
        </BaseButton>
        <BaseButton
          v-if="roadmap.capabilities.canManageAccess"
          variant="primary"
          @click="shareOpen = true"
        >
          Share
        </BaseButton>
      </div>
    </div>

    <div
      v-if="!DEVELOPMENT_API_READY"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4"
      role="status"
    >
      The Development backend is not connected. No private workspace can be loaded or saved yet.
    </div>

    <p v-else-if="pending" role="status" class="text-sm text-neutral-600">
      Checking access and loading workspace...
    </p>

    <div v-else-if="error" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ error }}</p>
      <BaseButton variant="secondary" @click="refresh">Try again</BaseButton>
    </div>

    <template v-else-if="roadmap">
      <header class="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-5">
        <div class="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <p class="text-xs font-semibold text-neutral-500">PRIVATE WORKSPACE / {{ roadmap.myRole }}</p>
          <h1 class="mt-2 break-words text-2xl font-bold">{{ roadmap.title }}</h1>
          <p v-if="roadmap.description" class="mt-3 whitespace-pre-wrap text-sm text-neutral-600">
            {{ roadmap.description }}
          </p>
          <p class="mt-3 text-xs text-neutral-500">
            {{ roadmap.startDate || 'No start date' }} - {{ roadmap.endDate || 'No end date' }} / {{ roadmap.status }}
          </p>
        </div>
      </header>

      <nav v-if="roadmap.pages.length" aria-label="Roadmap pages" class="flex flex-wrap gap-2">
        <BaseButton
          v-for="page in roadmap.pages"
          :key="page.id"
          :variant="selectedPage?.id === page.id ? 'primary' : 'secondary'"
          :aria-current="selectedPage?.id === page.id ? 'page' : undefined"
          @click="selectedPageId = page.id"
        >
          {{ page.title }}
        </BaseButton>
      </nav>

      <div
        v-if="!selectedPage || !selectedPage.sections.length"
        class="rounded-xl border border-dashed border-black/20 bg-white p-8 text-center"
      >
        <h2 class="font-semibold">This roadmap is empty</h2>
        <p class="mt-2 text-sm text-neutral-600">
          Owners and editors can build pages from reusable blocks in the Builder.
        </p>
      </div>

      <section v-for="section in selectedPage?.sections || []" :key="section.id" class="min-w-0 space-y-3">
        <h2 class="break-words text-lg font-semibold [overflow-wrap:anywhere]">{{ section.title }}</h2>
        <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-12">
          <DevelopmentBlockPreview
            v-for="block in section.blocks"
            :key="block.id"
            :block="block"
            :class="spanClass(block.layout.span)"
          />
        </div>
      </section>
    </template>

    <DevelopmentShareModal
      v-if="shareOpen && roadmap?.capabilities.canManageAccess"
      :model-value="shareOpen"
      :roadmap-id="roadmap.id"
      @update:model-value="handleShareOpen"
      @denied="accessDenied"
    />

    <DevelopmentTemplateModal
      v-if="templateOpen && roadmap"
      v-model="templateOpen"
      mode="save"
      :roadmap-id="roadmap.id"
    />
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import DevelopmentModuleNav from '@/components/development/DevelopmentModuleNav.vue'
  import DevelopmentShareModal from '@/components/development/DevelopmentShareModal.vue'
  import DevelopmentTemplateModal from '@/components/development/DevelopmentTemplateModal.vue'
  import DevelopmentBlockPreview from '@/components/development/DevelopmentBlockPreview.vue'
  import {
    DEVELOPMENT_API_READY,
    DEVELOPMENT_BUILDER_API_READY,
    DEVELOPMENT_IMPORT_API_READY,
    DEVELOPMENT_TEMPLATES_API_READY,
    developmentApi,
  } from '@/services/development.service.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'

  defineOptions({ name: 'DevelopmentWorkspaceView' })

  const route = useRoute()
  const router = useRouter()
  const roadmapId = typeof route.params.id === 'string' ? route.params.id : ''
  const shareOpen = ref(false)
  const templateOpen = ref(false)
  const selectedPageId = ref('')
  const { data: roadmap, pending, error, run, clear } = useDevelopmentRequest()

  const selectedPage = computed(
    () =>
      roadmap.value?.pages.find((page) => page.id === selectedPageId.value) ||
      roadmap.value?.pages[0] ||
      null,
  )

  async function refresh() {
    if (
      !DEVELOPMENT_API_READY ||
      shareOpen.value ||
      templateOpen.value ||
      route.name !== 'development-workspace' ||
      route.params.id !== roadmapId
    ) {
      return
    }

    const result = await run((signal) => developmentApi.get(roadmapId, { signal }))
    if (result && !selectedPageId.value) selectedPageId.value = result.pages[0]?.id || ''
  }

  function accessDenied() {
    shareOpen.value = false
    clear()
    void refresh()
  }

  function spanClass(span) {
    return {
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      6: 'md:col-span-6',
      8: 'md:col-span-8',
      12: 'md:col-span-12',
    }[span]
  }

  function handleShareOpen(open) {
    shareOpen.value = open
    if (!open) void refresh()
  }

  function openImport() {
    void router.push({
      name: 'development-imports',
      query: { roadmapId },
    })
  }

  useDevelopmentLifecycle(refresh, () => {
    shareOpen.value = false
    templateOpen.value = false
    selectedPageId.value = ''
    clear()
  })
</script>
