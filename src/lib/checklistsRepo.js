// Репозиторій чеклістів із автооновленням сіду (без очищення кешу)
import { CHECKLISTS as SEED } from '@/data/checklists'

// ↑ Підвищуй це число щоразу, коли міняєш файл "@/data/checklists"
const SEED_VERSION = 3

const KEY = 'cl:defs'
const VER = 'cl:defs:ver'

// Режим оновлення при новій версії сіду:
// - 'add_only'          → додає нові зі сіду, існуючі не чіпає (безпечно для юзер-правок)
// - 'add_and_update'    → додає нові і оновлює існуючі, якщо seed свіжіший (див. compareFn)
const UPDATE_MODE = 'add_only'

// Якщо хочеш форснути оновлення без зміни версії: localStorage.setItem('cl:forceSeed', '1')
function shouldForceSeed() {
  return localStorage.getItem('cl:forceSeed') === '1'
}

export function loadChecklists() {
  const raw = localStorage.getItem(KEY)
  const stored = raw ? safeParse(raw, []) : []
  const storedVer = Number(localStorage.getItem(VER) || 0)

  // Перше відкриття або форс
  if (!stored.length || shouldForceSeed()) {
    const next = withTimestamps(SEED)
    saveChecklists(next)
    localStorage.setItem(VER, String(SEED_VERSION))
    localStorage.removeItem('cl:forceSeed') // скидаємо прапорець
    return next
  }

  // Якщо версія сіду збільшилась — запускаємо міграцію
  if (storedVer < SEED_VERSION) {
    const migrated = migrate(stored, withTimestamps(SEED))
    saveChecklists(migrated)
    localStorage.setItem(VER, String(SEED_VERSION))
    return migrated
  }

  return stored
}

export function saveChecklists(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr))
}

export function generateSlug(title) {
  const base = String(title || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
  return base || `cl-${Date.now()}`
}

function safeParse(json, fallback) {
  try { return JSON.parse(json) } catch { return fallback }
}

function withTimestamps(seed) {
  const now = new Date().toISOString()
  return seed.map(s => ({
    updatedAt: s.updatedAt || s.createdAt || now,
    createdAt: s.createdAt || now,
    ...s
  }))
}

/**
 * Міграція: додаємо нові чеклісти зі сіду,
 * а за потреби — оновлюємо існуючі (режим 'add_and_update').
 * Зіставлення — по slug.
 */
function migrate(current, seed) {
  const bySlug = Object.fromEntries(current.map(c => [c.slug, c]))
  const result = [...current]

  for (const s of seed) {
    const has = bySlug[s.slug]
    if (!has) {
      // Новий у сіді → додаємо
      result.push(s)
    } else if (UPDATE_MODE === 'add_and_update' && isSeedNewer(s, has)) {
      // Оновлюємо лише «невластиві користувачу» поля
      // (progress не тут; він у інших ключах localStorage)
      const updated = {
        ...has,
        title: s.title,
        description: s.description,
        items: s.items,
        // createdAt залишаємо старий, updatedAt — зі сіду
        updatedAt: s.updatedAt || s.createdAt || new Date().toISOString()
      }
      const idx = result.findIndex(x => x.slug === s.slug)
      result.splice(idx, 1, updated)
    }
  }

  return result
}

function isSeedNewer(seedItem, localItem) {
  const s = Date.parse(seedItem.updatedAt || seedItem.createdAt || 0)
  const l = Date.parse(localItem.updatedAt || localItem.createdAt || 0)
  return (s || 0) > (l || 0)
}
