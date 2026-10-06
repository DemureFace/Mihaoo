import api from './api'

export const currencyService = {
  async listSites(signal) {
    const { data } = await api.get('/currency/sites', { signal, timeout: 20000 })
    if (!Array.isArray(data) || data.some((site) => typeof site !== 'string')) {
      throw new Error('Unexpected currency sites response')
    }
    return data
  },
  async convert(text, site, signal) {
    const { data } = await api.post('/currency/convert', { text, site }, { signal, timeout: 60000 })
    if (
      !data?.en ||
      typeof data.en !== 'object' ||
      Array.isArray(data.en) ||
      !data.translations ||
      typeof data.translations !== 'object' ||
      Array.isArray(data.translations)
    ) {
      throw new Error('Unexpected currency conversion response')
    }
    return data
  },
}
