<template>
  <div
    class="w-full h-full bg-white rounded-2xl overflow-hidden border border-black/10"
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
  >
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :min-zoom="0.2"
      :max-zoom="2"
      :nodes-draggable="!readonly"
      :nodes-connectable="!readonly"
      :elements-selectable="!readonly"
      fit-view-on-init
      @connect="handleConnect"
      @node-click="handleNodeClick"
      @edge-click="handleEdgeClick"
      @pane-click="handlePaneClick"
      @node-drag-stop="handleNodeDragStop"
    >
      <template #node-mihaoo="nodeProps">
        <MapNode v-bind="nodeProps" />
      </template>

      <Background :gap="20" :size="1" />

      <MiniMap pannable zoomable />

      <Controls />
    </VueFlow>
  </div>
</template>

<script setup>
  import { nextTick } from 'vue'

  import { VueFlow, useVueFlow } from '@vue-flow/core'

  import { Background } from '@vue-flow/background'

  import { Controls } from '@vue-flow/controls'

  import { MiniMap } from '@vue-flow/minimap'

  import MapNode from './MapNode.vue'

  const nodes = defineModel('nodes', {
    type: Array,
    default: () => [],
  })

  const edges = defineModel('edges', {
    type: Array,
    default: () => [],
  })

  const props = defineProps({
    readonly: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'connect',
    'select-node',
    'select-edge',
    'clear-selection',
    'node-drag-stop',
    'drop-node',
  ])

  const { screenToFlowCoordinate, fitView } = useVueFlow()

  function handleConnect(connection) {
    if (props.readonly) return

    emit('connect', connection)
  }

  function handleNodeClick(event) {
    if (props.readonly) return

    emit('select-node', event.node.id)
  }

  function handleEdgeClick(event) {
    if (props.readonly) return

    emit('select-edge', event.edge.id)
  }

  function handlePaneClick() {
    if (props.readonly) return

    emit('clear-selection')
  }

  function handleNodeDragStop() {
    if (props.readonly) return

    emit('node-drag-stop')
  }

  function handleDragOver(event) {
    if (props.readonly) return

    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event) {
    if (props.readonly) return

    const type = event.dataTransfer.getData('application/mihaoo-node')

    if (!type) return

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    emit('drop-node', {
      type,
      position,
    })
  }

  async function fitMap() {
    await nextTick()

    fitView({
      padding: 0.2,
      duration: 300,
    })
  }

  defineExpose({
    fitMap,
  })
</script>
