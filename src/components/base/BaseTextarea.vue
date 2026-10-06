<template>
  <label :class="$attrs.class" :style="$attrs.style" class="flex min-w-0 w-full flex-col gap-1.5">
    <span v-if="label" class="text-xs font-semibold text-neutral-500">
      {{ label }}

      <span v-if="required" class="text-red-600">*</span>
    </span>

    <textarea
      v-bind="
        Object.fromEntries(
          Object.entries($attrs).filter(([key]) => !['class', 'style'].includes(key)),
        )
      "
      :id="id"
      :name="name"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :readonly="readonly"
      :aria-invalid="Boolean(error)"
      :aria-describedby="
        [$attrs['aria-describedby'], error ? `${id}-error` : hint ? `${id}-hint` : null]
          .filter(Boolean)
          .join(' ') || undefined
      "
      class="min-w-0 max-w-full w-full rounded-lg border bg-white px-3 py-2 text-base sm:text-sm text-black outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60"
      :class="[
        error ? 'border-red-600 focus:ring-red-200' : 'border-black focus:ring-black/20',

        resizeClass,
      ]"
      @input="onInput"
    />

    <span v-if="hint && !error" :id="`${id}-hint`" class="text-xs text-neutral-500">
      {{ hint }}
    </span>

    <span v-if="error" :id="`${id}-error`" class="text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
  defineOptions({ inheritAttrs: false })
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
