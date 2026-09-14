import api from './api'

export const mapsService = {
  getMaps() {
    return api.get('/maps')
  },

  getMap(id) {
    return api.get(`/maps/${id}`)
  },

  createMap(payload) {
    return api.post('/maps', payload)
  },

  updateMap(id, payload) {
    return api.patch(`/maps/${id}`, payload)
  },

  deleteMap(id) {
    return api.delete(`/maps/${id}`)
  },

  duplicateMap(id) {
    return api.post(`/maps/${id}/duplicate`)
  },
}
