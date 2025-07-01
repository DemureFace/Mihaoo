<template>
  <transition name="fade-blur">
  <div class="preloader" v-if="visible">
    <h1 class="mihaoo">Mihaoo</h1>
  </div>
</transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(true)

onMounted(() => {
  // Сховати прелоудер через 2 секунди (можеш змінити)
  setTimeout(() => {
    visible.value = false
  }, 2000)
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  background-color: #0d0d0d;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Текст з ефектом слонової кістки і динамічною тінню */
.mihaoo {
  font-size: 52px;
  font-family: 'Dancing Script', sans-serif;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    #fff8e7 0%,
    #e6dcc7 25%,
    #fff8e7 50%,
    #e6dcc7 75%,
    #fff8e7 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ivoryGlow 4s linear infinite, shadowShift 2s ease-in-out infinite;
  position: relative;
  text-shadow: 0 0 10px rgba(255, 248, 231, 0.1);
}

/* Переливання фону слонової кістки */
@keyframes ivoryGlow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Їздить тінь: зліва направо і назад */
@keyframes shadowShift {
  0% {
    text-shadow: -5px 0 15px rgba(255, 248, 231, 0.3);
  }
  50% {
    text-shadow: 5px 0 20px rgba(255, 248, 231, 0.5);
  }
  100% {
    text-shadow: -5px 0 15px rgba(255, 248, 231, 0.3);
  }
}

/* Анімація розсіювання */
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 1s ease, filter 0.8s ease;
}

.fade-blur-leave-from {
  opacity: 1;
  filter: blur(0px);
}

.fade-blur-leave-to {
  opacity: 0;
  filter: blur(20px);
}
</style>
