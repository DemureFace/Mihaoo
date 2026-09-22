<template>
  <div class="mx-auto w-full max-w-md">
    <h3 class="text-center text-3xl font-bold text-weather-primary">Login</h3>

    <div v-if="error" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="onLogin">
      <BaseInput
        v-model="email"
        id="login-email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />

      <BaseInput
        v-model="password"
        id="login-password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
      />

      <div class="flex items-center justify-between gap-4">
        <BaseButton type="button" variant="link" disabled>Forgot Password?</BaseButton>
      </div>

      <BaseButton type="submit" variant="primary" size="lg" fullWidth>Login</BaseButton>

      <div class="text-center">
        <p class="font-medium text-weather-primary">
          Don't have an account?

          <BaseButton type="button" variant="link" @click="$emit('change-modal', 'signup')">
            Register
          </BaseButton>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapMutations } from 'vuex'
  import LoginValidations from '@/services/LoginValidations'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { LOADING_SPINNER_SHOW_MUTATION, LOGIN_ACTION } from '@/store/storeconstants'

  export default {
    components: {
      BaseInput,
      BaseButton,
    },

    data() {
      return {
        email: '',
        password: '',
        errors: {},
        error: '',
      }
    },

    methods: {
      ...mapActions('auth', {
        login: LOGIN_ACTION,
      }),

      ...mapMutations({
        showLoading: LOADING_SPINNER_SHOW_MUTATION,
      }),

      async onLogin() {
        const validations = new LoginValidations(this.email, this.password)

        this.errors = validations.checkValidations()

        if (Object.keys(this.errors).length) {
          return
        }

        this.error = ''
        this.showLoading(true)

        try {
          await this.login({
            email: this.email.trim().toLowerCase(),
            password: this.password,
          })

          this.$router.push('/analytics/tasks')
        } catch (e) {
          this.error =
            e?.response?.data?.message || e?.message || 'Login failed. Check email or password.'
        } finally {
          this.showLoading(false)
        }
      },
    },
  }
</script>
