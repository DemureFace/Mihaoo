<template>
  <header
    class="flex h-14 items-center justify-between border-b border-black/10 bg-surface-primary px-3 text-dark sm:px-4"
  >
    <div class="flex min-w-0 items-center">
      <BaseButton
        type="button"
        variant="plain"
        class="mr-2 min-h-11 min-w-11 shrink-0 p-2 sm:mr-4"
        aria-controls="app-sidebar"
        :aria-expanded="props.mobile ? props.sidebarOpen : !props.collapsed"
        :aria-label="
          props.mobile
            ? props.sidebarOpen
              ? 'Close navigation'
              : 'Open navigation'
            : 'Toggle sidebar'
        "
        @click="emit('toggle-sidebar')"
      >
        <Bars3Icon v-if="props.mobile && !props.sidebarOpen" class="h-6 w-6" />

        <XMarkIcon v-else-if="props.mobile" class="h-6 w-6" />

        <ChevronDoubleLeftIcon v-else-if="!props.collapsed" class="h-6 w-6" />

        <ChevronDoubleRightIcon v-else class="h-6 w-6" />
      </BaseButton>

      <div class="flex items-center gap-2">
        <img :src="logoUrl" width="28" height="28" alt="Mihaoo" />

        <h1 class="hidden text-xl font-bold sm:block">Mihaoo</h1>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <SystemHealthIndicator />

      <template v-if="isAuthenticated">
        <div
          class="hidden items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 sm:flex"
        >
          <UserCircleIcon class="h-5 w-5 text-neutral-500" />

          <span class="max-w-40 truncate lg:max-w-56 text-sm font-medium text-black">
            {{ user.email }}
          </span>
        </div>

        <BaseButton
          size="sm"
          variant="secondary"
          class="min-h-11 min-w-11"
          aria-label="Logout"
          @click="handleLogout"
        >
          <ArrowRightStartOnRectangleIcon class="h-4 w-4" />

          <span class="hidden sm:inline">Logout</span>
        </BaseButton>
      </template>

      <BaseButton
        v-else
        size="sm"
        variant="primary"
        class="min-h-11"
        @click="openAuthModal('login')"
      >
        Login
      </BaseButton>
    </div>

    <BaseModal
      v-model="modalActive"
      :aria-label="currentModalComponent === 'signup' ? 'Register' : 'Login'"
    >
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
  import logoUrl from '@/assets/images/logo.png'

  import { useStore } from 'vuex'

  import { useRoute, useRouter } from 'vue-router'

  import {
    ArrowRightStartOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
  } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  import Login from '@/components/Login.vue'
  import SignUp from '@/components/SignUp.vue'
  import SystemHealthIndicator from '@/components/SystemHealthIndicator.vue'

  import { LOGOUT_ACTION } from '@/store/storeconstants'

  const props = defineProps({
    collapsed: {
      type: Boolean,
      default: false,
    },

    mobile: {
      type: Boolean,
      default: false,
    },

    sidebarOpen: {
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
