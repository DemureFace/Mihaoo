<template>
  <div class="mx-auto min-w-0 w-full max-w-md">
    <h3 class="text-center text-3xl font-bold">Login</h3>
    <p
      v-if="error"
      role="alert"
      class="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <form class="mt-6 flex flex-col gap-4" @submit.prevent="onLogin">
      <BaseInput
        v-model="email"
        id="login-email"
        label="Email"
        type="email"
        autocomplete="email"
        :disabled="submitting"
        :error="errors.email"
      />
      <BaseInput
        v-model="password"
        id="login-password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :disabled="submitting"
        :error="errors.password"
      />
      <p class="text-xs leading-5 text-neutral-500">
        Forgot your password? Contact your Mihaoo administrator. Self-service reset is not available
        yet.
      </p>
      <BaseButton type="submit" variant="primary" size="lg" fullWidth :loading="submitting">
        Login
      </BaseButton>
      <div class="flex flex-wrap items-center justify-center gap-x-2 text-sm">
        <span>Don't have an account?</span>
        <BaseButton variant="link" :disabled="submitting" @click="emit('change-modal', 'signup')">
          Register
        </BaseButton>
      </div>
    </form>
  </div>
</template>
<script setup>
  defineOptions({ name: 'LoginForm' })
  import { ref } from 'vue'
  import { useStore } from 'vuex'
  import LoginValidations from '@/services/LoginValidations'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { LOGIN_ACTION } from '@/store/storeconstants'
  const emit = defineEmits(['change-modal', 'authenticated'])
  const store = useStore()
  const email = ref('')
  const password = ref('')
  const errors = ref({})
  const error = ref('')
  const submitting = ref(false)
  async function onLogin() {
    if (submitting.value) return
    errors.value = new LoginValidations(email.value, password.value).checkValidations()
    if (Object.keys(errors.value).length) return
    error.value = ''
    submitting.value = true
    try {
      await store.dispatch(`auth/${LOGIN_ACTION}`, {
        email: email.value.trim().toLowerCase(),
        password: password.value,
      })
      emit('authenticated')
    } catch (requestError) {
      error.value = requestError.message || 'Login failed. Check email or password.'
    } finally {
      submitting.value = false
    }
  }
</script>
