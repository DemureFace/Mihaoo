<template>
  <section v-if="map" class="flex flex-col gap-4 h-[calc(100vh-7rem)] min-h-[650px]">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button type="button" class="p-2 rounded-xl hover:bg-black/5" @click="goBack">
          <ArrowLeftIcon class="w-5 h-5" />
        </button>

        <div>
          <input
            v-model="title"
            class="bg-transparent text-xl font-bold outline-none"
            @input="markChanged"
          />

          <div class="mt-0.5 flex items-center gap-2 text-xs text-black/40">
            <span>
              {{ nodes.length }}
              nodes
            </span>

            <span>·</span>

            <span>
              {{ edges.length }}
              connections
            </span>

            <span>·</span>

            <span class="uppercase font-semibold">
              {{ mapStatus }}
            </span>
          </div>
        </div>
      </div>

      <div class="text-sm font-semibold">
        <span v-if="saveStatus === 'saved'" class="text-green-600">✓ Saved</span>

        <span v-else-if="saveStatus === 'saving'" class="text-blue-600">Saving...</span>

        <span v-else-if="saveStatus === 'unsaved'" class="text-orange-500">Unsaved changes</span>

        <span v-else class="text-red-600">Save failed</span>
      </div>
    </div>

    <!-- Toolbar -->
    <MapToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :can-duplicate="!!selectedNode"
      :can-delete="!!selectedNode || !!selectedEdge"
      @undo="handleUndo"
      @redo="handleRedo"
      @fit-view="handleFitView"
      @duplicate-selection="handleDuplicate"
      @delete-selection="handleDeleteSelection"
      @import-json="handleImport"
      @export-json="handleExport"
      @duplicate-map="handleDuplicateMap"
      @settings="settingsOpen = true"
      @save="save"
    />

    <!-- Workspace -->
    <div class="flex-1 min-h-0 flex gap-4">
      <MapNodePalette @add-node="handleAddNode" />

      <MapCanvas
        ref="canvasRef"
        v-model:nodes="nodes"
        v-model:edges="edges"
        @connect="handleConnect"
        @drop-node="handleDropNode"
        @select-node="selectNode"
        @select-edge="selectEdge"
        @clear-selection="clearSelection"
        @node-drag-stop="handleNodeDragStop"
      />

      <MapPropertiesPanel
        :node="selectedNode"
        :edge="selectedEdge"
        @update-node="handleNodeUpdate"
        @update-edge="handleEdgeUpdate"
        @delete-edge="handleDeleteEdge"
      />
    </div>

    <MapSettingsModal
      v-model="settingsOpen"
      :title="title"
      :description="description"
      :status="mapStatus"
      @save="handleSettingsSave"
    />
  </section>

  <div v-else class="min-h-[400px] flex flex-col items-center justify-center">
    <h1 class="text-xl font-bold">Map not found</h1>

    <BaseButton class="mt-4 px-4 py-2" @click="goBack">Back to Maps</BaseButton>
  </div>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

  import { useStore } from 'vuex'

  import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'

  import MapCanvas from '@/components/maps/MapCanvas.vue'
  import MapToolbar from '@/components/maps/MapToolbar.vue'
  import MapNodePalette from '@/components/maps/MapNodePalette.vue'
  import MapPropertiesPanel from '@/components/maps/MapPropertiesPanel.vue'
  import MapSettingsModal from '@/components/maps/MapSettingsModal.vue'

  import { useMapEditor } from '@/composables/useMapEditor'

  import { useMapHistory } from '@/composables/useMapHistory'

  import { createMapExport, downloadMapExport, readMapImport } from '@/utils/mapFile'

  const route = useRoute()

  const router = useRouter()

  const store = useStore()

  const canvasRef = ref(null)

  const settingsOpen = ref(false)

  const saveStatus = ref('saved')

  const title = ref('')

  const description = ref('')

  const mapStatus = ref('draft')

  let autosaveTimer = null
  let savePromise = null

  const map = computed(() => store.getters['maps/mapById'](route.params.id))

  const {
    nodes,
    edges,

    selectedNode,
    selectedEdge,

    loadMap,
    restoreSnapshot,

    addNode,
    duplicateNode,
    updateNode,
    deleteNode,

    selectNode,
    selectEdge,
    clearSelection,

    updateEdge,
    deleteEdge,

    addConnection,

    getSnapshot,
  } = useMapEditor()

  const {
    canUndo,
    canRedo,

    resetHistory,
    checkpoint,

    undo,
    redo,
  } = useMapHistory()

  onMounted(() => {
    if (map.value) {
      title.value = map.value.title

      description.value = map.value.description || ''

      mapStatus.value = map.value.status || 'draft'

      loadMap(map.value)

      resetHistory(getSnapshot())
    }

    window.addEventListener('keydown', handleKeydown)

    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    clearTimeout(autosaveTimer)

    window.removeEventListener('keydown', handleKeydown)

    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  function markChanged() {
    saveStatus.value = 'unsaved'

    clearTimeout(autosaveTimer)

    autosaveTimer = setTimeout(() => {
      save()
    }, 1200)
  }

  async function save() {
    if (!map.value) {
      return false
    }

    clearTimeout(autosaveTimer)

    if (savePromise) {
      return savePromise
    }

    saveStatus.value = 'saving'

    savePromise = (async () => {
      try {
        const snapshot = getSnapshot()

        await store.dispatch('maps/updateMap', {
          ...map.value,

          title: title.value.trim() || 'Untitled Map',

          description: description.value,

          status: mapStatus.value,

          nodes: snapshot.nodes,

          edges: snapshot.edges,
        })

        saveStatus.value = 'saved'

        return true
      } catch (error) {
        console.error('Failed to save map:', error)

        saveStatus.value = 'error'

        return false
      } finally {
        savePromise = null
      }
    })()

    return savePromise
  }

  function handleAddNode(type) {
    addNode(type)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleDropNode({ type, position }) {
    addNode(type, position)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleConnect(connection) {
    addConnection(connection)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleNodeDragStop() {
    checkpoint(getSnapshot())

    markChanged()
  }

  function handleNodeUpdate({ id, patch }) {
    updateNode(id, patch)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleEdgeUpdate({ id, patch }) {
    updateEdge(id, patch)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleDeleteEdge(id) {
    deleteEdge(id)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleDuplicate() {
    if (!selectedNode.value) {
      return
    }

    duplicateNode(selectedNode.value.id)

    checkpoint(getSnapshot())

    markChanged()
  }

  function handleDeleteSelection() {
    if (selectedNode.value) {
      deleteNode(selectedNode.value.id)

      checkpoint(getSnapshot())

      markChanged()

      return
    }

    if (selectedEdge.value) {
      handleDeleteEdge(selectedEdge.value.id)
    }
  }

  function handleUndo() {
    const snapshot = undo()

    if (!snapshot) return

    restoreSnapshot(snapshot)

    markChanged()
  }

  function handleRedo() {
    const snapshot = redo()

    if (!snapshot) return

    restoreSnapshot(snapshot)

    markChanged()
  }

  function handleFitView() {
    canvasRef.value?.fitMap()
  }

  function handleSettingsSave(settings) {
    title.value = settings.title

    description.value = settings.description

    mapStatus.value = settings.status

    markChanged()
  }

  function handleExport() {
    const snapshot = getSnapshot()

    const payload = createMapExport({
      title: title.value,

      description: description.value,

      type: map.value?.type,

      status: mapStatus.value,

      nodes: snapshot.nodes,

      edges: snapshot.edges,
    })

    downloadMapExport(payload)
  }

  async function handleImport(file) {
    const confirmed = window.confirm('Replace the current map content with this JSON file?')

    if (!confirmed) {
      return
    }

    try {
      const imported = await readMapImport(file)

      title.value = imported.title

      description.value = imported.description

      mapStatus.value = imported.status

      restoreSnapshot({
        nodes: imported.nodes,

        edges: imported.edges,
      })

      checkpoint(getSnapshot())

      markChanged()

      setTimeout(() => {
        handleFitView()
      }, 50)
    } catch (error) {
      console.error(error)

      window.alert(error.message || 'Failed to import map.')
    }
  }

  async function handleDuplicateMap() {
    const saved = await save()

    if (!saved) {
      return
    }

    const copy = await store.dispatch('maps/duplicateMap', map.value.id)

    router.push({
      name: 'map-edit',

      params: {
        id: copy.id,
      },
    })
  }

  function isTyping(event) {
    const tag = event.target?.tagName

    return (
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable
    )
  }

  function handleKeydown(event) {
    const modifier = event.ctrlKey || event.metaKey

    const key = event.key.toLowerCase()

    if (modifier && key === 's') {
      event.preventDefault()

      save()

      return
    }

    if (isTyping(event)) {
      return
    }

    if (modifier && key === 'z' && !event.shiftKey) {
      event.preventDefault()

      handleUndo()

      return
    }

    if (modifier && (key === 'y' || (event.shiftKey && key === 'z'))) {
      event.preventDefault()

      handleRedo()

      return
    }

    if (modifier && key === 'd') {
      event.preventDefault()

      handleDuplicate()

      return
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()

      handleDeleteSelection()
    }
  }

  function handleBeforeUnload(event) {
    if (saveStatus.value === 'saved') {
      return
    }

    event.preventDefault()

    event.returnValue = ''
  }

  onBeforeRouteLeave(async () => {
    clearTimeout(autosaveTimer)

    if (saveStatus.value === 'saved') {
      return true
    }

    const saved = await save()

    if (saved) {
      return true
    }

    return window.confirm('The map could not be saved. Leave anyway?')
  })

  function goBack() {
    router.push({
      name: 'maps',
    })
  }
</script>
