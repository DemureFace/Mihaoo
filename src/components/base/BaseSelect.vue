<template>
  <label class="flex w-full flex-col gap-1.5">
    <span v-if="label" class="text-xs font-semibold text-neutral-500">
      {{ label }}

      <span v-if="required" class="text-red-600">*</span>
    </span>

    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60"
      :class="error ? 'border-red-600 focus:ring-red-200' : 'border-black focus:ring-black/20'"
      @change="onChange"
    >
      <option v-if="placeholder" value="">
        {{ placeholder }}
      </option>

      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <span v-if="error" class="text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
  defineProps({
    modelValue: {
      type: [String, Number],
      default: '',
    },

    id: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },

    options: {
      type: Array,
      default: () => [],
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    required: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['update:modelValue'])

  function onChange(event) {
    const selected = event.target.options[event.target.selectedIndex]

    const value = selected?._value ?? selected?.value ?? ''

    emit('update:modelValue', value)
  }
</script>
