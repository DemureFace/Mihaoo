<template>
  <header class="p-4 bg-surface-primary text-dark flex items-center justify-between">
    <div class="flex items-center">
      <BaseButton type="button" @click="emit('toggle-sidebar')" class="p-2 mr-4 transition">
        <ChevronDoubleLeftIcon v-if="!props.collapsed" class="w-6 h-6" />
        <ChevronDoubleRightIcon v-else class="w-6 h-6" />
      </BaseButton>
      <div class="flex items-center gap-2">
        <img src="/src/assets/images/logo.png" width="28px" alt="" />
        <h1 class="text-xl font-bold">Mihaoo</h1>
      </div>
    </div>
    <div class="">
      <BaseButton class="py-1.5 px-4" @click="toggleModal('login')">Login</BaseButton>
    </div>
    <BaseModal :modalActive="modalActive" @close-modal="modalActive = false">
      <component tag="a" :is="modalComponent" @change-modal="currentModalComponent = $event" />
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
  const modalActive = ref(null)

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
