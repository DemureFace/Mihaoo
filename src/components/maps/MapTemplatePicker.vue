<template>
  <BaseModal v-model="open">
    <div>
      <div>
        <h2 class="text-xl font-bold">Create Map</h2>

        <p class="mt-1 text-sm text-black/50">Choose a starting template.</p>
      </div>

      <div class="mt-6 flex flex-col gap-3">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="text-left border border-black/10 rounded-2xl p-4 transition hover:border-black hover:bg-black/[0.02]"
          @click="selectTemplate(template.id)"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-bold">
                {{ template.name }}
              </h3>

              <p class="mt-1 text-sm leading-5 text-black/50">
                {{ template.description }}
              </p>
            </div>

            <span class="shrink-0 px-2 py-1 rounded-lg bg-black/5 text-[10px] font-bold uppercase">
              {{ template.category }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed } from 'vue'

  import BaseModal from '@/components/base/BaseModal.vue'

  import { MAP_TEMPLATES } from '@/data/mapTemplates'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'select'])

  const templates = MAP_TEMPLATES

  const open = computed({
    get() {
      return props.modelValue
    },

    set(value) {
      emit('update:modelValue', value)
    },
  })

  function selectTemplate(id) {
    emit('select', id)

    open.value = false
  }
</script>
