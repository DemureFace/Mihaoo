import api from './api'

export const promoTemplatesService = {
  async generate(payload, signal) {
    const { data } = await api.post('/bonus-templates/generate', payload, {
      signal,
    })

    return data
  },

  async generateCompactCard(payload, signal) {
    const { data } = await api.post('/bonus-templates/generate/card-compact', payload, {
      signal,
    })

    return data
  },
}
