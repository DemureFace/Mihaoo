<template>
  <section class="min-w-0 space-y-6">
    <DevelopmentModuleNav />

    <header class="min-w-0">
      <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Development</p>
      <h1 class="mt-1 text-2xl font-bold">Import roadmaps</h1>
      <p class="mt-2 text-sm text-neutral-600">
        Restore a native Mihaoo roadmap file or convert an existing XLSX roadmap into Mihaoo pages
        and blocks.
      </p>
    </header>

    <div
      v-if="!DEVELOPMENT_IS_LOCAL"
      class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700"
      role="status"
    >
      Native Mihaoo roadmap files can always be downloaded. Importing them directly into the
      server-backed workspace will be enabled separately after the backend flow is verified.
    </div>

    <div
      v-if="!DEVELOPMENT_IMPORT_API_READY"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      role="status"
    >
      Spreadsheet import is not connected in the current storage mode.
    </div>

    <div v-if="error" class="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
      <p class="text-sm text-red-800">{{ error }}</p>
      <BaseButton v-if="jobId" variant="secondary" :disabled="pending" @click="refreshJob">
        Refresh import
      </BaseButton>
    </div>

    <div v-if="!job" class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <DevelopmentRoadmapFileUploader
        :disabled="!DEVELOPMENT_IS_LOCAL || pending"
        @import="importRoadmapFile"
      />

      <div class="min-w-0 space-y-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Spreadsheet</p>
          <h2 class="mt-1 text-lg font-bold">Import XLSX roadmap</h2>
          <p class="mt-2 text-sm leading-6 text-neutral-600">
            Mihaoo analyzes workbook sheets and proposes native Development blocks before anything
            is imported.
          </p>
        </div>

        <DevelopmentImportUploader
          :disabled="!DEVELOPMENT_IMPORT_API_READY || pending"
          @upload="upload"
        />
      </div>
    </div>

    <template v-else>
      <section class="space-y-3 rounded-xl border border-black/10 bg-white p-4">
        <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Import job</p>
            <h2 class="mt-1 break-words text-lg font-bold">{{ job.fileName }}</h2>
            <p class="mt-1 text-sm text-neutral-600">Status: {{ job.status }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              v-if="['UPLOADED', 'PARSING'].includes(job.status)"
              variant="secondary"
              :loading="pending"
              :disabled="pending"
              @click="refreshJob"
            >
              Refresh status
            </BaseButton>
            <BaseButton variant="secondary" :disabled="pending" @click="startOver">
              Start another import
            </BaseButton>
          </div>
        </div>

        <p
          v-if="['UPLOADED', 'PARSING'].includes(job.status)"
          class="text-sm text-neutral-600"
          role="status"
        >
          The current importer is analyzing workbook sheets, ranges and possible block types.
        </p>

        <p
          v-if="job.status === 'FAILED'"
          class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {{ job.error || 'The workbook could not be parsed.' }}
        </p>

        <div
          v-if="job.status === 'IMPORTED'"
          class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
        >
          Import completed successfully.
          <BaseButton
            v-if="job.roadmapId"
            class="mt-3"
            variant="secondary"
            @click="openRoadmap(job.roadmapId)"
          >
            Open roadmap
          </BaseButton>
        </div>
      </section>

      <DevelopmentImportPreview
        v-if="['REVIEW_REQUIRED', 'READY'].includes(job.status)"
        :pages="job.preview.pages"
        :warnings="job.warnings"
        :existing-roadmap-id="existingRoadmapId"
        :disabled="pending"
        @confirm="confirmImport"
        @cancel="startOver"
      />
    </template>
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import DevelopmentModuleNav from '@/components/development/DevelopmentModuleNav.vue'
  import DevelopmentImportUploader from '@/components/development/DevelopmentImportUploader.vue'
  import DevelopmentImportPreview from '@/components/development/DevelopmentImportPreview.vue'
  import DevelopmentRoadmapFileUploader from '@/components/development/DevelopmentRoadmapFileUploader.vue'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'
  import { useDevelopmentLifecycle } from '@/composables/useDevelopmentLifecycle.js'
  import {
    DEVELOPMENT_IMPORT_API_READY,
    DEVELOPMENT_IS_LOCAL,
    developmentApi,
    developmentImportApi,
  } from '@/services/development.service.js'

  defineOptions({ name: 'DevelopmentImportsView' })

  const route = useRoute()
  const router = useRouter()
  const request = useDevelopmentRequest()
  const job = ref(null)
  const jobId = ref(typeof route.params.id === 'string' ? route.params.id : '')
  const existingRoadmapId = computed(() =>
    typeof route.query.roadmapId === 'string' ? route.query.roadmapId : '',
  )
  const pending = request.pending
  const error = request.error

  async function importRoadmapFile({ payload, title }) {
    if (!DEVELOPMENT_IS_LOCAL || typeof developmentApi.importPortable !== 'function') return

    const result = await request.run(() =>
      developmentApi.importPortable(payload, {
        title,
        requestId: crypto.randomUUID(),
      }),
    )

    if (result) openRoadmap(result.id)
  }

  async function upload(file) {
    const result = await request.run((signal) =>
      developmentImportApi.upload(file, {
        roadmapId: existingRoadmapId.value || null,
        signal,
      }),
    )

    if (!result) return
    job.value = result
    jobId.value = result.id
    await router.replace({
      name: 'development-import-detail',
      params: { id: result.id },
      query: existingRoadmapId.value ? { roadmapId: existingRoadmapId.value } : {},
    })
  }

  async function refreshJob() {
    if (!DEVELOPMENT_IMPORT_API_READY || !jobId.value) return
    const result = await request.run((signal) => developmentImportApi.get(jobId.value, { signal }))
    if (result) job.value = result
  }

  async function confirmImport(mapping) {
    if (!jobId.value) return
    const result = await request.run((signal) =>
      developmentImportApi.confirm(jobId.value, mapping, { signal }),
    )
    if (result) job.value = result
  }

  function startOver() {
    job.value = null
    jobId.value = ''
    request.clear()
    void router.push({
      name: 'development-imports',
      query: existingRoadmapId.value ? { roadmapId: existingRoadmapId.value } : {},
    })
  }

  function openRoadmap(id) {
    void router.push({ name: 'development-workspace', params: { id } })
  }

  useDevelopmentLifecycle(
    () => (jobId.value ? refreshJob() : Promise.resolve()),
    () => {
      job.value = null
      request.clear()
    },
  )
</script>
