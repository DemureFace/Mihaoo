<template>
  <GeneratorLayout
    title="Promo Generator"
    description="Generate ready-to-use CMS promo content from a task description."
    :show-results="Boolean(result)"
  >
    <form class="space-y-6" @submit.prevent="handleGenerate">
      <BaseFormGrid>
        <BaseSelect
          v-model="brand"
          id="promo-brand"
          label="Brand"
          :options="brandOptions"
          required
        />

        <BaseSelect
          v-if="brand !== 'MW'"
          v-model="segment"
          id="promo-segment"
          label="Segment"
          :options="segmentOptions"
          required
        />

        <BaseInput
          v-model="imageUrl"
          id="promo-image"
          label="Desktop image URL"
          placeholder="https://..."
          required
        />

        <BaseInput
          v-if="brand === 'SG'"
          v-model="imageUrlMobile"
          id="promo-image-mobile"
          label="Mobile image URL"
          placeholder="https://..."
          required
        />
      </BaseFormGrid>

      <div>
        <BaseTextarea
          v-model="input"
          id="promo-task"
          label="Task description"
          :rows="12"
          placeholder="Paste the entire promo task here..."
          required
        />

        <p class="mt-2 text-xs text-neutral-500">
          Paste the complete task including bonus conditions, wagering requirements, dates and
          rules.
        </p>
      </div>

      <div
        v-if="error"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <ExclamationCircleIcon class="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

        <div>
          <p class="text-sm font-semibold text-red-700">Generation failed</p>

          <p class="mt-1 text-sm text-red-600">
            {{ error }}
          </p>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-xs text-neutral-500">
          <span class="font-semibold text-black">
            {{ selectedBrandLabel }}
          </span>

          <span class="mx-1">·</span>

          <span>Promo</span>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!canGenerate"
          :loading="loading"
        >
          <SparklesIcon class="h-5 w-5" />

          {{ loading ? 'Generating...' : 'Generate promo' }}
        </BaseButton>
      </div>
    </form>

    <template #result>
      <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Brand</p>

          <p class="mt-1 font-semibold text-black">
            {{ selectedBrandLabel }}
          </p>
        </div>

        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Generated</p>

          <p class="mt-1 font-semibold text-black">
            {{ artifactSummary }}
          </p>
        </div>

        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Slug</p>

          <p
            class="mt-1 truncate font-mono text-sm font-semibold text-black"
            :title="result?.slug || '—'"
          >
            {{ result?.slug || '—' }}
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <GeneratedArtifact v-if="result?.template" title="Promo Page" :content="result.template" />

        <GeneratedArtifact v-if="result?.card" title="Promo Card" :content="result.card" />

        <GeneratedArtifact
          v-if="result?.rulesHtml"
          title="Promo Rules"
          :content="result.rulesHtml"
        />
      </div>
    </template>
  </GeneratorLayout>
</template>

<script setup>
  import BaseFormGrid from '@/components/base/BaseFormGrid.vue'

  import { computed, onBeforeUnmount, ref, watch } from 'vue'

  import { ExclamationCircleIcon, SparklesIcon } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import GeneratedArtifact from '@/components/generator/GeneratedArtifact.vue'
  import GeneratorLayout from '@/components/generator/GeneratorLayout.vue'

  import { promoTemplatesService } from '@/services/promoTemplates.service'

  const brand = ref('BH')

  const segment = ref('regular')

  const input = ref('')
  const imageUrl = ref('')
  const imageUrlMobile = ref('')

  const error = ref('')
  const loading = ref(false)

  const result = ref(null)

  let requestController = null

  const segmentOptions = [
    {
      value: 'regular',
      label: 'Regular',
    },
    {
      value: 'vip',
      label: 'VIP',
    },
  ]

  const brandOptions = [
    {
      value: 'BH',
      label: 'Boho Casino',
    },
    {
      value: 'SG',
      label: 'Slots Gallery',
    },
    {
      value: 'MW',
      label: 'MoonWin',
    },
  ]

  const selectedBrandLabel = computed(() => {
    return brandOptions.find((option) => option.value === brand.value)?.label || brand.value
  })

  const artifactSummary = computed(() => {
    if (!result.value) {
      return '—'
    }

    const artifacts = []

    if (result.value.template) {
      artifacts.push('Page')
    }

    if (result.value.card) {
      artifacts.push('Card')
    }

    if (result.value.rulesHtml) {
      artifacts.push('Rules')
    }

    return artifacts.join(' + ') || '—'
  })

  const canGenerate = computed(() => {
    const mobileImageValid = brand.value !== 'SG' || Boolean(imageUrlMobile.value.trim())

    return (
      input.value.trim().length >= 10 &&
      Boolean(brand.value) &&
      Boolean(imageUrl.value.trim()) &&
      mobileImageValid &&
      !loading.value
    )
  })

  watch([brand, segment, input, imageUrl, imageUrlMobile], () => {
    clearGeneratedResult()
  })

  function cancelCurrentRequest() {
    if (!requestController) {
      return
    }

    requestController.abort()
    requestController = null
  }

  function clearGeneratedResult() {
    cancelCurrentRequest()

    result.value = null
    error.value = ''
    loading.value = false
  }

  async function handleGenerate() {
    error.value = ''
    result.value = null

    if (!canGenerate.value) {
      error.value = 'Fill in the task, brand and image URL.'

      return
    }

    cancelCurrentRequest()

    const controller = new AbortController()

    requestController = controller

    loading.value = true

    try {
      const payload = {
        text: input.value.trim(),
        brand: brand.value,
        imageUrl: imageUrl.value.trim(),
      }

      if (brand.value !== 'MW') {
        payload.segment = segment.value
      }

      if (brand.value === 'SG') {
        payload.imageUrlMobile = imageUrlMobile.value.trim()
      }

      result.value = await promoTemplatesService.generate(payload, controller.signal)
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      const response = requestError?.response?.data

      const message = response?.error?.message || response?.message

      error.value = Array.isArray(message)
        ? message.join(', ')
        : message || requestError?.message || 'Failed to generate promo.'
    } finally {
      if (requestController === controller) {
        requestController = null
        loading.value = false
      }
    }
  }

  onBeforeUnmount(() => {
    cancelCurrentRequest()
  })
</script>
