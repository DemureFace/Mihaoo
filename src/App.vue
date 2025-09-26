<template>
  <!-- <BasicAuth v-if="!isAuthenticated" @loggedIn="isAuthenticated = true" /> -->

  <!-- <div v-else> -->
  <Preloader />
  <Transition name="page" mode="out-in">
    <Loader v-if="showLoading" />
  </Transition>
  <!-- Header фіксований -->
  <TheHeader
    :collapsed="isCollapsed"
    @toggle-sidebar="isCollapsed = !isCollapsed"
    class="fixed top-0 left-0 right-0 z-50 bg-background-cardLight h-14"
  />

  <!-- Контейнер сторінки -->
  <!-- Сайдбар 25% -->
  <aside class="fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)]">
    <SideBar
      :currentTab="currentTab"
      @change-tab="currentTab = $event"
      :collapsed="isCollapsed"
      class="transition-all duration-300 ease-in-out"
    />
  </aside>

  <!-- Основний контент 75% -->
  <main :class="mainClasses">
    <transition name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentTab" :current-tab="currentTab" />
    </transition>
  </main>
  <!-- </div> -->
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'

  import Preloader from './components/Preloader.vue'
  import Loader from '@/components/base/BaseLoader.vue'
  import BasicAuth from './components/BasicAuth.vue'
  import TheHeader from './components/TheHeader.vue'
  import SubHeader from './components/SubHeader.vue'
  import PromoTool from './views/PromoView.vue'
  import TournamentsTool from './views/TournamentView.vue'
  import Dashboard from './views/DashboardView.vue'
  import News from './views/NewsView.vue'
  import SideBar from './components/SideBar.vue'
  const store = useStore()
  const showLoading = computed(() => store.state.showLoading)

  const isCollapsed = ref(false)
  const currentTab = ref('tournaments')
  const components = {
    dashboard: Dashboard,
    promo: PromoTool,
    tournaments: TournamentsTool,
    news: News,
  }
  const currentComponent = computed(() => components[currentTab.value])
  const isAuthenticated = ref(false)

  onMounted(() => {
    const token = localStorage.getItem('authToken')
    isAuthenticated.value = !!token
  })

  const isSpecial = computed(() => ['dashboard', 'news'].includes(currentTab.value))

  const mainClasses = computed(() => [
    isCollapsed.value ? 'ml-16' : 'ml-56',
    isSpecial.value ? 'p-0 w-full h-screen soon' : 'pt-14 p-6 rounded-3xl',
  ])
</script>

<style scoped>
  .tab-content {
    padding: 2rem;
  }

  /* Анимация переключения табов */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
