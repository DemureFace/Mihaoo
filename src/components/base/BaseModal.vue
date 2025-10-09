<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-show="modalActive"
        class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4"
        @click.self="$emit('close-modal')"
        role="dialog"
        aria-modal="true"
      >
        <Transition name="modal-inner">
          <div
            v-if="modalActive"
            class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-2xl border-2 border-black mt-24"
          >
            <button
              type="button"
              class="absolute top-2 right-2 rounded px-2 py-1 hover:bg-gray-100"
              @click="$emit('close-modal')"
              aria-label="Close"
            >
              ✕
            </button>

            <div class="p-6">
              <slot />
              <div class="mt-4 flex justify-end">
                <button class="border rounded px-4 py-2" @click="$emit('close-modal')">Close</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modalActive: { type: Boolean, default: false },
})
const emit = defineEmits(['close-modal'])

function handleEsc(e) {
  if (e.key === 'Escape') emit('close-modal')
}

onMounted(() => window.addEventListener('keydown', handleEsc))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEsc))

// блокування скролу фону
watch(() => props.modalActive, (on) => {
  document.body.style.overflow = on ? 'hidden' : ''
})
</script>

<style scoped>
.modal-outer-enter-active,
.modal-outer-leave-active { transition: opacity .25s ease; }
.modal-outer-enter-from,
.modal-outer-leave-to { opacity: 0; }

.modal-inner-enter-active,
.modal-inner-leave-active { transition: transform .25s ease, opacity .25s ease; }
.modal-inner-enter-from { transform: translateY(6px) scale(.98); opacity: 0; }
.modal-inner-leave-to   { transform: translateY(6px) scale(.98); opacity: 0; }
</style>
