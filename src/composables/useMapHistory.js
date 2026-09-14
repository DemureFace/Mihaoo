import { computed, ref } from 'vue'

function cloneSnapshot(value) {
  return JSON.parse(JSON.stringify(value))
}

export function useMapHistory(limit = 100) {
  const past = ref([])
  const future = ref([])

  const canUndo = computed(() => past.value.length > 1)
  const canRedo = computed(() => future.value.length > 0)

  function resetHistory(snapshot) {
    past.value = [
      cloneSnapshot(snapshot),
    ]

    future.value = []
  }

  function checkpoint(snapshot) {
    const next = cloneSnapshot(snapshot)

    const current =
      past.value[
        past.value.length - 1
      ]

    if (
      current &&
      JSON.stringify(current) ===
        JSON.stringify(next)
    ) {
      return
    }

    past.value.push(next)

    if (past.value.length > limit) {
      past.value.shift()
    }

    future.value = []
  }

  function undo() {
    if (!canUndo.value) {
      return null
    }

    const current =
      past.value.pop()

    future.value.unshift(current)

    return cloneSnapshot(
      past.value[
        past.value.length - 1
      ],
    )
  }

  function redo() {
    if (!canRedo.value) {
      return null
    }

    const next =
      future.value.shift()

    past.value.push(
      cloneSnapshot(next),
    )

    return cloneSnapshot(next)
  }

  return {
    canUndo,
    canRedo,

    resetHistory,
    checkpoint,

    undo,
    redo,
  }
}
