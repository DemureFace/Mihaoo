<template>
  <DevelopmentBlockRenderer :block="block" />
</template>

<script setup>
  import DevelopmentBlockRenderer from '@/components/development/DevelopmentBlockRenderer.vue'

  defineProps({
    block: {
      type: Object,
      required: true,
    },
  })
</script>
