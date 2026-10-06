<template>
  <Preloader />

  <Transition name="page" mode="out-in">
    <Loader v-if="showLoading" />
  </Transition>

  <TheHeader
    :collapsed="isCollapsed"
    :mobile="isMobile"
    :sidebar-open="mobileSidebarOpen"
    class="fixed left-0 right-0 top-0 z-50 h-14"
    @toggle-sidebar="toggleSidebar"
  />

  <Transition name="sidebar-overlay">
    <button
      v-if="isMobile && mobileSidebarOpen"
      type="button"
      class="fixed inset-x-0 bottom-0 top-14 z-30 rounded-none border-0 bg-black/30 hover:bg-black/30 lg:hidden"
      aria-label="Close navigation"
      @click="closeMobileSidebar"
    />
  </Transition>

  <aside
    id="app-sidebar"
    :class="sidebarClasses"
    ref="sidebar"
    :inert="isMobile && !mobileSidebarOpen"
    :aria-hidden="isMobile && !mobileSidebarOpen"
    @keydown.esc.stop="closeMobileSidebar"
    @keydown.tab="trapSidebarFocus"
  >
    <SideBar :collapsed="!isMobile && isCollapsed" @navigate="closeMobileSidebar" />
  </aside>

  <main :class="mainClasses" :inert="isMobile && mobileSidebarOpen">
    <div :class="contentClasses">
      <RouterView v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <KeepAlive>
            <Suspense>
              <component :is="Component" :key="route.fullPath" />

              <template #fallback>
                <div class="space-y-4 p-4 sm:p-6">
                  <div class="h-8 animate-pulse rounded bg-gray-200" />

                  <div class="h-4 animate-pulse rounded bg-gray-200" />

                  <div class="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

                  <div class="h-64 animate-pulse rounded bg-gray-200" />
                </div>
              </template>
            </Suspense>
          </KeepAlive>
        </Transition>
      </RouterView>
    </div>
  </main>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  import { useRoute, useRouter } from 'vue-router'

  import { useStore } from 'vuex'

  import Loader from '@/components/base/BaseLoader.vue'
  import Preloader from '@/components/Preloader.vue'
  import SideBar from '@/components/SideBar.vue'
  import TheHeader from '@/components/TheHeader.vue'

  import { AUTH_EXPIRED_EVENT } from '@/services/api'

  import { FETCH_USER_ACTION, LOGOUT_ACTION } from '@/store/storeconstants'

  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const isCollapsed = ref(false)

  const isMobile = ref(window.matchMedia('(max-width: 1023px)').matches)

  const mobileSidebarOpen = ref(false)
  const sidebar = ref(null)
  let sidebarTrigger = null

  let mobileMediaQuery = null
  let handlingAuthExpired = false

  const showLoading = computed(() => store.state.showLoading)

  const sidebarClasses = computed(() => [
    'fixed left-0 top-14 z-40 h-[calc(100dvh-3.5rem)] bg-surface-primary',
    'transition-[width,transform] duration-300 ease-in-out',

    isMobile.value ? 'w-56 shadow-xl' : isCollapsed.value ? 'w-16' : 'w-56',

    isMobile.value
      ? mobileSidebarOpen.value
        ? 'translate-x-0'
        : '-translate-x-full'
      : 'translate-x-0',
  ])

  const mainClasses = computed(() => [
    'min-w-0 min-h-dvh transition-[margin] duration-300',

    !isMobile.value ? (isCollapsed.value ? 'ml-16' : 'ml-56') : 'ml-0',

    'px-3 pb-3 pt-[70px] sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 2xl:px-8 2xl:pb-8',
  ])

  const contentClasses = 'mx-auto min-w-0 w-full max-w-[1920px]'

  function toggleSidebar() {
    if (isMobile.value) {
      mobileSidebarOpen.value = !mobileSidebarOpen.value

      return
    }

    isCollapsed.value = !isCollapsed.value
  }

  function closeMobileSidebar() {
    mobileSidebarOpen.value = false
  }

  function trapSidebarFocus(event) {
    if (!isMobile.value || !mobileSidebarOpen.value) return
    const buttons = Array.from(sidebar.value.querySelectorAll('button, a[href]')).filter(
      (element) => !element.disabled && element.getClientRects().length,
    )
    const first = buttons[0]
    const last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  function syncViewport(event) {
    isMobile.value = Boolean(event?.matches ?? mobileMediaQuery?.matches)

    if (!isMobile.value) {
      mobileSidebarOpen.value = false
    }
  }

  async function handleAuthExpired() {
    if (handlingAuthExpired) {
      return
    }

    handlingAuthExpired = true

    try {
      const requiresAuth = route.matched.some((record) => record.meta.requiresAuth)

      const redirect = route.fullPath

      await store.dispatch(`auth/${LOGOUT_ACTION}`)

      if (requiresAuth) {
        await router.replace({
          path: '/dashboard',

          query: {
            auth: 'login',
            redirect,
          },
        })
      }
    } finally {
      handlingAuthExpired = false
    }
  }

  watch(
    () => route.fullPath,
    () => {
      if (isMobile.value) {
        closeMobileSidebar()
      }
    },
  )

  watch(mobileSidebarOpen, async (isOpen) => {
    document.documentElement.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      sidebarTrigger = document.activeElement
      await nextTick()
      if (mobileSidebarOpen.value) sidebar.value?.querySelector('button')?.focus()
    } else {
      sidebarTrigger?.focus()
      sidebarTrigger = null
    }
  })

  onMounted(async () => {
    mobileMediaQuery = window.matchMedia('(max-width: 1023px)')

    syncViewport(mobileMediaQuery)

    mobileMediaQuery.addEventListener('change', syncViewport)

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)

    await store.dispatch(`auth/${FETCH_USER_ACTION}`)
  })

  onBeforeUnmount(() => {
    document.documentElement.style.overflow = ''

    mobileMediaQuery?.removeEventListener('change', syncViewport)

    window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .sidebar-overlay-enter-active,
  .sidebar-overlay-leave-active {
    transition: opacity 0.2s ease;
  }

  .sidebar-overlay-enter-from,
  .sidebar-overlay-leave-to {
    opacity: 0;
  }
</style>
