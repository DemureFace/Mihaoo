<template>
  <Preloader />
  <TheHeader />
  <SubHeader :currentTab="currentTab" @change-tab="currentTab = $event" />

  <main class="tab-content">
    <transition name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentTab" />
    </transition>
  </main>
  <RouterView></RouterView>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { RouterView } from 'vue-router'
  import Preloader from './components/Preloader.vue'
  import TheHeader from './components/TheHeader.vue'
  import SubHeader from './components/SubHeader.vue'
  import PromoTool from './views/PromoView.vue'
  import TournamentsTool from './views/TournamentView.vue'

  const currentTab = ref('promo')
  const components = {
  promo: PromoTool,
  tournaments: TournamentsTool
}

const currentComponent = computed(() => components[currentTab.value])

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
