import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

// Do not leave private roadmap data inside cached KeepAlive views.
export function useDevelopmentLifecycle(refresh, clear) {
  const store = useStore()
  const session = computed(() => store.state.auth.accessToken || '')
  let active = false
  let lastRefresh = 0
  function revalidate() {
    if (!active || !session.value || document.visibilityState === 'hidden') return
    const now = Date.now()
    if (now - lastRefresh < 1000) return
    lastRefresh = now
    void refresh()
  }
  function activate() {
    if (active) return
    active = true
    lastRefresh = 0
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    revalidate()
  }
  function deactivate() {
    active = false
    window.removeEventListener('focus', revalidate)
    document.removeEventListener('visibilitychange', revalidate)
    clear()
  }
  watch(session, () => {
    clear()
    lastRefresh = 0
    revalidate()
  }, { flush: 'sync' })
  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)
}
