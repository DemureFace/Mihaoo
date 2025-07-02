<template>
  <button
    :class="[
      'px-4 py-2 rounded transition font-semibold',
      variantClass,
      disabled ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-90',
      block ? 'w-full' : ''
    ]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // primary | secondary | danger
  block: Boolean,
  disabled: Boolean,
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'bg-gray-200 text-gray-900';
    case 'danger':    return 'bg-red-600 text-white';
    default:          return 'bg-blue-600 text-white';
  }
});
</script>
