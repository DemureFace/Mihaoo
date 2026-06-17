<template>
  <div class="w-80">
    <h3 class="text-3xl font-bold text-center text-weather-primary">Registration</h3>
    <div v-if="error" class="error bg-red-500">{{ error }}</div>
    <form @submit.prevent="onSignup()">
      <BaseInput
        icon="fa-user"
        v-model:inputValue="username"
        id="username"
        label="Username"
        type="text"
        :error="errors.username"
      />

      <BaseInput
        icon="fa-envelope"
        v-model:inputValue="email"
        id="email"
        label="Email"
        type="email"
        :error="errors.email"
      />

      <BaseInput
        icon="fa-lock"
        v-model:inputValue="password"
        id="password"
        label="Password"
        type="password"
        :error="errors.password"
      />

      <div class="flex justify-between mt-4">
        <label class="text-base">
          <input type="checkbox" id="checkbox" />
          I agree to the
          <BaseButton tag="a" class="font-semibold">terms & conditions</BaseButton>
        </label>
      </div>

      <BaseButton class="w-full p-3 mt-4 font-semibold text-xl">Register</BaseButton>

      <div class="mt-4 text-center">
        <p class="font-medium text-weather-primary">
          Already have an account?

          <BaseButton tag="a" class="" @click="$emit('change-modal', 'login')">Login</BaseButton>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
  import SignupValidations from '@/services/SignupValidations'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'

  import { mapActions, mapMutations } from 'vuex'
  import { SIGNUP_ACTION, LOADING_SPINNER_SHOW_MUTATION } from '@/store/storeconstants'

  export default {
    components: {
      BaseInput,
      BaseButton,
    },

    data() {
      return {
        username: '',
        email: '',
        password: '',
        errors: {},
        error: '',
      }
    },

    props: {
      openRegistrationModal: {
        type: Function,
        required: false,
      },
    },

    methods: {
      ...mapActions('auth', {
        signup: SIGNUP_ACTION,
      }),

      ...mapMutations({
        showLoading: LOADING_SPINNER_SHOW_MUTATION,
      }),

      async onSignup() {
        const validations = new SignupValidations(
          this.email.trim(),
          this.password,
          this.username.trim(),
        )

        this.errors = validations.checkValidations()

        if (Object.keys(this.errors).length) {
          return
        }

        this.error = ''
        this.showLoading(true)

        try {
          await this.signup({
            name: this.username.trim(),
            email: this.email.trim().toLowerCase(),
            password: this.password,
          })

          this.$router.push('/posts')
        } catch (error) {
          this.error = error?.response?.data?.message || error?.message || 'Registration failed'
        } finally {
          this.showLoading(false)
        }
      },
    },
  }
</script>
