import api from './api'

export const checklistsService = {
  async list(signal) {
    const { data } = await api.get('/checklists', { signal, timeout: 20000 })
    if (!Array.isArray(data)) throw new Error('Unexpected checklists response')
    for (const checklist of data) {
      if (
        !Number.isInteger(checklist.id) ||
        typeof checklist.title !== 'string' ||
        !Array.isArray(checklist.items) ||
        checklist.items.some((item) => typeof item.id !== 'string' || typeof item.text !== 'string')
      ) {
        throw new Error('Unexpected checklist record')
      }
    }
    return data
  },
  async submit(id, answers) {
    const { data } = await api.post(
      `/checklists/${id}/completions`,
      { answers },
      { timeout: 20000 },
    )
    if (!Number.isInteger(data?.id)) throw new Error('Unexpected checklist completion response')
    return data
  },
}
