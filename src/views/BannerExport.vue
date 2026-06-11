<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Banner Export</h1>
      <p class="text-sm opacity-70">Export banners from Figma to PNG / WEBP ZIP.</p>
    </div>

    <div class="grid gap-4 max-w-3xl">
      <label class="grid gap-1">
        <span class="text-sm">Campaign ID</span>
        <input
          v-model="form.campaignId"
          class="rounded border px-3 py-2 bg-transparent"
          placeholder="test-campaign"
        />
      </label>

      <label class="grid gap-1">
        <span class="text-sm">Figma File Key</span>
        <input
          v-model="form.figmaFileKey"
          class="rounded border px-3 py-2 bg-transparent"
          placeholder="bAgfdps86OPgvHDnjsvAgp"
        />
      </label>

      <label class="grid gap-1">
        <span class="text-sm">Node ID</span>
        <input
          v-model="form.nodeId"
          class="rounded border px-3 py-2 bg-transparent"
          placeholder="2027:40021"
        />
      </label>

      <label class="grid gap-1">
        <span class="text-sm">Banner name</span>
        <input
          v-model="form.name"
          class="rounded border px-3 py-2 bg-transparent"
          placeholder="banner_300x250"
        />
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class="grid gap-1">
          <span class="text-sm">Width</span>
          <input
            v-model.number="form.width"
            type="number"
            class="rounded border px-3 py-2 bg-transparent"
          />
        </label>

        <label class="grid gap-1">
          <span class="text-sm">Height</span>
          <input
            v-model.number="form.height"
            type="number"
            class="rounded border px-3 py-2 bg-transparent"
          />
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <label class="grid gap-1">
          <span class="text-sm">Scale</span>
          <input
            v-model.number="form.scale"
            type="number"
            min="1"
            max="4"
            class="rounded border px-3 py-2 bg-transparent"
          />
        </label>

        <label class="grid gap-1">
          <span class="text-sm">WEBP quality</span>
          <input
            v-model.number="form.webpQuality"
            type="number"
            min="1"
            max="100"
            class="rounded border px-3 py-2 bg-transparent"
          />
        </label>
      </div>

      <label class="flex items-center gap-2">
        <input v-model="form.sharpen" type="checkbox" />
        <span class="text-sm">Sharpen</span>
      </label>

      <button
        class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        :disabled="isLoading"
        @click="startExport"
      >
        {{ isLoading ? 'Exporting...' : 'Export banners' }}
      </button>
    </div>

    <div v-if="job" class="rounded border p-4 max-w-3xl">
      <div class="font-medium">Job status</div>

      <pre class="mt-3 text-sm overflow-auto">{{ job }}</pre>

      <div class="mt-4">
        <div class="h-2 rounded bg-gray-200 overflow-hidden">
          <div
            class="h-full bg-blue-600 transition-all"
            :style="{ width: `${job.progress || 0}%` }"
          />
        </div>
      </div>

      <a
        v-if="job.status === 'completed' && job.downloadUrl"
        :href="job.downloadUrl"
        class="inline-flex mt-4 rounded bg-green-600 px-4 py-2 text-white"
      >
        Download ZIP
      </a>

      <div v-if="job.status === 'failed'" class="mt-4 text-red-500">
        {{ job.error || 'Export failed' }}
      </div>
    </div>

    <div v-if="error" class="rounded border border-red-500 p-4 text-red-500 max-w-3xl">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { onBeforeUnmount, reactive, ref } from 'vue'
  import { createBannerExport, getBannerExport } from '@/services/bannerExportService'

  const form = reactive({
    campaignId: 'test-campaign',
    figmaFileKey: 'bAgfdps86OPgvHDnjsvAgp',
    nodeId: '2027:40021',
    name: 'banner_300x250',
    width: 300,
    height: 250,
    scale: 2,
    webpQuality: 86,
    sharpen: true,
  })

  const job = ref(null)
  const error = ref('')
  const isLoading = ref(false)

  let pollingTimer = null

  function buildPayload() {
    return {
      campaignId: form.campaignId,
      figmaFileKey: form.figmaFileKey,
      nodes: [
        {
          id: form.nodeId,
          name: form.name,
          scale: form.scale,
          width: form.width,
          height: form.height,
        },
      ],
      formats: ['png', 'webp'],
      quality: {
        webp: form.webpQuality,
        pngCompressionLevel: 9,
        sharpen: form.sharpen,
      },
    }
  }

  async function startExport() {
    error.value = ''
    job.value = null
    isLoading.value = true

    try {
      const createdJob = await createBannerExport(buildPayload())
      job.value = createdJob

      startPolling(createdJob.id)
    } catch (err) {
      error.value = err.message || 'Something went wrong'
      isLoading.value = false
    }
  }

  function startPolling(jobId) {
    clearPolling()

    pollingTimer = window.setInterval(async () => {
      try {
        const updatedJob = await getBannerExport(jobId)
        job.value = updatedJob

        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          isLoading.value = false
          clearPolling()
        }
      } catch (err) {
        error.value = err.message || 'Failed to check export status'
        isLoading.value = false
        clearPolling()
      }
    }, 1500)
  }

  function clearPolling() {
    if (pollingTimer) {
      window.clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  onBeforeUnmount(() => {
    clearPolling()
  })
</script>
