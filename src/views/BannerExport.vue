<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Banner Export</h1>
      <p class="text-sm opacity-70">
        Paste a Figma link, load banners, select what you need, and export PNG / WEBP ZIP.
      </p>
    </div>

    <section class="grid gap-4 max-w-4xl rounded border p-4">
      <label class="grid gap-1">
        <span class="text-sm font-medium">Campaign ID</span>
        <input
          v-model="form.campaignId"
          class="rounded border px-3 py-2 bg-transparent"
          placeholder="spring-sale"
        />
      </label>

      <label class="grid gap-1">
        <span class="text-sm font-medium">Figma URL</span>
        <textarea
          v-model="form.figmaUrl"
          class="min-h-24 rounded border px-3 py-2 bg-transparent"
          placeholder="https://www.figma.com/design/FILE_KEY/File-name?node-id=..."
        />
        <span class="text-xs opacity-60">
          Recommended: copy link to the EXPORT frame or selected banner from Figma.
        </span>
      </label>

      <div class="flex flex-wrap gap-3">
        <button
          class="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          :disabled="isInspecting || isRateLimited || !form.figmaUrl"
          @click="loadBanners"
        >
          {{
            isInspecting
              ? 'Loading banners...'
              : isRateLimited
                ? `Try again in ${retryCountdownLabel}`
                : 'Load banners'
          }}
        </button>

        <button
          v-if="detectedBanners.length"
          class="rounded border px-4 py-2"
          type="button"
          @click="selectAllBanners"
        >
          Select all
        </button>

        <button
          v-if="detectedBanners.length"
          class="rounded border px-4 py-2"
          type="button"
          @click="clearSelectedBanners"
        >
          Clear
        </button>
      </div>
    </section>

    <section v-if="inspection" class="max-w-4xl rounded border p-4 space-y-3">
      <div>
        <h2 class="text-lg font-semibold">Figma source</h2>
        <div class="mt-2 text-sm opacity-80">
          <div>
            <strong>File key:</strong>
            {{ inspection.fileKey }}
          </div>
          <div>
            <strong>Source node:</strong>
            {{ inspection.sourceNodeId }}
          </div>
          <div v-if="inspection.sourceName">
            <strong>Source name:</strong>
            {{ inspection.sourceName }}
          </div>
        </div>
      </div>
    </section>

    <section v-if="detectedBanners.length" class="max-w-4xl rounded border p-4 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">Detected banners</h2>
          <p class="text-sm opacity-70">
            {{ selectedCount }} of {{ detectedBanners.length }} selected
          </p>
        </div>

        <label class="grid gap-1">
          <span class="text-sm font-medium">Quality preset</span>
          <select v-model="selectedPreset" class="rounded border px-3 py-2 bg-transparent">
            <option v-for="(preset, key) in QUALITY_PRESETS" :key="key" :value="key">
              {{ preset.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="overflow-auto rounded border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left">
              <th class="p-3 w-12">Use</th>
              <th class="p-3">Name</th>
              <th class="p-3">Size</th>
              <th class="p-3">Type</th>
              <th class="p-3">Node ID</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="banner in detectedBanners" :key="banner.id" class="border-b last:border-b-0">
              <td class="p-3">
                <input v-model="banner.selected" type="checkbox" />
              </td>
              <td class="p-3 font-medium">{{ banner.name }}</td>
              <td class="p-3">{{ banner.width }}×{{ banner.height }}</td>
              <td class="p-3">{{ banner.type }}</td>
              <td class="p-3 font-mono text-xs">{{ banner.id }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid gap-3 rounded border p-3">
        <div class="text-sm font-medium">Formats</div>

        <label class="flex items-center gap-2">
          <input v-model="formats.png" type="checkbox" />
          <span>PNG</span>
        </label>

        <label class="flex items-center gap-2">
          <input v-model="formats.webp" type="checkbox" />
          <span>WEBP</span>
        </label>
      </div>

      <div class="rounded border p-3 text-sm">
        <div class="font-medium">Selected preset details</div>
        <div class="mt-2 opacity-80">
          <div>Scale: {{ activePreset.scale }}</div>
          <div>WEBP quality: {{ activePreset.webp }}</div>
          <div>PNG compression: {{ activePreset.pngCompressionLevel }}</div>
          <div>Sharpen: {{ activePreset.sharpen ? 'Yes' : 'No' }}</div>
        </div>
      </div>

      <button
        class="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        :disabled="
          isExporting || isRateLimited || selectedCount === 0 || selectedFormats.length === 0
        "
        @click="startExport"
      >
        {{
          isExporting
            ? 'Exporting...'
            : isRateLimited
              ? `Try again in ${retryCountdownLabel}`
              : 'Export selected banners'
        }}
      </button>
    </section>

    <section v-if="job" class="max-w-4xl rounded border p-4">
      <div class="font-medium">Job status</div>

      <pre class="mt-3 overflow-auto text-sm">{{ job }}</pre>

      <div class="mt-4">
        <div class="h-2 overflow-hidden rounded bg-gray-200">
          <div
            class="h-full bg-blue-600 transition-all"
            :style="{ width: `${job.progress || 0}%` }"
          />
        </div>
      </div>

      <a
        v-if="job.status === 'completed' && job.downloadUrl"
        :href="job.downloadUrl"
        class="mt-4 inline-flex rounded bg-green-600 px-4 py-2 text-white"
      >
        Download ZIP
      </a>

      <div v-if="job.status === 'failed'" class="mt-4 text-red-500">
        {{ job.error || 'Export failed' }}
      </div>
      <div v-if="isRateLimited" class="mt-4 rounded border border-yellow-500 p-3 text-yellow-700">
        Figma limit reached. Try again in {{ retryCountdownLabel }}.
      </div>
    </section>
    <section v-if="manifest?.banners?.length" class="max-w-4xl rounded border p-4 space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Optimization report</h2>
        <p class="text-sm opacity-70">File size comparison for exported banners.</p>
      </div>

      <div class="overflow-auto rounded border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left">
              <th class="p-3">Banner</th>
              <th class="p-3">Size</th>
              <th class="p-3">PNG</th>
              <th class="p-3">WEBP</th>
              <th class="p-3">Saved</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="banner in manifest.banners"
              :key="banner.nodeId"
              class="border-b last:border-b-0"
            >
              <td class="p-3 font-medium">
                {{ banner.originalName || banner.name }}
              </td>

              <td class="p-3">{{ banner.width }}×{{ banner.height }}</td>

              <td class="p-3">
                {{ getOutputSizeLabel(banner, 'png') }}
              </td>

              <td class="p-3">
                {{ getOutputSizeLabel(banner, 'webp') }}
              </td>

              <td class="p-3">
                <span v-if="banner.savings">{{ banner.savings.webpVsPngPercent }}%</span>
                <span v-else class="opacity-50">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="error" class="max-w-4xl rounded border border-red-500 p-4 text-red-500">
      {{ error }}
    </div>
    <div
      v-if="isRateLimited"
      class="max-w-4xl rounded border border-yellow-500 p-4 text-yellow-700"
    >
      Figma limit reached. Try again in {{ retryCountdownLabel }}.
    </div>
  </div>
</template>

<script setup>
  import { computed, onBeforeUnmount, reactive, ref } from 'vue'
  import {
    createBannerExport,
    getBannerExport,
    getBannerExportManifest,
    inspectBannerExport,
  } from '@/services/bannerExportService'

  const QUALITY_PRESETS = {
    balanced: {
      label: 'Balanced',
      scale: 2,
      webp: 86,
      pngCompressionLevel: 9,
      sharpen: true,
    },
    maxQuality: {
      label: 'Max quality',
      scale: 3,
      webp: 90,
      pngCompressionLevel: 9,
      sharpen: true,
    },
    lowWeight: {
      label: 'Low weight',
      scale: 2,
      webp: 78,
      pngCompressionLevel: 9,
      sharpen: false,
    },
    textSharp: {
      label: 'Text sharp',
      scale: 3,
      webp: 88,
      pngCompressionLevel: 9,
      sharpen: true,
    },
  }

  const form = reactive({
    campaignId: 'test-campaign',
    figmaUrl: '',
  })

  const formats = reactive({
    png: true,
    webp: true,
  })

  const selectedPreset = ref('balanced')
  const inspection = ref(null)
  const detectedBanners = ref([])
  const job = ref(null)
  const error = ref('')
  const isInspecting = ref(false)
  const isExporting = ref(false)

  const cooldownSeconds = ref(0)

  let pollingTimer = null
  let cooldownTimer = null

  const activePreset = computed(() => {
    return QUALITY_PRESETS[selectedPreset.value] || QUALITY_PRESETS.balanced
  })

  const selectedCount = computed(() => {
    return detectedBanners.value.filter((banner) => banner.selected).length
  })

  const selectedFormats = computed(() => {
    const result = []

    if (formats.png) result.push('png')
    if (formats.webp) result.push('webp')

    return result
  })

  const retryCountdownLabel = computed(() => {
    const total = cooldownSeconds.value
    const minutes = Math.floor(total / 60)
    const seconds = total % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const isRateLimited = computed(() => {
    return cooldownSeconds.value > 0
  })

  async function loadBanners() {
    error.value = ''
    job.value = null
    inspection.value = null
    detectedBanners.value = []
    isInspecting.value = true

    try {
      const result = await inspectBannerExport(form.figmaUrl)

      inspection.value = result
      detectedBanners.value = (result.banners || []).map((banner) => ({
        ...banner,
        selected: banner.selected !== false,
      }))

      if (!detectedBanners.value.length) {
        error.value = 'No banners found in selected Figma node.'
      }
    } catch (err) {
      const message = err?.message || 'Failed to load banners'

      error.value = message

      const isFigmaRateLimit = err?.status === 429 || message.toLowerCase().includes('rate limit')

      if (isFigmaRateLimit) {
        startCooldown(err?.data?.retryAfterSeconds || 15 * 60)
      }
    } finally {
      isInspecting.value = false
    }
  }
function getOutputSizeLabel(banner, format) {
  const output = banner.outputs?.find((item) => item.format === format)

  if (!output) return '—'

  return `${output.sizeKb} KB`
}
  function selectAllBanners() {
    detectedBanners.value = detectedBanners.value.map((banner) => ({
      ...banner,
      selected: true,
    }))
  }

  function clearSelectedBanners() {
    detectedBanners.value = detectedBanners.value.map((banner) => ({
      ...banner,
      selected: false,
    }))
  }

  function buildExportPayload() {
    const preset = activePreset.value

    const nodes = detectedBanners.value
      .filter((banner) => banner.selected)
      .map((banner) => ({
        id: banner.id,
        name: banner.name,
        width: banner.width,
        height: banner.height,
        scale: preset.scale,
      }))

    return {
      campaignId: form.campaignId,
      figmaFileKey: inspection.value.fileKey,
      nodes,
      formats: selectedFormats.value,
      quality: {
        webp: preset.webp,
        pngCompressionLevel: preset.pngCompressionLevel,
        sharpen: preset.sharpen,
      },
    }
  }

  async function startExport() {
    error.value = ''
    job.value = null
    isExporting.value = true

    try {
      const createdJob = await createBannerExport(buildExportPayload())
      job.value = createdJob
      startPolling(createdJob.id)
    } catch (err) {
      error.value = err.message || 'Something went wrong'
      isExporting.value = false
    }
    const manifest = ref(null)
  }

  function startPolling(jobId) {
    clearPolling()

    pollingTimer = window.setInterval(async () => {
      try {
        const updatedJob = await getBannerExport(jobId)
        job.value = updatedJob

        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          isExporting.value = false

          if (updatedJob.retryAfterSeconds) {
            startCooldown(updatedJob.retryAfterSeconds)
          }

          clearPolling()
        }
        if (updatedJob.status === 'completed') {
          await loadManifest(updatedJob.id)
        }
      } catch (err) {
        error.value = err.message || 'Failed to check export status'
        isExporting.value = false
        clearPolling()
      }
    }, 1500)
  }
  async function loadManifest(jobId) {
    try {
      manifest.value = await getBannerExportManifest(jobId)
    } catch (err) {
      console.warn('Failed to load export manifest:', err)
    }
  }
  function clearPolling() {
    if (pollingTimer) {
      window.clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  function startCooldown(seconds) {
    stopCooldown()

    cooldownSeconds.value = Number(seconds) || 0

    if (cooldownSeconds.value <= 0) return

    cooldownTimer = window.setInterval(() => {
      cooldownSeconds.value = Math.max(cooldownSeconds.value - 1, 0)

      if (cooldownSeconds.value <= 0) {
        stopCooldown()
      }
    }, 1000)
  }

  function stopCooldown() {
    if (cooldownTimer) {
      window.clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }

  onBeforeUnmount(() => {
    clearPolling()
    stopCooldown()
  })
</script>
