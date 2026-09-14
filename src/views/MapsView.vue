<template>
  <section class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-3xl font-bold">Maps</h1>

        <p class="mt-1 text-sm text-black/50">
          Create and manage interactive maps, roadmaps and process flows.
        </p>
      </div>

      <BaseButton class="px-5 py-2.5" @click="openTemplatePicker">
        <PlusIcon class="w-5 h-5" />

        New Map
      </BaseButton>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-3 bg-white rounded-2xl border border-black/10 p-3">
      <div class="relative flex-1 max-w-md">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30"
        />

        <input
          v-model="search"
          type="search"
          placeholder="Search maps..."
          class="w-full border border-black/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black/30"
        />
      </div>

      <select v-model="status" class="border border-black/10 rounded-xl px-4 py-2.5 outline-none">
        <option value="all">All statuses</option>

        <option value="draft">Draft</option>

        <option value="active">Active</option>

        <option value="completed">Completed</option>

        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- Empty -->
    <MapEmptyState v-if="!maps.length" @create="openTemplatePicker" />

    <!-- No search result -->
    <div v-else-if="!filteredMaps.length" class="py-20 text-center text-black/50">
      No maps found.
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <MapCard
        v-for="map in filteredMaps"
        :key="map.id"
        :map="map"
        @open="openMap"
        @duplicate="duplicateMap"
        @delete="deleteMap"
      />
    </div>
  </section>
  <MapTemplatePicker v-model="templatePickerOpen" @select="createMap" />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import MapCard from '@/components/maps/MapCard.vue'
  import MapEmptyState from '@/components/maps/MapEmptyState.vue'
  import MapTemplatePicker from '@/components/maps/MapTemplatePicker.vue'

  import { buildMapFromTemplate } from '@/data/mapTemplates'

  const store = useStore()
  const router = useRouter()

  const search = ref('')
  const status = ref('all')

  const maps = computed(() => store.getters['maps/allMaps'])
  const templatePickerOpen = ref(false)

  const filteredMaps = computed(() => {
    const query = search.value.trim().toLowerCase()

    return maps.value.filter((map) => {
      const matchesSearch =
        !query ||
        map.title.toLowerCase().includes(query) ||
        map.description?.toLowerCase().includes(query)

      const matchesStatus = status.value === 'all' || map.status === status.value

      return matchesSearch && matchesStatus
    })
  })

  function openTemplatePicker() {
    templatePickerOpen.value = true
  }

  async function createMap(templateId) {
    const template = buildMapFromTemplate(templateId)

    const map = await store.dispatch('maps/createMap', template)

    router.push({
      name: 'map-edit',

      params: {
        id: map.id,
      },
    })
  }

  function openMap(map) {
    router.push({
      name: 'map-view',
      params: {
        id: map.id,
      },
    })
  }

  async function duplicateMap(map) {
    await store.dispatch('maps/duplicateMap', map.id)
  }

  async function deleteMap(map) {
    const confirmed = window.confirm(`Delete "${map.title}"?`)

    if (!confirmed) return

    await store.dispatch('maps/deleteMap', map.id)
  }
</script>
