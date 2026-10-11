<template>
  <BaseButton @click="first = true">Open first</BaseButton>
  <BaseModal v-model="first" aria-label="First">
    <p id="field-context">Synthetic field description</p>
    <BaseInput
      v-model="value"
      id="step-field"
      type="number"
      step="0.1"
      label="Decimal field"
      hint="Use decimal values"
      aria-describedby="field-context"
    />
    <BaseSelect
      v-model="selection"
      id="error-select"
      label="Select fixture"
      :options="[{ value: 'one', label: 'One' }]"
      error="Synthetic select error"
      aria-describedby="field-context"
    />
    <BaseTextarea
      v-model="text"
      id="error-textarea"
      label="Textarea fixture"
      error="Synthetic textarea error"
      aria-describedby="field-context"
    />
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
  import BaseSelect from '../../src/components/base/BaseSelect.vue'
  import BaseTextarea from '../../src/components/base/BaseTextarea.vue'
  const first = ref(false)
  const second = ref(false)
  const value = ref('')
  const selection = ref('one')
  const text = ref('')
</script>
