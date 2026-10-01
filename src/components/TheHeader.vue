<template>
  <header
    class="flex h-14 items-center justify-between border-b border-black/10 bg-surface-primary px-4 text-dark"
  >
    <div class="flex items-center">
      <BaseButton
        type="button"
        variant="plain"
        class="mr-4 p-2"
        aria-label="Toggle sidebar"
        @click="emit('toggle-sidebar')"
      >
        <ChevronDoubleLeftIcon v-if="!props.collapsed" class="h-6 w-6" />

        <ChevronDoubleRightIcon v-else class="h-6 w-6" />
      </BaseButton>

      <div class="flex items-center gap-2">
        <img src="/src/assets/images/logo.png" width="28" height="28" alt="Mihaoo" />

        <h1 class="text-xl font-bold">Mihaoo</h1>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <template v-if="isAuthenticated">
        <div
          class="hidden items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 sm:flex"
        >
          <UserCircleIcon class="h-5 w-5 text-neutral-500" />

          <span class="max-w-56 truncate text-sm font-medium text-black">
            {{ user.email }}
          </span>
        </div>

        <BaseButton size="sm" variant="secondary" @click="handleLogout">
          <ArrowRightStartOnRectangleIcon class="h-4 w-4" />

          <span class="hidden sm:inline">Logout</span>
        </BaseButton>
      </template>

      <BaseButton v-else size="sm" variant="primary" @click="openAuthModal('login')">
        Login
      </BaseButton>
    </div>

    <BaseModal v-model="modalActive">
      <component
        :is="modalComponent"
        v-if="modalComponent"
        @change-modal="currentModalComponent = $event"
        @authenticated="handleAuthenticated"
      />
    </BaseModal>
  </header>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'

  import { useStore } from 'vuex'

  import { useRoute, useRouter } from 'vue-router'

  import {
    ArrowRightStartOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    UserCircleIcon,
  } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import Login from '@/components/Login.vue'
  import SignUp from '@/components/SignUp.vue'

  import { LOGOUT_ACTION } from '@/store/storeconstants'

  const props = defineProps({
    collapsed: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['toggle-sidebar'])

  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const currentModalComponent = ref(null)
  const modalActive = ref(false)

  const user = computed(() => {
    return store.state.auth.user
  })

  const isAuthenticated = computed(() => {
    return Boolean(store.state.auth.accessToken && store.state.auth.user)
  })

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

  function openAuthModal(component) {
    currentModalComponent.value = component

    modalActive.value = true
  }

  function closeAuthModal() {
    modalActive.value = false
    currentModalComponent.value = null
  }

  async function handleAuthenticated() {
    closeAuthModal()

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null

    if (redirect) {
      await router.replace(redirect)

      return
    }

    if (route.query.auth) {
      const query = {
        ...route.query,
      }

      delete query.auth
      delete query.redirect

      await router.replace({
        path: route.path,
        query,
      })
    }
  }

  async function handleLogout() {
    await store.dispatch(`auth/${LOGOUT_ACTION}`)

    closeAuthModal()

    await router.replace('/dashboard')
  }

  watch(
    () => route.query.auth,
    (authMode) => {
      if (authMode === 'login' && !isAuthenticated.value) {
        openAuthModal('login')
      }
    },
    {
      immediate: true,
    },
  )
</script>
