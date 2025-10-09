<template>
  <section>
    <div class="mb-4 flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold">Мої чеклісти</h2>
      <div class="flex items-center gap-2 text-sm">
        <button class="btn" @click="toggleSort">
          {{ sortBy === 'recent' ? 'Сортувати за створенням' : 'Сортувати за активністю' }}
        </button>
        <input
          v-model="q"
          type="search"
          placeholder="Пошук за назвою/описом…"
          class="border rounded-xl px-3 py-2 text-sm outline-none"
        />
      </div>
    </div>

    <div class="grid">
      <ChecklistCard v-for="cl in filtered" :key="cl.slug" :checklist="cl" />
    </div>
  </section>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import ChecklistCard from '@/components/ChecklistCard.vue'
  import { CHECKLISTS } from '@/data/checklists'
  import { getLastFilledAt } from '@/lib/storage'
  console.log('ChecklistCard import =', ChecklistCard)

  const q = ref('')
  const sortBy = ref('recent') // 'recent' | 'created'

  const withDerived = computed(() =>
    CHECKLISTS.map((c) => ({ ...c, lastFilledAt: getLastFilledAt(c.slug) })),
  )

  const filtered = computed(() => {
    const term = q.value.trim().toLowerCase()
    let list = withDerived.value
    if (term) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term),
      )
    }
    list = [...list].sort((a, b) => {
      if (sortBy.value === 'recent') {
        const aT = a.lastFilledAt ? +new Date(a.lastFilledAt) : 0
        const bT = b.lastFilledAt ? +new Date(b.lastFilledAt) : 0
        return bT - aT
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt)
    })
    return list
  })

  function toggleSort() {
    sortBy.value = sortBy.value === 'recent' ? 'created' : 'recent'
  }
</script>

<style scoped>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.5rem 0.75rem;
    background: #fff;
  }
  .btn:hover {
    background: #f3f4f6;
  }
</style>
