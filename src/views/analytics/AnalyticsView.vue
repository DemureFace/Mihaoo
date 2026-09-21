<template>
  <section class="min-w-0 px-4 py-5 md:px-7 md:py-6">
    <header class="mb-[18px]">
      <h1 class="m-0 text-3xl font-bold tracking-[-0.02em] text-black">Аналітика</h1>

      <p class="mt-1 text-sm text-neutral-500">
        {{ subtitle }}
      </p>
    </header>

    <AnalyticsFilters />

    <RouterView />
  </section>
</template>

<script setup>
  import { computed } from 'vue'

  import { RouterView, useRoute } from 'vue-router'

  import AnalyticsFilters from '@/components/analytics/AnalyticsFilters.vue'

  const route = useRoute()

  const subtitle = computed(() => {
    if (route.name === 'analytics-report') {
      return 'Виконані задачі та SP за вибраний період'
    }

    return 'Усі задачі команди — фільтруються, відкриваються та створюються'
  })
</script>
