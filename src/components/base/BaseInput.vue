<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    class="base-input"
    @input="$emit('update:modelValue', $event.target.value)"
    v-bind="$attrs"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
});
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-input {
  display: block;
  margin: 0.5rem auto;
  padding: 0.5rem;
  width: 200px;
}
</style>
