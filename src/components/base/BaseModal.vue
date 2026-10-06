<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-if="visible"
        :style="{ zIndex }"
        class="fixed inset-0 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="isTop && close()"
      >
        <Transition name="modal-inner" appear>
          <div
            ref="dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="ariaLabel"
            tabindex="-1"
            class="relative max-h-[calc(100dvh-1rem)] min-w-0 w-full overflow-y-auto overscroll-contain [overflow-wrap:anywhere] rounded-t-2xl border-2 border-black bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl"
            :class="sizeClass"
          >
            <div class="sticky top-0 z-10 flex justify-end bg-white/95 p-2">
              <BaseButton
                variant="ghost"
                size="sm"
                class="min-h-11 min-w-11"
                aria-label="Close"
                @click="close"
              >
                ✕
              </BaseButton>
            </div>

            <div
              class="min-w-0 break-words px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 sm:px-6 sm:pb-6 [&_input]:min-w-0 [&_select]:min-w-0"
            >
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useModalLayer } from '@/composables/useModalLayer'

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
  const { visible, zIndex, isTop } = useModalLayer({ open, surface: dialog, close })

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
