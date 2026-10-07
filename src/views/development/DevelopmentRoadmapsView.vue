<template>
  <section class="min-w-0 space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Development</p>
        <h1 class="mt-1 text-2xl font-bold">Roadmaps</h1>
        <p class="mt-2 text-sm text-neutral-600">Your private roadmaps and the workspaces explicitly shared with you.</p>
      </div>
      <BaseButton variant="primary" :disabled="!DEVELOPMENT_API_READY || pending" @click="createOpen = true">Create roadmap</BaseButton>
    </header>

    <div v-if="!DEVELOPMENT_API_READY" class="rounded-xl border border-amber-200 bg-amber-50 p-4" role="status">
      <h2 class="font-semibold">Development API is not connected yet</h2>
      <p class="mt-2 text-sm leading-6">This module requires a database and server-side access checks. Creating and sharing are disabled until the backend is verified. No roadmaps are stored in this browser.</p>
    </div>

    <form class="grid min-w-0 grid-cols-1 items-end gap-3 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)_auto]" @submit.prevent="applyFilters">
      <BaseInput id="development-search" v-model="search" label="Search accessible roadmaps" maxlength="160" :disabled="!DEVELOPMENT_API_READY" />
      <BaseSelect id="development-scope" v-model="scope" label="Show" :options="scopeOptions" :disabled="!DEVELOPMENT_API_READY" />
      <BaseButton type="submit" variant="secondary" :loading="pending" :disabled="!DEVELOPMENT_API_READY || pending">Apply filters</BaseButton>
    </form>

    <div v-if="error" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ error }}</p>
      <BaseButton variant="secondary" @click="refresh">Try again</BaseButton>
    </div>
    <p v-else-if="pending" role="status" class="text-sm text-neutral-600">Loading accessible roadmaps...</p>
    <template v-else-if="result">
      <div v-if="!result.items.length" class="rounded-xl border border-dashed border-black/20 bg-white p-8 text-center">
        <h2 class="font-semibold">No accessible roadmaps found</h2>
        <p class="mt-2 text-sm text-neutral-600">Create a roadmap, adjust the filters, or ask its owner to share it with your account.</p>
      </div>
      <div v-else class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <article v-for="roadmap in result.items" :key="roadmap.id" class="flex min-w-0 flex-col rounded-xl border border-black/10 bg-white p-5">
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <span>Private</span><span aria-hidden="true">/</span><span>{{ roadmap.myRole }}</span>
          </div>
          <h2 class="mt-3 break-words text-lg font-bold [overflow-wrap:anywhere]">{{ roadmap.title }}</h2>
          <p v-if="roadmap.description" class="mt-2 whitespace-pre-wrap break-words text-sm text-neutral-600 [overflow-wrap:anywhere]">{{ roadmap.description }}</p>
          <p class="mt-4 text-xs text-neutral-500">{{ roadmap.startDate || 'No start date' }} - {{ roadmap.endDate || 'No end date' }}</p>
          <p class="mt-2 text-xs font-semibold">{{ roadmap.status }}</p>
          <div class="mt-auto pt-5">
            <BaseButton variant="secondary" class="w-full" @click="openRoadmap(roadmap.id)">Open workspace</BaseButton>
          </div>
        </article>
      </div>
      <nav v-if="result.total > result.pageSize" aria-label="Roadmap pages" class="flex flex-wrap items-center justify-between gap-3">
        <BaseButton variant="secondary" :disabled="page <= 1 || pending" @click="changePage(-1)">Previous</BaseButton>
        <span class="text-sm">Page {{ page }} of {{ Math.ceil(result.total / result.pageSize) }}</span>
        <BaseButton variant="secondary" :disabled="page * result.pageSize >= result.total || pending" @click="changePage(1)">Next</BaseButton>
      </nav>
    </template>

    <DevelopmentCreateModal v-if="createOpen" v-model="createOpen" @created="created" />
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import DevelopmentCreateModal from '@/components/development/DevelopmentCreateModal.vue'
  import { DEVELOPMENT_API_READY, developmentApi } from '@/services/development.service.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'

  defineOptions({ name: 'DevelopmentRoadmapsView' })
  const router = useRouter()
  const createOpen = ref(false)
  const search = ref('')
  const scope = ref('all')
  const page = ref(1)
  const scopeOptions = [
    { value: 'all', label: 'All accessible roadmaps' },
    { value: 'owned', label: 'Created by me' },
    { value: 'shared', label: 'Shared with me' },
  ]
  const { data: result, pending, error, run, clear } = useDevelopmentRequest()
  async function refresh() {
    if (!DEVELOPMENT_API_READY || createOpen.value) return
    await run((signal) => developmentApi.list({ search: search.value, scope: scope.value, page: page.value, signal }))
  }
  function applyFilters() { page.value = 1; void refresh() }
  function changePage(offset) { page.value = Math.max(1, page.value + offset); void refresh() }
  function openRoadmap(id) { void router.push({ name: 'development-workspace', params: { id } }) }
  function created(roadmap) { createOpen.value = false; openRoadmap(roadmap.id) }
  useDevelopmentLifecycle(refresh, () => {
    createOpen.value = false
    search.value = ''
    scope.value = 'all'
    page.value = 1
    clear()
  })
</script>
