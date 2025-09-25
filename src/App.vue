<template>
  <BasicAuth v-if="!isAuthenticated" @loggedIn="isAuthenticated = true" />

  <div v-else>
    <Preloader />
    <TheHeader class="bg-background-cardLight" />
    <!-- <SubHeader :currentTab="currentTab" @change-tab="currentTab = $event" /> -->

    <!-- Контейнер з flex -->
    <div class="flex w-full">
      <!-- Сайдбар 25% -->
      <SideBar class="w-2/12" />

      <!-- Основний контент 75% -->
      <main class="tab-content w-10/12">
        <transition name="fade" mode="out-in">
          <component :is="currentComponent" :key="currentTab" />
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Preloader from './components/Preloader.vue'
import BasicAuth from './components/BasicAuth.vue'
import TheHeader from './components/TheHeader.vue'
import SubHeader from './components/SubHeader.vue'
import PromoTool from './views/PromoView.vue'
import TournamentsTool from './views/TournamentView.vue'
import SideBar from './components/SideBar.vue'

const currentTab = ref('tournaments')
const components = {
  promo: PromoTool,
  tournaments: TournamentsTool,
}
const currentComponent = computed(() => components[currentTab.value])
const isAuthenticated = ref(false)

onMounted(() => {
  const token = localStorage.getItem('authToken')
  isAuthenticated.value = !!token
})
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
