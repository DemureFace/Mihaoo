<template>
  <section class="min-w-0 space-y-4">
    <header class="space-y-3">
      <h2 class="text-xl font-semibold">Мої чеклісти</h2>
      <BaseActionBar>
        <BaseInput
          v-model="q"
          id="checklist-search"
          type="search"
          label="Пошук чеклістів"
          placeholder="Пошук…"
          class="sm:max-w-sm"
        />
        <BaseButton @click="toggleSort">
          {{ sortBy === 'recent' ? 'Сортувати за створенням' : 'Сортувати за активністю' }}
        </BaseButton>
        <BaseButton variant="primary" @click="openCreate">+ Новий</BaseButton>
      </BaseActionBar>
    </header>
    <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <ChecklistCard
        v-for="cl in filtered"
        :key="cl.slug"
        :checklist="cl"
        @edit="openEdit(cl)"
        @remove="onDelete(cl)"
      />
    </div>
    <BaseModal v-model="showEditor" aria-label="Редактор чекліста">
      <ChecklistEditor v-model="showEditor" :value="editing" @save="onSave" />
    </BaseModal>
  </section>
</template>

<script setup>
  import BaseInput from '@/components/base/BaseInput.vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  import BaseActionBar from '@/components/base/BaseActionBar.vue'

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

    showEditor.value = false
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
