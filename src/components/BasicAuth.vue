<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Log in</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const username = ref('')
  const password = ref('')
  const error = ref('')
  const router = useRouter()

  // Здесь задаём "правильные" логин и пароль:
  const VALID_USERNAME = 'admin'
  const VALID_PASSWORD = '1234'

  const login = () => {
    error.value = ''

    if (username.value === VALID_USERNAME && password.value === VALID_PASSWORD) {
      const token = btoa(`${username.value}:${password.value}`)
      localStorage.setItem('authToken', token)
      router.push('/home')
    } else {
      error.value = 'Invalid username or password'
    }
  }
</script>

<style scoped>
  .login-container {
    max-width: 300px;
    margin: auto;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
</style>
Ë
