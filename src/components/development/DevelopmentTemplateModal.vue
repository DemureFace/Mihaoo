<template>
  <BaseModal
    :model-value="modelValue"
    size="md"
    :aria-label="mode === 'save' ? 'Save roadmap as template' : 'Create roadmap from template'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <h2 class="text-xl font-bold">
          {{ mode === 'save' ? 'Save as template' : 'Create from template' }}
        </h2>
        <p class="mt-2 text-sm text-neutral-600">
          {{
            mode === 'save'
              ? 'The template copies roadmap structure, not personal journal entries or private evidence.'
              : `Template: ${template?.title || ''}`
          }}
        </p>
      </div>

      <BaseInput
        id="development-template-title"
        v-model="form.title"
        :label="mode === 'save' ? 'Template title' : 'Roadmap title'"
        required
        maxlength="160"
        :disabled="pending"
      />

      <BaseTextarea
        v-if="mode === 'save'"
        id="development-template-description"
        v-model="form.description"
        label="Template description"
        :rows="3"
        maxlength="1000"
        :disabled="pending"
      />

      <div v-else class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput
          id="development-template-start"
          v-model="form.startDate"
          label="Start date"
          type="date"
          :disabled="pending"
        />
        <BaseInput
          id="development-template-end"
          v-model="form.endDate"
          label="End date"
          type="date"
          :min="form.startDate || undefined"
          :disabled="pending"
        />
      </div>

      <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
        {{ error }}
      </p>

      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton type="button" variant="secondary" :disabled="pending" @click="emit('update:modelValue', false)">
          Cancel
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="pending" :disabled="pending">
          {{ mode === 'save' ? 'Create template' : 'Create roadmap' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
  import { reactive, watch } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import { developmentTemplateApi } from '@/services/development.service.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    mode: {
      type: String,
      default: 'instantiate',
      validator: (value) => ['save', 'instantiate'].includes(value),
    },
    roadmapId: { type: String, default: '' },
    template: { type: Object, default: null },
  })

  const emit = defineEmits(['update:modelValue', 'saved', 'created'])
  const { pending, error, run } = useDevelopmentRequest()
  const form = reactive({ title: '', description: '', startDate: '', endDate: '' })

  watch(
    () => [props.modelValue, props.mode, props.template?.id],
    () => {
      if (!props.modelValue) return
      form.title = props.mode === 'save' ? '' : props.template?.title || ''
      form.description = ''
      form.startDate = ''
      form.endDate = ''
    },
    { immediate: true },
  )

  async function submit() {
    if (pending.value) return

    if (props.mode === 'save') {
      const result = await run((signal) =>
        developmentTemplateApi.createFromRoadmap(
          props.roadmapId,
          { title: form.title, description: form.description },
          { signal },
        ),
      )
      if (result) {
        emit('saved', result)
        emit('update:modelValue', false)
      }
      return
    }

    const requestId = crypto.randomUUID()
    const result = await run((signal) =>
      developmentTemplateApi.instantiate(
        props.template.id,
        {
          title: form.title,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          requestId,
        },
        { signal },
      ),
    )

    if (result) {
      emit('created', result)
      emit('update:modelValue', false)
    }
  }
</script>
