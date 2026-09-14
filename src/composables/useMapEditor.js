import {
  computed,
  ref,
  toRaw,
} from 'vue'

export function useMapEditor() {
  const nodes = ref([])
  const edges = ref([])

  const selectedNodeId = ref(null)
  const selectedEdgeId = ref(null)
  const selectedEdge = computed(() => {
  if (!selectedEdgeId.value) {
    return null
  }

  return (
    edges.value.find(
      (edge) =>
        edge.id === selectedEdgeId.value,
    ) || null
  )
})

  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null

    return nodes.value.find(
      (node) => node.id === selectedNodeId.value,
    ) || null
  })

  function loadMap(map) {
  nodes.value = cloneSerializable(
    map?.nodes || [],
  )

  edges.value = cloneSerializable(
    map?.edges || [],
  )

  selectedNodeId.value = null
}

  function addNode(type = 'step', position = null) {
  const index = nodes.value.length

  const node = {
    id: crypto.randomUUID(),

    type: 'mihaoo',

    position:
      position || {
        x: 100 + (index % 4) * 260,
        y:
          100 +
          Math.floor(index / 4) * 180,
      },

    data: {
      type,
      title: getDefaultTitle(type),
      description: '',
      status: 'draft',
      owner: '',
      dueDate: '',
      url: '',
    },
  }

  nodes.value.push(node)

  selectedNodeId.value = node.id
  selectedEdgeId.value = null

  return node
}

  function duplicateNode(id) {
  const source = nodes.value.find(
    (node) => node.id === id,
  )

  if (!source) return

  const copy = cloneSerializable(source)

  copy.id = crypto.randomUUID()

  copy.position = {
    x: source.position.x + 40,
    y: source.position.y + 40,
  }

  copy.data.title = `${source.data.title} Copy`

  nodes.value.push(copy)

  selectedNodeId.value = copy.id
}

  function updateNode(id, patch) {
    const node = nodes.value.find(
      (node) => node.id === id,
    )

    if (!node) return

    node.data = {
      ...node.data,
      ...patch,
    }
  }

  function deleteNode(id) {
    nodes.value = nodes.value.filter(
      (node) => node.id !== id,
    )

    edges.value = edges.value.filter(
      (edge) =>
        edge.source !== id &&
        edge.target !== id,
    )

    if (selectedNodeId.value === id) {
      selectedNodeId.value = null
    }
  }

  function selectNode(id) {
  selectedNodeId.value = id
  selectedEdgeId.value = null
}
function selectEdge(id) {
  selectedEdgeId.value = id
  selectedNodeId.value = null
}

  function clearSelection() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}


  function addConnection(connection) {
    if (!connection.source || !connection.target) {
      return
    }

    const alreadyExists = edges.value.some(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target,
    )

    if (alreadyExists) return

    edges.value.push({
      id: crypto.randomUUID(),

      source: connection.source,
      target: connection.target,

      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,

      type: 'smoothstep',
    })
  }

  function getSnapshot() {
  return {
    nodes: cloneSerializable(nodes.value),
    edges: cloneSerializable(edges.value),
  }
}

function restoreSnapshot(snapshot) {
  nodes.value =
    cloneSerializable(
      snapshot?.nodes || [],
    )

  edges.value =
    cloneSerializable(
      snapshot?.edges || [],
    )

  selectedNodeId.value = null
}

function updateEdge(id, patch) {
  const edge = edges.value.find(
    (edge) => edge.id === id,
  )

  if (!edge) return

  Object.assign(edge, patch)
}

function deleteEdge(id) {
  edges.value = edges.value.filter(
    (edge) => edge.id !== id,
  )

  if (
    selectedEdgeId.value === id
  ) {
    selectedEdgeId.value = null
  }
}

  return {
    nodes,
    edges,

    selectedNodeId,
    selectedNode,

    loadMap,
    restoreSnapshot,

    addNode,
    duplicateNode,
    updateNode,
    deleteNode,

    selectNode,
    clearSelection,
selectedEdgeId,
selectedEdge,

selectEdge,
updateEdge,
deleteEdge,
    addConnection,

    getSnapshot,
  }

}

function cloneSerializable(value) {
  if (value === undefined || value === null) {
    return value
  }

  return JSON.parse(
    JSON.stringify(toRaw(value)),
  )
}

function getDefaultTitle(type) {
  const titles = {
    step: 'New Step',
    milestone: 'New Milestone',
    decision: 'New Decision',
    service: 'New Service',
    database: 'New Database',
    person: 'New Person',
    document: 'New Document',
    risk: 'New Risk',
    note: 'New Note',
  }

  return titles[type] || 'New Node'
}
