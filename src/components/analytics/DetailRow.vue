<template>
  <div>
    <dt class="text-xs font-medium text-neutral-500">
      {{ label }}
    </dt>

    <dd class="mt-1 text-sm text-black">
      {{ value }}
    </dd>
  </div>
</template>

<script setup>
  defineProps({
    label: {
      type: String,
      required: true,
    },

    value: {
      type: [String, Number],
      default: '—',
    },
  })
</script>
