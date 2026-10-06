<template>
  <div
    role="region"
    :aria-label="label"
    tabindex="0"
    class="min-w-0 max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/30"
  >
    <slot />
  </div>
</template>

<script setup>
  defineProps({ label: { type: String, required: true } })
</script>
