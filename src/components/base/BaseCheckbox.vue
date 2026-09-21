<template>
  <label
    class="inline-flex cursor-pointer items-start gap-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      class="mt-0.5 h-4 w-4 shrink-0 accent-black"
      @change="onChange"
    />

    <span v-if="$slots.default || label" class="text-sm text-black">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: [Boolean, Array],
      default: false,
    },

    value: {
      type: [String, Number, Boolean],
      default: true,
    },

    id: {
      type: String,
      default: '',
    },

    label: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const checked = computed(() => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.some((item) => Object.is(item, props.value))
    }

    return Boolean(props.modelValue)
  })

  function onChange(event) {
    const isChecked = event.target.checked

    if (Array.isArray(props.modelValue)) {
      const next = [...props.modelValue]

      const index = next.findIndex((item) => Object.is(item, props.value))

      if (isChecked && index === -1) {
        next.push(props.value)
      }

      if (!isChecked && index !== -1) {
        next.splice(index, 1)
      }

      emit('update:modelValue', next)

      return
    }

    emit('update:modelValue', isChecked)
  }
</script>
