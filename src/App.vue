<template>
  <Preloader />
  <TheHeader />
  <RouterView></RouterView>
</template>

<script setup>

  import { RouterView } from 'vue-router'
  import TheHeader from './components/TheHeader.vue'
  import Preloader from './components/Preloader.vue'
</script>

<style scoped></style>
