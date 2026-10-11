<template>
  <section class="mx-auto min-w-0 max-w-6xl space-y-6">
    <header
      class="rounded-3xl border border-black/10 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-5 sm:p-8"
    >
      <p class="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Mihaoo / product journal
      </p>
      <h1 class="mt-3 text-3xl font-bold sm:text-4xl">News</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
        Оновлення інструментів, інтерфейсу та робочих сценаріїв Mihaoo.
      </p>
      <p class="mt-4 text-xs leading-5 text-neutral-500">
        Локальний редакційний журнал frontend-можливостей. Це не live API, не командні оголошення й
        не підтвердження deployment.
      </p>
    </header>
    <div class="rounded-2xl border border-black/10 p-4">
      <BaseInput
        v-model="search"
        id="news-search"
        label="Пошук оновлень"
        type="search"
        placeholder="Назва, модуль або опис…"
      />
      <BaseActionBar class="mt-4">
        <BaseButton
          v-for="item in categories"
          :key="item"
          :variant="category === item ? 'primary' : 'secondary'"
          :aria-pressed="category === item"
          @click="category = item"
        >
          {{ item }}
        </BaseButton>
      </BaseActionBar>
      <p role="status" class="mt-3 text-xs text-neutral-500">Знайдено: {{ filtered.length }}</p>
    </div>
    <div v-if="filtered.length" class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="update in filtered"
        :key="update.id"
        class="flex min-w-0 flex-col rounded-2xl border border-black/10 p-5 sm:p-6"
      >
        <div class="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span class="rounded-full bg-neutral-100 px-3 py-1">{{ update.category }}</span>
          <time :datetime="update.date">{{ formatDate(update.date) }}</time>
        </div>
        <h2 class="mt-4 text-xl font-bold leading-7">{{ update.title }}</h2>
        <p class="mt-3 flex-1 text-sm leading-7 text-neutral-600">{{ update.summary }}</p>
        <details class="mt-4 text-sm">
          <summary class="cursor-pointer rounded-lg py-2 font-semibold focus-visible:outline-2">
            Докладніше
          </summary>
          <p class="mt-2 leading-7 text-neutral-600">{{ update.details }}</p>
        </details>
        <BaseButton class="mt-4 self-start" :to="update.route">{{ update.action }}</BaseButton>
      </article>
    </div>
    <section v-else class="rounded-2xl border border-dashed border-black/20 p-8 text-center">
      <h2 class="text-lg font-semibold">Оновлень не знайдено</h2>
      <p class="mt-2 text-sm text-neutral-500">Спробуй інший запит або категорію.</p>
      <BaseButton class="mt-4" @click="reset">Скинути фільтри</BaseButton>
    </section>
  </section>
</template>
<script setup>
  import { computed, ref } from 'vue'
  import { productUpdates } from '@/data/productUpdates'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseActionBar from '@/components/base/BaseActionBar.vue'
  const search = ref('')
  const category = ref('All')
  const categories = ['All', ...new Set(productUpdates.map((update) => update.category))]
  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    return productUpdates.filter(
      (update) =>
        (category.value === 'All' || update.category === category.value) &&
        `${update.title} ${update.summary} ${update.details}`.toLowerCase().includes(term),
    )
  })
  function reset() {
    search.value = ''
    category.value = 'All'
  }
  function formatDate(value) {
    return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium' }).format(
      new Date(`${value}T12:00:00Z`),
    )
  }
</script>
