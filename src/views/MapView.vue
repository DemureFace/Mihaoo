<template>
  <section v-if="map" class="flex flex-col gap-4 h-[calc(100vh-7rem)]">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          {{ map.title }}
        </h1>

        <p v-if="map.description" class="mt-1 text-sm text-black/50">
          {{ map.description }}
        </p>
      </div>

      <BaseButton class="px-4 py-2" @click="edit">Edit Map</BaseButton>
    </div>

    <div class="flex-1 min-h-0">
      <MapCanvas v-model:nodes="nodes" v-model:edges="edges" readonly />
    </div>
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'

  import { useRoute, useRouter } from 'vue-router'

  import { useStore } from 'vuex'

  import BaseButton from '@/components/base/BaseButton.vue'
  import MapCanvas from '@/components/maps/MapCanvas.vue'

  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  const map = computed(() => store.getters['maps/mapById'](route.params.id))

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value))
  }

  const nodes = ref(cloneData(map.value?.nodes || []))

  const edges = ref(cloneData(map.value?.edges || []))

  function edit() {
    router.push({
      name: 'map-edit',

      params: {
        id: route.params.id,
      },
    })
  }
</script>
