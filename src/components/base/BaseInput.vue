<script setup>
  import { ref, defineProps } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'

  const isFocused = ref(false)
  const showPassword = ref(false)

  defineProps({
    icon: {
      type: String,
      default: '',
    },
    inputValue: {
      type: String,
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
    type: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      default: '',
    },
  })

  defineEmits(['update:inputValue'])
</script>

<template>
  <div class="flex flex-col relative mt-10">
    <span v-if="icon" class="icon-input">
      <icon class="fa-solid" :class="icon" />
    </span>
    <input
      class="w-full rounded-xl border border-black bg-white px-4 pr-16 py-3 text-lg outline-none transition placeholder-transparent focus:border-black focus:ring-2 focus:ring-black/10"
      :value="inputValue"
      :type="type === 'password' ? (showPassword ? 'text' : 'password') : type"
      :id="id"
      :placeholder="placeholder"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="$emit('update:inputValue', $event.target.value)"
    />
    <button
      v-if="type === 'password'"
      type="button"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500"
      @click="showPassword = !showPassword"
    >
      {{ showPassword ? 'Hide' : 'Show' }}
    </button>
    <label
      v-if="label"
      :for="id"
      class="label-anim"
      :class="{
        focused: isFocused || inputValue,
        labelError: error,
      }"
    >
      {{ label }}
    </label>
    <span v-if="error" class="">{{ error }}</span>
  </div>
</template>

<style scoped>
.label-anim {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
  transition: all 0.2s ease;
  pointer-events: none;
}

.label-anim.focused {
  top: 1px;
  transform: none;
  font-size: 10px;
  color: #6b7280;
  font-weight: 600;
}

.label-anim.labelError {
  color: #ef4444;
}
</style>
