<template>
  <nav aria-label="Development sections" class="flex min-w-0 flex-wrap gap-2">
    <BaseButton
      v-for="item in items"
      :key="item.name"
      :variant="isActive(item) ? 'primary' : 'secondary'"
      :to="item.to"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      {{ item.label }}
    </BaseButton>
  </nav>
</template>

<script setup>
  import { useRoute } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'

  const route = useRoute()

  const items = [
    {
      name: 'roadmaps',
      label: 'Roadmaps',
      to: { name: 'development-roadmaps' },
      match: (value) => value.startsWith('/development/roadmaps'),
    },
    {
      name: 'templates',
      label: 'Templates',
      to: { name: 'development-templates' },
      match: (value) => value.startsWith('/development/templates'),
    },
    {
      name: 'imports',
      label: 'Imports',
      to: { name: 'development-imports' },
      match: (value) => value.startsWith('/development/imports'),
    },
  ]

  function isActive(item) {
    return item.match(route.path)
  }
</script>
