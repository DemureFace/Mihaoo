<template>
  <header class="p-4 bg-surface-primary text-dark flex items-center justify-between">
    <div class="flex items-center">
      <BaseButton
        type="button"
        variant="plain"
        class="mr-4 p-2"
        aria-label="Toggle sidebar"
        @click="emit('toggle-sidebar')"
      >
        <ChevronDoubleLeftIcon v-if="!props.collapsed" class="w-6 h-6" />
        <ChevronDoubleRightIcon v-else class="w-6 h-6" />
      </BaseButton>
      <div class="flex items-center gap-2">
        <img src="/src/assets/images/logo.png" width="28px" alt="" />
        <h1 class="text-xl font-bold">Mihaoo</h1>
      </div>
    </div>
    <div class="">
      <BaseButton size="sm" @click="toggleModal('login')">Login</BaseButton>
    </div>
    <BaseModal v-model="modalActive">
      <component :is="modalComponent" @change-modal="currentModalComponent = $event" />
    </BaseModal>
  </header>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'
  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import Login from '@/components/Login.vue'
  import SignUp from '@/components/SignUp.vue'

  const props = defineProps({
    collapsed: { type: Boolean, default: false },
  })
  const emit = defineEmits(['toggle-sidebar'])

  const currentModalComponent = ref(null)
  const modalActive = ref(false)

  const modalComponent = computed(() => {
    switch (currentModalComponent.value) {
      case 'login':
        return Login
      case 'signup':
        return SignUp
      default:
        return null
    }
  })

  const toggleModal = (component) => {
    modalActive.value = !modalActive.value
    currentModalComponent.value = component
  }
</script>
