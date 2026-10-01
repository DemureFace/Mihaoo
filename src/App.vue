<template>
  <Preloader />

  <Transition name="page" mode="out-in">
    <Loader v-if="showLoading" />
  </Transition>

  <TheHeader
    :collapsed="isCollapsed"
    class="fixed left-0 right-0 top-0 z-50 h-14 bg-background-cardLight"
    @toggle-sidebar="isCollapsed = !isCollapsed"
  />

  <aside
    :class="[
      'fixed left-0 top-14 h-[calc(100vh-3.5rem)] transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-56',
    ]"
  >
    <SideBar :collapsed="isCollapsed" />
  </aside>

  <main :class="mainClasses">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <KeepAlive>
          <Suspense>
            <component :is="Component" :key="route.fullPath" />

            <template #fallback>
              <div class="space-y-4 p-6">
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
  </main>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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

  let handlingAuthExpired = false

  const showLoading = computed(() => store.state.showLoading)

  const isSpecial = computed(() => {
    return route.name === 'home' || route.name === 'news'
  })

  const mainClasses = computed(() => [
    isCollapsed.value ? 'ml-16' : 'ml-56',

    isSpecial.value ? 'p-0 w-full h-screen soon' : 'pt-14 p-6 rounded-3xl',
  ])

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

  onMounted(async () => {
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)

    await store.dispatch(`auth/${FETCH_USER_ACTION}`)
  })

  onBeforeUnmount(() => {
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
</style>
