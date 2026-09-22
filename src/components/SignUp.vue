<template>
  <div class="mx-auto w-full max-w-md">
    <h3 class="text-3xl font-bold text-center text-weather-primary">Registration</h3>
    <div v-if="error" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>
    <form class="mt-8 flex flex-col gap-4" @submit.prevent="onSignup">
      <BaseInput
        v-model="email"
        id="signup-email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />

      <BaseInput
        v-model="password"
        id="signup-password"
        label="Password"
        type="password"
        autocomplete="new-password"
        :error="errors.password"
        hint="Minimum 8 characters. Use Hebrew letters and special characters only."
      />

      <div class="flex justify-between mt-4">
        <div>
          <BaseCheckbox v-model="termsAccepted" id="signup-terms">
            I agree to the terms & conditions
          </BaseCheckbox>

          <p v-if="errors.terms" class="mt-1 text-xs font-medium text-red-600">
            {{ errors.terms }}
          </p>
        </div>
      </div>

      <BaseButton type="submit" variant="primary" size="lg" fullWidth>Register</BaseButton>

      <div class="mt-4 text-center">
        <p class="font-medium text-weather-primary">
          Already have an account?

          <BaseButton type="button" variant="link" @click="$emit('change-modal', 'login')">
            Login
          </BaseButton>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
  import SignupValidations from '@/services/SignupValidations'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseCheckbox from '@/components/base/BaseCheckbox.vue'

  import { mapActions, mapMutations } from 'vuex'
  import { SIGNUP_ACTION, LOADING_SPINNER_SHOW_MUTATION } from '@/store/storeconstants'

  export default {
    components: {
      BaseInput,
      BaseButton,
      BaseCheckbox,
    },

    emits: ['change-modal', 'authenticated'],

    data() {
      return {
        email: '',
        password: '',
        termsAccepted: false,
        errors: {},
        error: '',
      }
    },

    methods: {
      ...mapActions('auth', {
        signup: SIGNUP_ACTION,
      }),

      ...mapMutations({
        showLoading: LOADING_SPINNER_SHOW_MUTATION,
      }),

      async onSignup() {
        const validations = new SignupValidations(this.email.trim(), this.password)

        this.errors = validations.checkValidations()

        if (!this.termsAccepted) {
          this.errors.terms = 'Please accept the terms & conditions'
        }

        if (Object.keys(this.errors).length) {
          return
        }

        this.error = ''
        this.showLoading(true)

        try {
          await this.signup({
            email: this.email.trim().toLowerCase(),
            password: this.password,
          })

          this.$router.push('/analytics/tasks')
        } catch (error) {
          this.error = error?.response?.data?.message || error?.message || 'Registration failed'
        } finally {
          this.showLoading(false)
        }
      },
    },
  }
</script>
