<template>
  <BaseButton @click="first = true">Open first</BaseButton>
  <BaseModal v-model="first" aria-label="First">
    <BaseInput v-model="value" id="step-field" type="number" step="0.1" label="Decimal field" />
    <BaseButton @click="second = true">Open second</BaseButton>
    <p v-for="n in 25" :key="n">Fixture content {{ n }}</p>
  </BaseModal>
  <BaseModal v-model="second" aria-label="Second">
    <BaseButton @click="second = false">Done</BaseButton>
  </BaseModal>
</template>
<script setup>
  import { ref } from 'vue'
  import BaseModal from '../../src/components/base/BaseModal.vue'
  import BaseButton from '../../src/components/base/BaseButton.vue'
  import BaseInput from '../../src/components/base/BaseInput.vue'
  const first = ref(false)
  const second = ref(false)
  const value = ref('')
</script>
