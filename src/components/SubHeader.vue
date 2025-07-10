<template>
  <div class="sub-header">
    <BaseButton
      :class="{ active: currentTab === 'tournaments' }"
      @click="$emit('change-tab', 'tournaments')"
    >
      Tournament
    </BaseButton>
    <BaseButton :class="{ active: currentTab === 'promo' }" @click="$emit('change-tab', 'promo')">
      Promo
    </BaseButton>
  </div>
</template>

<script setup>
 import BaseButton from './base/BaseButton.vue'


  defineProps({
    currentTab: {
      type: String,
      required: true,
    },
  })
</script>

<style scoped>

</style>
