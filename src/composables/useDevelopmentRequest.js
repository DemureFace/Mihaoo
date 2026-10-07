import { computed, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { formatDevelopmentError } from '@/modules/development/development.model.js'

export function useDevelopmentRequest() {
  const store = useStore()
  const data = ref(null)
  const error = ref('')
  const errorStatus = ref(null)
  const pending = ref(false)
  const session = computed(() => store.state.auth.accessToken || '')
  let controller = null
  let generation = 0

  function clear() {
    generation += 1
    controller?.abort()
    controller = null
    data.value = null
    error.value = ''
    errorStatus.value = null
    pending.value = false
  }
  async function run(work) {
    clear()
    if (!session.value) return null
    const current = generation
    const token = session.value
    controller = new AbortController()
    const signal = controller.signal
    pending.value = true
    try {
      const result = await work(signal)
      if (signal.aborted || current !== generation || session.value !== token) return null
      data.value = result
      return result
    } catch (cause) {
      if (signal.aborted || current !== generation || session.value !== token) return null
      error.value = formatDevelopmentError(cause)
      errorStatus.value = cause?.response?.status ?? cause?.status ?? null
      return null
    } finally {
      if (current === generation) pending.value = false
    }
  }
  watch(session, clear, { flush: 'sync' })
  onDeactivated(clear)
  onBeforeUnmount(clear)
  return { data, error, errorStatus, pending, run, clear }
}
