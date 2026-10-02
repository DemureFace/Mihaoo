<template>
  <GeneratorLayout
    title="Tournament Generator"
    description="Generate ready-to-use CMS tournament templates from a task description."
    :show-results="Boolean(result)"
  >
    <form class="space-y-6" @submit.prevent="handleGenerate">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BaseSelect
          v-model="tournamentType"
          id="tournament-type"
          label="Tournament type"
          :options="tournamentTypeOptions"
          required
        />

        <BaseSelect
          v-model="brand"
          id="tournament-brand"
          label="Brand"
          :options="brandOptions"
          required
        />
      </div>

      <div>
        <BaseTextarea
          v-model="input"
          id="tournament-task"
          label="Task description"
          :rows="12"
          placeholder="Paste the entire tournament task here..."
          required
        />

        <p class="mt-2 text-xs text-neutral-500">
          Paste the complete task without removing dates, prize pool, restrictions or rules.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BaseInput
          v-model="imageUrlDesktop"
          id="tournament-image-desktop"
          label="Desktop image URL"
          placeholder="https://..."
          required
        />

        <BaseInput
          v-model="imageUrlMobile"
          id="tournament-image-mobile"
          label="Mobile image URL"
          placeholder="https://..."
          hint="Optional"
        />
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

          ·

          <span>
            {{ tournamentTypeLabel }}
          </span>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!canGenerate"
          :loading="loading"
        >
          <SparklesIcon class="h-5 w-5" />

          {{ loading ? 'Generating...' : 'Generate tournament' }}
        </BaseButton>
      </div>
    </form>

    <template v-if="result" #result>
      <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Brand</p>

          <p class="mt-1 font-semibold text-black">
            {{ selectedBrandLabel }}
          </p>
        </div>

        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Type</p>

          <p class="mt-1 font-semibold text-black">
            {{ tournamentTypeLabel }}
          </p>
        </div>

        <div class="rounded-xl border border-black/10 bg-neutral-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Slug</p>

          <p
            class="mt-1 truncate font-mono text-sm font-semibold text-black"
            :title="result.slug || '—'"
          >
            {{ result.slug || '—' }}
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <GeneratedArtifact
          v-if="result.template"
          title="Tournament Page"
          :content="result.template"
        />

        <GeneratedArtifact v-if="result.card" title="Tournament Card" :content="result.card" />

        <GeneratedArtifact v-if="snippets" title="Tournament Snippets" :content="snippets" />

        <GeneratedArtifact
          v-if="locales"
          title="MW Localized Tournament Pages"
          :content="locales"
        />
      </div>
    </template>
  </GeneratorLayout>
</template>

<script setup>
  import { computed, onBeforeUnmount, ref, watch } from 'vue'

  import { ExclamationCircleIcon, SparklesIcon } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import GeneratedArtifact from '@/components/generator/GeneratedArtifact.vue'
  import GeneratorLayout from '@/components/generator/GeneratorLayout.vue'

  import { tournamentTemplatesService } from '@/services/tournamentTemplates.service'

  const tournamentType = ref('network')
  const brand = ref('BH')

  const input = ref('')
  const imageUrlDesktop = ref('')
  const imageUrlMobile = ref('')

  const error = ref('')
  const loading = ref(false)

  const result = ref(null)
  const snippets = ref(null)
  const locales = ref(null)

  let requestController = null

  const tournamentTypeOptions = [
    {
      value: 'network',
      label: 'Network Tournament',
    },
    {
      value: 'ordinary',
      label: 'Ordinary Tournament',
    },
  ]

  const networkBrandOptions = [
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

  const ordinaryBrandOptions = [
    {
      value: 'BH',
      label: 'Boho Casino',
    },
    {
      value: 'SG',
      label: 'Slots Gallery',
    },
  ]

  const brandOptions = computed(() => {
    return tournamentType.value === 'ordinary' ? ordinaryBrandOptions : networkBrandOptions
  })

  const selectedBrandLabel = computed(() => {
    return brandOptions.value.find((option) => option.value === brand.value)?.label || brand.value
  })

  const tournamentTypeLabel = computed(() => {
    return (
      tournamentTypeOptions.find((option) => option.value === tournamentType.value)?.label ||
      tournamentType.value
    )
  })

  const canGenerate = computed(() => {
    return (
      input.value.trim().length >= 10 &&
      Boolean(brand.value) &&
      Boolean(imageUrlDesktop.value.trim()) &&
      !loading.value
    )
  })

  watch(tournamentType, () => {
    const brandIsAvailable = brandOptions.value.some((option) => option.value === brand.value)

    if (!brandIsAvailable) {
      brand.value = brandOptions.value[0]?.value || ''
    }

    clearGeneratedResult()
  })

  watch([brand, input, imageUrlDesktop, imageUrlMobile], () => {
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
    snippets.value = null
    locales.value = null
    error.value = ''
    loading.value = false
  }

  async function handleGenerate() {
    error.value = ''
    result.value = null
    snippets.value = null
    locales.value = null

    if (!canGenerate.value) {
      error.value = 'Fill in the task, brand and desktop image URL.'

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
        imageUrlDesktop: imageUrlDesktop.value.trim(),
      }

      if (imageUrlMobile.value.trim()) {
        payload.imageUrlMobile = imageUrlMobile.value.trim()
      }

      if (tournamentType.value === 'ordinary') {
        result.value = await tournamentTemplatesService.generateOrdinary(payload, controller.signal)

        return
      }

      const requests = [
        tournamentTemplatesService.generateNetwork(payload, controller.signal),

        tournamentTemplatesService.generateNetworkSnippetsText(payload, controller.signal),
      ]

      if (brand.value === 'MW') {
        requests.push(
          tournamentTemplatesService.generateNetworkLocalesText(payload, controller.signal),
        )
      }

      const [generatedResult, generatedSnippets, generatedLocales = null] =
        await Promise.all(requests)

      result.value = generatedResult
      snippets.value = generatedSnippets
      locales.value = generatedLocales
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      const response = requestError?.response?.data

      const message = response?.error?.message || response?.message

      error.value = Array.isArray(message)
        ? message.join(', ')
        : message || requestError?.message || 'Failed to generate tournament.'
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
