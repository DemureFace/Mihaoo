const STORAGE_KEY = 'mihaoo:maps'

function loadMaps() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load maps:', error)

    return []
  }
}

function persistMaps(maps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps))
}

export default {
  namespaced: true,

  state: () => ({
    maps: loadMaps(),
    currentMap: null,
    loading: false,
    error: null,
  }),

  getters: {
    allMaps(state) {
      return state.maps
    },

    mapById: (state) => (id) => {
      return state.maps.find((map) => map.id === id)
    },

    hasMaps(state) {
      return state.maps.length > 0
    },
  },

  mutations: {
    SET_MAPS(state, maps) {
      state.maps = maps
      persistMaps(maps)
    },

    SET_CURRENT_MAP(state, map) {
      state.currentMap = map
    },

    SET_LOADING(state, value) {
      state.loading = value
    },

    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    createMap({ state, commit }, payload) {
      const now = new Date().toISOString()

      const map = {
  id:
    crypto.randomUUID(),

  title:
    payload.title ||
    'Untitled Map',

  description:
    payload.description || '',

  type:
    payload.type || 'blank',

  status:
    'draft',

  nodes:
    payload.nodes || [],

  edges:
    payload.edges || [],

  createdAt:
    now,

  updatedAt:
    now,
}

      commit('SET_MAPS', [map, ...state.maps])

      return map
    },

    deleteMap({ state, commit }, id) {
      const maps = state.maps.filter((map) => map.id !== id)

      commit('SET_MAPS', maps)
    },

    duplicateMap({
  state,
  commit,
}, id) {
  const source =
    state.maps.find(
      (map) =>
        map.id === id,
    )

  if (!source) {
    throw new Error(
      'Map not found',
    )
  }

  const now =
    new Date()
      .toISOString()

  const copy = {
    ...JSON.parse(
      JSON.stringify(
        source,
      ),
    ),

    id:
      crypto.randomUUID(),

    title:
      `${source.title} Copy`,

    status:
      'draft',

    createdAt:
      now,

    updatedAt:
      now,
  }

  commit(
    'SET_MAPS',
    [
      copy,
      ...state.maps,
    ],
  )

  return copy
},

    updateMap({
  state,
  commit,
}, updatedMap) {
  const maps =
    state.maps.map(
      (map) =>
        map.id ===
        updatedMap.id
          ? {
              ...updatedMap,

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : map,
    )

  commit(
    'SET_MAPS',
    maps,
  )
}
  },
}
