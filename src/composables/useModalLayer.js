import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  ref,
  shallowRef,
  watch,
} from 'vue'

// One ownership stack for drawers and teleported dialogs, including cached views.
const layers = shallowRef([])
let savedOverflow = null
const inertBefore = new Map()
const focusSelector = 'button, a[href], input, select, textarea, [tabindex]'

function restoreInert() {
  for (const [element, inert] of inertBefore) element.inert = inert
  inertBefore.clear()
}

function syncBackground() {
  restoreInert()
  const top = layers.value.at(-1)
  if (!top) return
  const allowed = [top.surface.value, top.backdrop?.value, ...top.extraElements()].filter(Boolean)
  function visit(element) {
    if (!(element instanceof HTMLElement) || ['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName))
      return
    if (allowed.includes(element)) return
    if (allowed.some((surface) => element.contains(surface))) {
      for (const child of element.children) visit(child)
    } else {
      inertBefore.set(element, element.inert)
      element.inert = true
    }
  }
  for (const element of document.body.children) visit(element)
}

function focusables(layer) {
  const elements = [
    ...layer.surface.value.querySelectorAll(focusSelector),
    ...layer.extraElements(),
  ]
  return elements.filter(
    (element) =>
      element &&
      !element.disabled &&
      element.tabIndex >= 0 &&
      !element.closest('[inert]') &&
      element.getClientRects().length,
  )
}

function onKeydown(event) {
  const top = layers.value.at(-1)
  if (!top?.surface.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopImmediatePropagation()
    top.close()
  } else if (event.key === 'Tab') {
    const elements = focusables(top)
    const first = elements[0]
    const last = elements.at(-1)
    const current = document.activeElement
    if (!first) {
      event.preventDefault()
      top.surface.value.focus()
    } else if (event.shiftKey && (current === first || !elements.includes(current))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (current === last || !elements.includes(current))) {
      event.preventDefault()
      first.focus()
    }
  }
}

function onFocusin(event) {
  const top = layers.value.at(-1)
  if (!top?.surface.value) return
  if (!top.surface.value.contains(event.target) && !top.extraElements().includes(event.target)) {
    top.surface.value.focus()
  }
}

function addLayer(layer) {
  if (layers.value.includes(layer)) return
  if (!layers.value.length) {
    savedOverflow = [document.documentElement.style.overflow, document.body.style.overflow]
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown, true)
    document.addEventListener('focusin', onFocusin, true)
  }
  layers.value = [...layers.value, layer]
  syncBackground()
  layer.surface.value.focus()
}

function removeLayer(layer) {
  if (!layers.value.includes(layer)) return
  const wasTop = layers.value.at(-1) === layer
  layers.value = layers.value.filter((item) => item !== layer)
  syncBackground()
  if (!layers.value.length) {
    document.documentElement.style.overflow = savedOverflow[0]
    document.body.style.overflow = savedOverflow[1]
    savedOverflow = null
    document.removeEventListener('keydown', onKeydown, true)
    document.removeEventListener('focusin', onFocusin, true)
  }
  if (wasTop) {
    const target = layer.previousFocus
    if (target?.isConnected && !target.closest('[inert]') && target.getClientRects().length) {
      target.focus()
    } else {
      layers.value.at(-1)?.surface.value?.focus()
    }
  }
}

export function useModalLayer({ open, surface, close, backdrop, extraElements = () => [] }) {
  const active = ref(true)
  const visible = computed(() => open.value && active.value)
  const layer = { surface, close, backdrop, extraElements, previousFocus: null }
  watch(
    visible,
    async (value) => {
      if (value) {
        layer.previousFocus = document.activeElement
        await nextTick()
        if (visible.value && surface.value) addLayer(layer)
      } else {
        removeLayer(layer)
      }
    },
    { immediate: true, flush: 'post' },
  )
  onActivated(() => {
    active.value = true
  })
  onDeactivated(() => {
    active.value = false
    removeLayer(layer)
    if (open.value) close()
  })
  onBeforeUnmount(() => removeLayer(layer))
  return {
    visible,
    zIndex: computed(() => 200 + Math.max(0, layers.value.indexOf(layer)) * 10),
    isTop: computed(() => layers.value.at(-1) === layer),
  }
}
