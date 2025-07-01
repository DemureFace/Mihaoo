<script setup>
import { useJcParser } from '@/components/mixins/useJcParser'
import { ref, onMounted } from 'vue'

const showAuthModal = ref(false)
const username = ref('')
const password = ref('')
const basicToken = ref('')

// Проверяем, есть ли уже сохранённый токен в localStorage
onMounted(() => {
  const savedToken = localStorage.getItem('basicAuthToken')
  if (savedToken) {
    basicToken.value = savedToken
    showAuthModal.value = false
  } else {
    showAuthModal.value = true
  }
})

function login() {
  basicToken.value = btoa(`${username.value}:${password.value}`)
  localStorage.setItem('basicAuthToken', basicToken.value)
  showAuthModal.value = false
  // fetchData() — если нужно сразу делать запросы
}

function logout() {
  localStorage.removeItem('basicAuthToken')
  basicToken.value = ''
  username.value = ''
  password.value = ''
  showAuthModal.value = true
}

// Для запросов
function fetchData() {
  fetch('https://winorio.realtime.p6m.tech/rts-admin-panel', {
    headers: {
      'Authorization': `Basic ${basicToken.value}`
    }
  })
    .then(r => r.json())
    .then(data => {
      // handle data
    })
}


const { input, cmsCode, cmsCodeSr, parseJC } = useJcParser()

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
}
</script>


<template>
    <div v-if="showAuthModal" class="modal">
    <input v-model="username" placeholder="Логин" />
    <input v-model="password" placeholder="Пароль" type="password" />
    <button @click="login">Войти</button>
  </div>
  <div v-else>
    <button @click="logout" class="logout-btn">Выйти</button>

  <div class="max-w-5xl mx-auto p-4 space-y-4">
    <textarea
      v-model="input"
      class="text-gray-200 w-full border p-2 rounded min-h-[180px] font-mono"
      placeholder="Встав сюди ВСЮ задачу JC"
    ></textarea>
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      @click="parseJC"
    >
      Парсити і згенерувати шаблон
    </button>

    <div v-if="cmsCode" class="mt-6">

<div class="flex gap-8">
    <div>
      <div class="flex items-center mb-1">
        <span class="font-bold text-lg mr-2">JC</span>
        <button
          @click="copyToClipboard(cmsCode)"
          class="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          Копировать
        </button>
      </div>
      <pre class="bg-gray-900 text-green-400 p-3 rounded whitespace-pre-wrap text-xs">{{ cmsCode }}</pre>
    </div>
    <div>
      <div class="flex items-center mb-1">
        <span class="font-bold text-lg mr-2">SR</span>
        <button
          @click="copyToClipboard(cmsCodeSr)"
          class="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          Копировать
        </button>
      </div>
      <pre class="bg-gray-900 text-green-400 p-3 rounded whitespace-pre-wrap text-xs">{{ cmsCodeSr }}</pre>
    </div>
  </div>
  </div>
  </div>
  </div>
</template>
