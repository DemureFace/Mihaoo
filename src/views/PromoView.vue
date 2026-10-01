<template>
  <section class="mx-auto max-w-5xl space-y-6 p-4">
    <header>
      <h1 class="text-2xl font-bold text-black">Promo Generator</h1>

      <p class="mt-1 text-sm text-neutral-500">Generate promo templates from a task description.</p>
    </header>

    <BaseSelect v-model="brand" id="promo-brand" label="Brand" :options="brandOptions" />

    <BaseTextarea
      v-model="input"
      id="promo-task"
      label="Task"
      :rows="12"
      placeholder="Insert the entire promo task here"
    />

    <BaseInput v-model="imageUrl" id="promo-image" label="Image URL" placeholder="https://..." />

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
      <GeneratedArtifact v-if="result.template" title="Promo Page" :content="result.template" />

      <GeneratedArtifact v-if="result.card" title="Promo Card" :content="result.card" />

      <GeneratedArtifact v-if="result.rulesHtml" title="Promo Rules" :content="result.rulesHtml" />
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

  import { promoTemplatesService } from '@/services/promoTemplates.service'

  const brand = ref('BH')

  const input = ref('')
  const imageUrl = ref('')

  const error = ref('')
  const loading = ref(false)

  const result = ref(null)

  let requestController = null

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

  const canGenerate = computed(() => {
    return input.value.trim().length >= 10 && Boolean(brand.value) && Boolean(imageUrl.value.trim())
  })

  watch([brand, input, imageUrl], () => {
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

      result.value = await promoTemplatesService.generate(payload, controller.signal)
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED') {
        return
      }

      const message = requestError?.response?.data?.message

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
