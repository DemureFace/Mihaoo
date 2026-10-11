<template>
  <section class="min-w-0 space-y-6">
    <DevelopmentModuleNav />

    <header class="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Development</p>
        <h1 class="mt-1 text-2xl font-bold">Templates</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Reuse approved roadmap structures without copying personal work logs or evidence.
        </p>
      </div>
    </header>

    <div
      v-if="!DEVELOPMENT_TEMPLATES_API_READY"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      role="status"
    >
      Templates UI is ready. It will become active after the Templates backend task is integrated and verified.
    </div>

    <div v-if="error" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ error }}</p>
      <BaseButton variant="secondary" @click="load">Try again</BaseButton>
    </div>

    <p v-else-if="pending" role="status" class="text-sm text-neutral-600">Loading templates...</p>

    <template v-else-if="templates">
      <div
        v-if="!templates.items.length"
        class="rounded-xl border border-dashed border-black/20 bg-white p-8 text-center"
      >
        <h2 class="font-semibold">No templates yet</h2>
        <p class="mt-2 text-sm text-neutral-600">
          Open a roadmap you own and choose Save as template.
        </p>
      </div>

      <div v-else class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <article
          v-for="template in templates.items"
          :key="template.id"
          class="flex min-w-0 flex-col rounded-xl border border-black/10 bg-white p-5"
        >
          <p class="text-xs font-semibold text-neutral-500">Template v{{ template.version }}</p>
          <h2 class="mt-2 break-words text-lg font-bold">{{ template.title }}</h2>
          <p class="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
            {{ template.description || 'No description.' }}
          </p>
          <div class="mt-auto pt-5">
            <BaseButton variant="primary" class="w-full" @click="openInstantiate(template)">
              Create roadmap
            </BaseButton>
          </div>
        </article>
      </div>
    </template>

    <DevelopmentTemplateModal
      v-if="selectedTemplate"
      v-model="modalOpen"
      mode="instantiate"
      :template="selectedTemplate"
      @created="created"
    />
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import DevelopmentModuleNav from '@/components/development/DevelopmentModuleNav.vue'
  import DevelopmentTemplateModal from '@/components/development/DevelopmentTemplateModal.vue'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'
  import {
    DEVELOPMENT_TEMPLATES_API_READY,
    developmentTemplateApi,
  } from '@/services/development.service.js'

  defineOptions({ name: 'DevelopmentTemplatesView' })

  const router = useRouter()
  const modalOpen = ref(false)
  const selectedTemplate = ref(null)
  const { data: templates, pending, error, run, clear } = useDevelopmentRequest()

  async function load() {
    if (!DEVELOPMENT_TEMPLATES_API_READY) return
    await run((signal) => developmentTemplateApi.list({ signal }))
  }

  function openInstantiate(template) {
    selectedTemplate.value = template
    modalOpen.value = true
  }

  function created(roadmap) {
    void router.push({ name: 'development-workspace', params: { id: roadmap.id } })
  }

  useDevelopmentLifecycle(load, () => {
    modalOpen.value = false
    selectedTemplate.value = null
    clear()
  })
</script>
