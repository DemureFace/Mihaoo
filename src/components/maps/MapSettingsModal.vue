<template>
  <BaseModal v-model="open">
    <div>
      <h2 class="text-xl font-bold">Map Settings</h2>

      <p class="mt-1 text-sm text-black/50">General information and map status.</p>

      <div class="mt-6 flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Title</span>

          <input v-model="form.title" type="text" class="field" />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Description</span>

          <textarea v-model="form.description" rows="4" class="field resize-none" />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Status</span>

          <select v-model="form.status" class="field">
            <option value="draft">Draft</option>

            <option value="active">Active</option>

            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-black/5"
          @click="open = false"
        >
          Cancel
        </button>

        <BaseButton class="px-4 py-2" @click="saveSettings">Save Settings</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed, reactive, watch } from 'vue'

  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      default: 'draft',
    },
  })

  const emit = defineEmits(['update:modelValue', 'save'])

  const form = reactive({
    title: '',
    description: '',
    status: 'draft',
  })

  const open = computed({
    get() {
      return props.modelValue
    },

    set(value) {
      emit('update:modelValue', value)
    },
  })

  watch(
    () => props.modelValue,

    (value) => {
      if (!value) return

      form.title = props.title

      form.description = props.description

      form.status = props.status
    },
  )

  function saveSettings() {
    emit('save', {
      title: form.title.trim() || 'Untitled Map',

      description: form.description.trim(),

      status: form.status,
    })

    open.value = false
  }
</script>

<style scoped>
  .field {
    width: 100%;
    border: 1px solid rgb(0 0 0 / 0.1);

    border-radius: 0.75rem;

    padding: 0.65rem 0.75rem;

    outline: none;

    font-size: 0.875rem;
  }

  .field:focus {
    border-color: rgb(0 0 0 / 0.35);
  }
</style>
