  <!-- <BasicAuth v-if="!isAuthenticated" @loggedIn="isAuthenticated = true" /> -->

  <!-- <div v-else> -->
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

  <aside class="fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)]">
    <SideBar :collapsed="isCollapsed" />
  </aside>

  <main :class="mainClasses">
    <transition name="fade">
      <Suspense>
        <template #default>
          <KeepAlive>
            <router-view v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </router-view>
          </KeepAlive>
        </template>

        <template #fallback>
          <TabSkeleton />
        </template>
      </Suspense>
    </transition>
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

const TabSkeleton = {
  name: 'TabSkeleton',
  template: `
    <div class="p-6 space-y-4">
      <div class="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      <div class="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
  `,
}

const store = useStore()
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

onMounted(() => {
  // якщо треба auth — залиш
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
