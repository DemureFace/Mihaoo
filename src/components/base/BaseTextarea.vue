<template>
  <label class="flex w-full flex-col gap-1.5">
    <span v-if="label" class="text-xs font-semibold text-neutral-500">
      {{ label }}

      <span v-if="required" class="text-red-600">*</span>
    </span>

    <textarea
      :id="id"
      :name="name"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :readonly="readonly"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60"
      :class="[
        error ? 'border-red-600 focus:ring-red-200' : 'border-black focus:ring-black/20',

        resizeClass,
      ]"
      @input="onInput"
    />

    <span v-if="hint && !error" class="text-xs text-neutral-500">
      {{ hint }}
    </span>

    <span v-if="error" class="text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },

    id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: '',
    },

    label: {
      type: String,
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },

    rows: {
      type: Number,
      default: 4,
    },

    error: {
      type: String,
      default: '',
    },

    hint: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    required: {
      type: Boolean,
      default: false,
    },

    resize: {
      type: String,
      default: 'vertical',
      validator: (value) => ['none', 'vertical', 'both'].includes(value),
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const resizeClass = computed(() => {
    const classes = {
      none: 'resize-none',
      vertical: 'resize-y',
      both: 'resize',
    }

    return classes[props.resize]
  })

  function onInput(event) {
    emit('update:modelValue', event.target.value)
  }
</script>
