<template>
  <section class="min-w-0 space-y-5">
    <BaseButton variant="secondary" @click="router.push({ name: 'development-roadmaps' })">Back to roadmaps</BaseButton>
    <div v-if="!DEVELOPMENT_API_READY" class="rounded-xl border border-amber-200 bg-amber-50 p-4" role="status">
      The Development backend is not connected. No private workspace can be loaded or saved yet.
    </div>
    <p v-else-if="pending" role="status" class="text-sm text-neutral-600">Checking access and loading workspace...</p>
    <div v-else-if="error" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ error }}</p>
      <BaseButton variant="secondary" @click="refresh">Try again</BaseButton>
    </div>
    <template v-else-if="roadmap">
      <header class="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-5">
        <div class="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <p class="text-xs font-semibold text-neutral-500">PRIVATE WORKSPACE / {{ roadmap.myRole }}</p>
          <h1 class="mt-2 break-words text-2xl font-bold">{{ roadmap.title }}</h1>
          <p v-if="roadmap.description" class="mt-3 whitespace-pre-wrap text-sm text-neutral-600">{{ roadmap.description }}</p>
          <p class="mt-3 text-xs text-neutral-500">{{ roadmap.startDate || 'No start date' }} - {{ roadmap.endDate || 'No end date' }} / {{ roadmap.status }}</p>
        </div>
        <BaseButton v-if="roadmap.capabilities.canManageAccess" variant="primary" @click="shareOpen = true">Share</BaseButton>
      </header>
      <p class="rounded-lg border border-black/10 bg-white p-3 text-sm text-neutral-600">
        Foundation release: private workspace and sharing. Block editing, templates, and spreadsheet import are the next implementation batches.
      </p>
      <nav v-if="roadmap.pages.length" aria-label="Roadmap pages" class="flex flex-wrap gap-2">
        <BaseButton v-for="page in roadmap.pages" :key="page.id" :variant="selectedPage?.id === page.id ? 'primary' : 'secondary'"
          :aria-current="selectedPage?.id === page.id ? 'page' : undefined" @click="selectedPageId = page.id">{{ page.title }}</BaseButton>
      </nav>
      <div v-if="!selectedPage || !selectedPage.sections.length" class="rounded-xl border border-dashed border-black/20 bg-white p-8 text-center">
        <h2 class="font-semibold">This page has no blocks yet</h2>
        <p class="mt-2 text-sm text-neutral-600">The workspace structure is stored on the server. The builder will add sections and blocks here.</p>
      </div>
      <section v-for="section in selectedPage?.sections || []" :key="section.id" class="min-w-0 space-y-3">
        <h2 class="break-words text-lg font-semibold [overflow-wrap:anywhere]">{{ section.title }}</h2>
        <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-12">
          <DevelopmentBlockPreview v-for="block in section.blocks" :key="block.id" :block="block" :class="spanClass(block.layout.span)" />
        </div>
      </section>
    </template>
    <DevelopmentShareModal v-if="shareOpen && roadmap?.capabilities.canManageAccess" :model-value="shareOpen"
      :roadmap-id="roadmap.id" @update:model-value="handleShareOpen" @denied="accessDenied" />
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import DevelopmentShareModal from '@/components/development/DevelopmentShareModal.vue'
  import DevelopmentBlockPreview from '@/components/development/DevelopmentBlockPreview.vue'
  import { DEVELOPMENT_API_READY, developmentApi } from '@/services/development.service.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'

  defineOptions({ name: 'DevelopmentWorkspaceView' })
  const route = useRoute()
  const router = useRouter()
  const roadmapId = typeof route.params.id === 'string' ? route.params.id : ''
  const shareOpen = ref(false)
  const selectedPageId = ref('')
  const { data: roadmap, pending, error, run, clear } = useDevelopmentRequest()
  const selectedPage = computed(() => roadmap.value?.pages.find((page) => page.id === selectedPageId.value) || roadmap.value?.pages[0] || null)
  async function refresh() {
    if (!DEVELOPMENT_API_READY || shareOpen.value || route.name !== 'development-workspace' || route.params.id !== roadmapId) return
    await run((signal) => developmentApi.get(roadmapId, { signal }))
  }
  function accessDenied() { shareOpen.value = false; clear(); void refresh() }
  function spanClass(span) {
    return { 3: 'md:col-span-3', 4: 'md:col-span-4', 6: 'md:col-span-6', 8: 'md:col-span-8', 12: 'md:col-span-12' }[span]
  }
  function handleShareOpen(open) { shareOpen.value = open; if (!open) void refresh() }
  useDevelopmentLifecycle(refresh, () => { shareOpen.value = false; selectedPageId.value = ''; clear() })
</script>
