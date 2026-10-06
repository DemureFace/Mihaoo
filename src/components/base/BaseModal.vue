<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="close"
      >
        <Transition name="modal-inner" appear>
          <div
            ref="dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="ariaLabel"
            tabindex="-1"
            class="relative max-h-[calc(100dvh-1rem)] min-w-0 w-full overflow-y-auto overscroll-contain rounded-t-2xl border-2 border-black bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl"
            @keydown="onDialogKeydown"
            :class="sizeClass"
          >
            <BaseButton
              variant="ghost"
              size="sm"
              class="absolute right-2 top-2 z-10 min-h-11 min-w-11"
              aria-label="Close"
              @click="close"
            >
              ✕
            </BaseButton>

            <div
              class="min-w-0 break-words px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-14 sm:px-6 sm:pb-6 [&_input]:min-w-0 [&_select]:min-w-0"
            >
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
  const scrollLocks = new Set()
  let previousOverflow = ''

  function lockScroll(id) {
    if (!scrollLocks.size) previousOverflow = document.body.style.overflow
    scrollLocks.add(id)
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll(id) {
    if (scrollLocks.delete(id) && !scrollLocks.size) {
      document.body.style.overflow = previousOverflow
    }
  }
</script>

<script setup>
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },

    ariaLabel: {
      type: String,
      default: 'Dialog',
    },

    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const open = computed(() => props.modelValue)
  const dialog = ref(null)
  let previousFocus = null
  const lockId = Symbol('modal')

  const sizeClass = computed(() => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
    }

    return sizes[props.size]
  })

  function close() {
    emit('update:modelValue', false)
  }

  function onDialogKeydown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      return
    }

    if (event.key !== 'Tab') return

    const elements = Array.from(
      dialog.value.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]'),
    ).filter((element) => !element.disabled && element.getClientRects().length)
    const first = elements[0]
    const last = elements.at(-1)

    if (!first) {
      event.preventDefault()
      dialog.value.focus()
    } else if (event.shiftKey && [first, dialog.value].includes(document.activeElement)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && [last, dialog.value].includes(document.activeElement)) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    open,
    async (value) => {
      if (value) {
        previousFocus = document.activeElement
        lockScroll(lockId)
        await nextTick()
        if (open.value) dialog.value?.focus()
      } else {
        unlockScroll(lockId)
        previousFocus?.focus()
        previousFocus = null
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    unlockScroll(lockId)
    previousFocus?.focus()
  })
</script>

<style scoped>
  .modal-outer-enter-active,
  .modal-outer-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-outer-enter-from,
  .modal-outer-leave-to {
    opacity: 0;
  }

  .modal-inner-enter-active,
  .modal-inner-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .modal-inner-enter-from,
  .modal-inner-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
</style>
