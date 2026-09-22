<template>
  <Preloader />

  <Transition name="page" mode="out-in">
    <Loader v-if="showLoading" />
  </Transition>

  <TheHeader
    :collapsed="isCollapsed"
    @toggle-sidebar="isCollapsed = !isCollapsed"
    class="fixed top-0 left-0 right-0 z-50 bg-background-cardLight h-14"
  />

  <aside
    :class="[
      'fixed top-14 left-0 h-[calc(100vh-3.5rem)] transition-all duration-300',
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
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute } from 'vue-router'

  import Preloader from './components/Preloader.vue'
  import Loader from '@/components/base/BaseLoader.vue'
  import TheHeader from './components/TheHeader.vue'
  import SideBar from './components/SideBar.vue'
  import { FETCH_USER_ACTION } from '@/store/storeconstants'
  import { testService } from '@/services/test.service'

  const store = useStore()

  onMounted(async () => {
    try {
      const data = await testService.checkBackend()
      console.log('Backend connected:', data)
    } catch (error) {
      console.error('Backend connection failed:', error)
    }

    try {
      await store.dispatch(`auth/${FETCH_USER_ACTION}`)
      console.log('User restored from token')
    } catch (error) {
      console.warn('User is not authenticated')
    }
  })

  const route = useRoute()

  const showLoading = computed(() => store.state.showLoading)
  const isCollapsed = ref(false)

  const isSpecial = computed(() => {
    // підлаштуй під свої route.name
    return route.name === 'home' || route.name === 'news'
  })

  const mainClasses = computed(() => [
    isCollapsed.value ? 'ml-16' : 'ml-56',
    isSpecial.value ? 'p-0 w-full h-screen soon' : 'pt-14 p-6 rounded-3xl',
  ])
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
