import api from './api'

export const tournamentTemplatesService = {
  async generateNetwork(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate', payload, {
      signal,
    })

    return data
  },

  async generateNetworkText(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate/text', payload, {
      signal,
      responseType: 'text',
    })

    return data
  },

  async generateNetworkSnippetsText(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate/snippet/text', payload, {
      signal,
      responseType: 'text',
    })

    return data
  },

  async generateNetworkLocalesText(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate/locales/text', payload, {
      signal,
      responseType: 'text',
    })

    return data
  },

  async generateOrdinary(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate/ordinary', payload, {
      signal,
    })

    return data
  },

  async generateOrdinaryText(payload, signal) {
    const { data } = await api.post('/tournament-templates/generate/ordinary/text', payload, {
      signal,
      responseType: 'text',
    })

    return data
  },
}
