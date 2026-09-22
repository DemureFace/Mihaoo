<template>
  <label class="flex w-full flex-col gap-1.5">
    <span v-if="label" class="text-xs font-semibold text-neutral-500">
      {{ label }}

      <span v-if="required" class="text-red-600">*</span>
    </span>

    <div class="relative">
      <input
        :id="id"
        :name="name"
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60"
        :class="error ? 'border-red-600 focus:ring-red-200' : 'border-black focus:ring-black/20'"
        @input="onInput"
      />

      <BaseButton
        v-if="type === 'password'"
        type="button"
        variant="ghost"
        size="sm"
        class="absolute right-1 top-1/2 -translate-y-1/2"
        @click="showPassword = !showPassword"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </BaseButton>
    </div>

    <span v-if="hint && !error" class="text-xs text-neutral-500">
      {{ hint }}
    </span>

    <span v-if="error" :id="`${id}-error`" class="text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
  import { computed, ref } from 'vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    modelValue: {
      type: [String, Number],
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

    type: {
      type: String,
      default: 'text',
    },

    placeholder: {
      type: String,
      default: '',
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

    required: {
      type: Boolean,
      default: false,
    },

    autocomplete: {
      type: String,
      default: 'off',
    },

    min: {
      type: [String, Number],
      default: undefined,
    },

    max: {
      type: [String, Number],
      default: undefined,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const showPassword = ref(false)

  const resolvedType = computed(() => {
    if (props.type !== 'password') {
      return props.type
    }

    return showPassword.value ? 'text' : 'password'
  })

  function onInput(event) {
    const value = event.target.value

    emit('update:modelValue', value)
  }
</script>
