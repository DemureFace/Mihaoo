<template>
  <div
    class="fixed inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-sm"
    role="status"
    aria-live="polite"
  >
    <div
      class="flex items-center gap-3 rounded-xl border border-black bg-white px-5 py-4 shadow-lg"
    >
      <span
        class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black"
        aria-hidden="true"
      />

      <span class="text-sm font-medium text-black">
        {{ text }}
      </span>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    text: {
      type: String,
      default: 'Loading',
    },
  })
</script>
