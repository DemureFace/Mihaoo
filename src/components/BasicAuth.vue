<template>
  <div class="login-overlay">
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <BaseInput v-model="username" placeholder="Username" />
        <BaseInput v-model="password" type="password" placeholder="Password" />
        <BaseButton type="submit">Log in</BaseButton>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
 import { useRouter } from 'vue-router'
 import BaseButton from './base/BaseButton.vue'
 import BaseInput from './base/BaseInput.vue'


const username = ref('')
const password = ref('')
const router = useRouter()
const error = ref('')
const emit = defineEmits(['loggedIn'])


const login = () => {
  error.value = ''
  if (username.value === 'admin' && password.value === '1234') {
    localStorage.setItem('authToken', btoa(`${username.value}:${password.value}`))
    emit('loggedIn')
    router.push('/home')
  } else {
    error.value = 'Invalid username or password'
  }

}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-box {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
}
.login-box input {
  display: block;
  margin: 0.5rem auto;
  padding: 0.5rem;
  width: 200px;
}
.error {
  color: red;
}
</style>
