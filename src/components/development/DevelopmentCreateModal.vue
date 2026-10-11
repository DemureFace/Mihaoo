<template>
  <BaseModal :model-value="modelValue" aria-label="Create private roadmap" size="md"
    @update:model-value="emit('update:modelValue', $event)">
    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <h2 class="text-xl font-bold">Create roadmap</h2>
        <p class="mt-2 text-sm text-neutral-600">
          Private by default. Only you can open it until you explicitly share access.
        </p>
      </div>
      <fieldset :disabled="pending" class="min-w-0 space-y-4 border-0 p-0">
        <BaseInput id="development-create-title" v-model="form.title" label="Roadmap title"
          placeholder="Content Specialist development plan" required maxlength="160" />
        <BaseTextarea id="development-create-description" v-model="form.description"
          label="Development goal / description" :rows="4" maxlength="4000" />
        <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput id="development-create-start" v-model="form.startDate" label="Start date" type="date" />
          <BaseInput id="development-create-end" v-model="form.endDate" label="End date" type="date"
            :min="form.startDate || undefined" />
        </div>
      </fieldset>
      <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{{ error }}</p>
      <p v-if="pending" class="text-sm text-neutral-600" role="status">
        Saving on the server. Closing this window does not undo a request already received by the server.
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton type="button" variant="secondary" :disabled="pending"
          @click="emit('update:modelValue', false)">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="pending" :disabled="pending">Create private roadmap</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
  import { reactive } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import { developmentApi } from '@/services/development.service.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'

  defineProps({ modelValue: { type: Boolean, default: false } })
  const emit = defineEmits(['update:modelValue', 'created'])
  const form = reactive({ title: '', description: '', startDate: '', endDate: '' })
  const { pending, error, run } = useDevelopmentRequest()
  let previousPayload = ''
  let requestId = ''

  async function submit() {
    if (pending.value) return
    const input = { ...form }
    const payload = JSON.stringify(input)
    // Retry the SAME submission with the SAME key after a network timeout.
    if (!requestId || payload !== previousPayload) {
      requestId = crypto.randomUUID()
      previousPayload = payload
    }
    const result = await run((signal) => developmentApi.create(input, { requestId, signal }))
    if (result) {
      emit('created', result)
      emit('update:modelValue', false)
    }
  }
</script>
