<template>
  <main>
    <h1>Isolated overlay fixture</h1>
    <BaseButton @click="drawer = true">Open fixture drawer</BaseButton>
    <KeepAlive><OverlayOwner v-if="cached" /></KeepAlive>
    <button id="deactivate" @click="cached = false">Deactivate cached owner</button>
    <aside
      v-if="drawer"
      ref="surface"
      role="dialog"
      aria-modal="true"
      aria-label="Fixture drawer"
      tabindex="-1"
    >
      <OverlayOwner />
    </aside>
  </main>
</template>
<script setup>
  import { ref } from 'vue'
  import BaseButton from '../../src/components/base/BaseButton.vue'
  import { useModalLayer } from '../../src/composables/useModalLayer.js'
  import OverlayOwner from './OverlayOwner.vue'
  const cached = ref(true)
  const drawer = ref(false)
  const surface = ref(null)
  useModalLayer({
    open: drawer,
    surface,
    close: () => {
      drawer.value = false
    },
  })
</script>
