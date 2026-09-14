<template>
  <div
    class="min-h-[360px] border-2 border-dashed border-black/10 rounded-3xl flex flex-col items-center justify-center text-center p-8"
  >
    <MapIcon class="w-12 h-12 text-black/30" />

    <h2 class="mt-4 text-xl font-bold">No maps yet</h2>

    <p class="mt-2 max-w-md text-sm text-black/50">
      Create your first interactive map for a process, roadmap, architecture or release flow.
    </p>

    <BaseButton class="mt-6 px-5 py-2.5" @click="$emit('create')">Create Map</BaseButton>
  </div>
</template>

<script setup>
  import { MapIcon } from '@heroicons/vue/24/outline'
  import BaseButton from '@/components/base/BaseButton.vue'

  defineEmits(['create'])
</script>
