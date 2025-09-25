<template>
  <div class="">
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

<script setup></script>

<style scoped></style>
