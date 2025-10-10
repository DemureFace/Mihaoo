<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-show="open"
        class="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex justify-center items-center p-4"
        @click.self="close()"
        role="dialog"
        aria-modal="true"
      >
        <Transition name="modal-inner">
          <div
            v-if="open"
            class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-2xl border-2 border-black"
          >
            <button
              type="button"
              class="absolute top-2 right-2 rounded px-2 py-1 hover:bg-gray-100"
              @click.stop="close()"
              aria-label="Close"
            >
              ✕
            </button>

            <div class="p-6">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { computed, onMounted, onBeforeUnmount, watch } from 'vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: undefined },
    modalActive: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:modelValue', 'close-modal'])

  const open = computed(() =>
    typeof props.modelValue === 'boolean' ? props.modelValue : props.modalActive,
  )

  function close() {
    emit('update:modelValue', false)
    emit('close-modal')
  }
  function onEsc(e) {
    if (e.key === 'Escape') close()
  }

  onMounted(() => window.addEventListener('keydown', onEsc))
  onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))

  watch(open, (on) => {
    document.body.style.overflow = on ? 'hidden' : ''
  })
</script>

<style scoped>
  .modal-outer-enter-active,
  .modal-outer-leave-active {
    transition: opacity 0.25s ease;
  }
  .modal-outer-enter-from,
  .modal-outer-leave-to {
    opacity: 0;
  }
  .modal-inner-enter-active,
  .modal-inner-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .modal-inner-enter-from,
  .modal-inner-leave-to {
    transform: translateY(10px) scale(0.98);
    opacity: 0;
  }
</style>
