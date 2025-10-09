import { CHECKLISTS as SEED } from '@/data/checklists'

const KEY = 'cl:defs'

export function loadChecklists() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    // seed only once (якщо порожньо)
    if (!parsed || !parsed.length) {
      saveChecklists(SEED)
      return [...SEED]
    }
    return parsed
  } catch {
    saveChecklists(SEED)
    return [...SEED]
  }
}

export function saveChecklists(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr))
}

export function generateSlug(title) {
  const base = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
  return base || `cl-${Date.now()}`
}
