<template>
  <div class="mx-auto min-w-0 w-full max-w-md">
    <h3 class="text-center text-3xl font-bold">Registration</h3>
    <p
      v-if="error"
      role="alert"
      class="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSignup">
      <BaseInput
        v-model="email"
        id="signup-email"
        label="Email"
        type="email"
        autocomplete="email"
        :disabled="submitting"
        :error="errors.email"
      />
      <BaseInput
        v-model="password"
        id="signup-password"
        label="Password"
        type="password"
        autocomplete="new-password"
        :disabled="submitting"
        :error="errors.password"
        hint="Minimum 8 characters, at least one Latin letter and one special character. Latin letters, digits and special characters only."
      />
      <div>
        <BaseCheckbox v-model="termsAccepted" id="signup-terms" :disabled="submitting">
          I agree to the terms & conditions
        </BaseCheckbox>
        <p v-if="errors.terms" class="mt-1 text-xs text-red-600">{{ errors.terms }}</p>
      </div>
      <BaseButton type="submit" variant="primary" size="lg" fullWidth :loading="submitting">
        Register
      </BaseButton>
      <div class="flex flex-wrap items-center justify-center gap-x-2 text-sm">
        <span>Already have an account?</span>
        <BaseButton variant="link" :disabled="submitting" @click="emit('change-modal', 'login')">
          Login
        </BaseButton>
      </div>
    </form>
  </div>
</template>
<script setup>
  defineOptions({ name: 'SignupForm' })
  import { ref } from 'vue'
  import { useStore } from 'vuex'
  import SignupValidations from '@/services/SignupValidations'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
  import { SIGNUP_ACTION } from '@/store/storeconstants'
  const emit = defineEmits(['change-modal', 'authenticated'])
  const store = useStore()
  const email = ref('')
  const password = ref('')
  const termsAccepted = ref(false)
  const errors = ref({})
  const error = ref('')
  const submitting = ref(false)
  async function onSignup() {
    if (submitting.value) return
    errors.value = new SignupValidations(email.value.trim(), password.value).checkValidations()
    if (!termsAccepted.value) errors.value.terms = 'Please accept the terms & conditions'
    if (Object.keys(errors.value).length) return
    error.value = ''
    submitting.value = true
    try {
      await store.dispatch(`auth/${SIGNUP_ACTION}`, {
        email: email.value.trim().toLowerCase(),
        password: password.value,
      })
      emit('authenticated')
    } catch (requestError) {
      error.value = requestError.message || 'Registration failed'
    } finally {
      submitting.value = false
    }
  }
</script>
