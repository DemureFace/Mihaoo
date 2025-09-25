<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-show="modalActive"
        class="absolute w-full z-51 backdrop-blur-sm h-screen top-0 left-0 flex justify-center px-8"
      >
        <Transition name="modal-inner">
          <div
            v-if="modalActive"
            class="p-10 bg-white bg-opacity-90 backdrop-blur shadow-xl self-start rounded-2xl border-2 border-black mt-32"
          >
            <BaseButton class="absolute top-2 right-2 py-1 px-2.5" @click="$emit('close-modal')">
              ✕
            </BaseButton>

            <slot />

            <BaseButton class="py-2 px-6 mt-4" @click="$emit('close-modal')">Close</BaseButton>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { onMounted, onBeforeUnmount } from 'vue'
  import BaseButton from './BaseButton.vue'

  defineProps({
    modalActive: {
      type: Boolean,
      default: false,
    },
  })
  const emit = defineEmits(['close-modal'])
  function handleEsc(e) {
    if (e.key === 'Escape') {
      emit('close-modal')
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEsc)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEsc)
  })
</script>

<style scoped>
  .modal-outer-enter-active,
  .modal-outer-leave-active {
    transition: opacity 0.5s cubic-bezier(0.52, 0.02, 0.19, 1.02);
  }

  .modal-outer-enter-from,
  .modal-outer-leave-to {
    opacity: 0;
  }

  .modal-inner-enter-active {
    transition: all 0.5s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
  }

  .modal-inner-leave-active {
    transition: all 0.5s cubic-bezier(0.52, 0.02, 0.19, 1.02);
  }

  .modal-inner-leave-to {
    transform: scale(0.8);
  }
</style>
