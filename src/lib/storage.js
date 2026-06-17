export function getProgress(slug) {
  try { return JSON.parse(localStorage.getItem(`cl:${slug}:progress`) || '[]') } catch { return [] }
  }
  export function setProgress(slug, ids) {
  localStorage.setItem(`cl:${slug}:progress`, JSON.stringify(ids))
  }
  export function getLastFilledAt(slug) {
  return localStorage.getItem(`cl:${slug}:lastFilledAt`)
  }
  export function touchLastFilledAt(slug) {
  localStorage.setItem(`cl:${slug}:lastFilledAt`, new Date().toISOString())
  }
  export function resetAll(slug) {
  localStorage.removeItem(`cl:${slug}:progress`)
  localStorage.removeItem(`cl:${slug}:lastFilledAt`)
  }
