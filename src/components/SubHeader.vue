<template>
  <div class="sub-header">
    <button :class="{ active: currentTab === 'promo' }" @click="$emit('change-tab', 'promo')">
      Promo
    </button>
    <button
      :class="{ active: currentTab === 'tournaments' }"
      @click="$emit('change-tab', 'tournaments')"
    >
      Tournament
    </button>
  </div>
</template>

<script setup>
  defineProps({
    currentTab: {
      type: String,
      required: true,
    },
  })
</script>

<style scoped>

</style>
