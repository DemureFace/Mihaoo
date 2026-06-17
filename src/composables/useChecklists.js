import { ref, computed } from 'vue'
import { loadChecklists, saveChecklists, generateSlug } from '@/lib/checklistsRepo'

const state = ref(loadChecklists())

export function useChecklists() {
  const all = computed(() => state.value)

  function create({ title, description, items }) {
    const now = new Date().toISOString()
    let slug = generateSlug(title)
    let i = 1
    while (state.value.some(c => c.slug === slug)) slug = `${slug}-${i++}`

    const entry = { slug, title, description, items, createdAt: now, updatedAt: now }
    state.value = [entry, ...state.value]
    saveChecklists(state.value)
    return entry
  }

  function update(slug, patch) {
    const idx = state.value.findIndex(c => c.slug === slug)
    if (idx === -1) return null
    const prev = state.value[idx]
    const next = { ...prev, ...patch, updatedAt: new Date().toISOString() }
    state.value.splice(idx, 1, next)
    saveChecklists(state.value)
    return next
  }

  function remove(slug) {
    state.value = state.value.filter(c => c.slug !== slug)
    saveChecklists(state.value)
  }

  function findBySlug(slug) {
    return state.value.find(c => c.slug === slug) || null
  }

  return { all, create, update, remove, findBySlug }
}
