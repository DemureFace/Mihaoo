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
          placeholder="Пошук…"
          class="border rounded-xl px-3 py-2 text-sm outline-none"
        />
        <button class="btn bg-gray-900 text-white" @click="openCreate">+ Новий</button>
      </div>
    </div>

    <div class="grid">
      <div v-for="cl in filtered" :key="cl.slug" class="relative">
        <ChecklistCard :checklist="cl" />
        <div class="absolute top-2 right-2 flex gap-1">
          <button class="px-2 py-1 text-xs border rounded bg-white" @click.stop="openEdit(cl)">
            Редагувати
          </button>
          <button class="px-2 py-1 text-xs border rounded bg-white" @click.stop="onDelete(cl)">
            Видалити
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <BaseModal :modal-active="showEditor" @close-modal="showEditor = false">
      <ChecklistEditor :value="editing" @save="onSave" />
    </BaseModal>
  </section>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import ChecklistCard from '@/components/ChecklistCard.vue'
  import ChecklistEditor from '@/components/ChecklistEditor.vue'
  import { getLastFilledAt } from '@/lib/storage'
  import { useChecklists } from '@/composables/useChecklists'
  const { all } = useChecklists()

  const withDerived = computed(() =>
    all.value.map((c) => ({ ...c, lastFilledAt: getLastFilledAt(c.slug) })),
  )

  const q = ref('')
  const sortBy = ref('recent')
  const showEditor = ref(false)
  const editing = ref(null)

  const { create, update, remove } = useChecklists()

  function openCreate() {
    editing.value = null
    showEditor.value = true
  }
  function openEdit(cl) {
    editing.value = cl
    showEditor.value = true
  }

  function onSave(payload) {
    if (editing.value) {
      update(editing.value.slug, payload)
    } else {
      create(payload)
    }
  }

  function onDelete(cl) {
    if (confirm(`Видалити "${cl.title}"?`)) {
      remove(cl.slug)
    }
  }

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
        const at = a.lastFilledAt ? +new Date(a.lastFilledAt) : 0
        const bt = b.lastFilledAt ? +new Date(b.lastFilledAt) : 0
        return bt - at
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
