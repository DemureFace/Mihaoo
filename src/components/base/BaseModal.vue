<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <Transition name="modal-inner" appear>
          <div
            class="relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border-2 border-black bg-white shadow-xl"
            :class="sizeClass"
          >
            <BaseButton
              variant="ghost"
              size="sm"
              class="absolute right-2 top-2 z-10"
              aria-label="Close"
              @click="close"
            >
              ✕
            </BaseButton>

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
  import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: undefined,
    },

    // temporary backward compatibility
    modalActive: {
      type: Boolean,
      default: false,
    },

    size: {
      type: String,
      default: 'md',
    },
  })

  const emit = defineEmits(['update:modelValue', 'close-modal'])

  const open = computed(() => {
    return props.modelValue !== undefined ? props.modelValue : props.modalActive
  })

  const sizeClass = computed(() => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
    }

    return sizes[props.size] || sizes.md
  })

  function close() {
    emit('update:modelValue', false)
    emit('close-modal')
  }

  function onEsc(event) {
    if (event.key === 'Escape' && open.value) {
      close()
    }
  }

  watch(open, (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
  })

  onMounted(() => {
    window.addEventListener('keydown', onEsc)
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''

    window.removeEventListener('keydown', onEsc)
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
