<template>
  <section class="mx-auto max-w-5xl space-y-6 p-4">
    <header>
      <h1 class="text-2xl font-bold text-black">Tournament Generator</h1>

      <p class="mt-1 text-sm text-neutral-500">
        Generate tournament templates from a task description.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BaseSelect
        v-model="tournamentType"
        id="tournament-type"
        label="Tournament type"
        :options="tournamentTypeOptions"
      />

      <BaseSelect v-model="brand" id="tournament-brand" label="Brand" :options="brandOptions" />
    </div>

    <BaseTextarea
      v-model="input"
      id="tournament-task"
      label="Task"
      :rows="12"
      placeholder="Insert the entire tournament task here"
    />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BaseInput
        v-model="imageUrlDesktop"
        id="tournament-image-desktop"
        label="Desktop image URL"
        placeholder="https://..."
      />

      <BaseInput
        v-model="imageUrlMobile"
        id="tournament-image-mobile"
        label="Mobile image URL"
        placeholder="https://..."
      />
    </div>

    <div v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <BaseButton
      variant="primary"
      size="lg"
      :disabled="!canGenerate"
      :loading="loading"
      @click="handleGenerate"
    >
      {{ loading ? 'Generating...' : 'Generate' }}
    </BaseButton>

    <div v-if="result" class="space-y-4">
      <GeneratedArtifact
        v-if="result.template"
        title="Tournament Page"
        :content="result.template"
      />

      <GeneratedArtifact v-if="result.card" title="Tournament Card" :content="result.card" />

      <GeneratedArtifact v-if="snippets" title="Tournament Snippets" :content="snippets" />
    </div>
  </section>
</template>

<script setup>
  import { computed, onBeforeUnmount, ref, watch } from 'vue'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import GeneratedArtifact from '@/components/generator/GeneratedArtifact.vue'
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

  let requestController = null

  const tournamentTypeOptions = [
    {
      value: 'network',
      label: 'Network',
    },
    {
      value: 'ordinary',
      label: 'Ordinary',
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

  const canGenerate = computed(() => {
    return (
      input.value.trim().length >= 10 &&
      Boolean(brand.value) &&
      Boolean(imageUrlDesktop.value.trim())
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
    error.value = ''
    loading.value = false
  }

  async function handleGenerate() {
    error.value = ''
    result.value = null
    snippets.value = null

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

      const [generatedResult, generatedSnippets] = await Promise.all([
        tournamentTemplatesService.generateNetwork(payload, controller.signal),

        tournamentTemplatesService.generateNetworkSnippets(payload, controller.signal),
      ])

      result.value = generatedResult

      snippets.value = generatedSnippets
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      const message = requestError?.response?.data?.message

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
