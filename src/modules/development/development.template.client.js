import {
  DevelopmentError,
  isDateOnly,
  isRecord,
  parseRoadmapDetail,
  validId,
} from './development.model.js'

function requireValue(condition, message = 'The Templates API returned an unexpected response.') {
  if (!condition) throw new DevelopmentError('INVALID_RESPONSE', message)
}

function parseTemplate(value) {
  requireValue(isRecord(value) && validId(value.id))
  requireValue(typeof value.title === 'string' && value.title.trim().length > 0)
  requireValue(typeof value.description === 'string')
  requireValue(Number.isInteger(value.version) && value.version >= 1)
  requireValue(typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)))

  return {
    id: value.id,
    title: value.title,
    description: value.description,
    version: value.version,
    updatedAt: value.updatedAt,
  }
}

function parseTemplateList(value) {
  requireValue(isRecord(value) && Array.isArray(value.items))

  return {
    items: value.items.map(parseTemplate),
    total: Number.isInteger(value.total) ? value.total : value.items.length,
  }
}

export function createDevelopmentTemplateClient(transport, { enabled = false } = {}) {
  function assertEnabled() {
    if (!enabled) {
      throw new DevelopmentError('NOT_READY', 'Development Templates API is not connected yet.')
    }
  }

  function templatePath(id) {
    if (!validId(id)) throw new DevelopmentError('VALIDATION', 'Invalid template ID.')
    return `/development/templates/${encodeURIComponent(id)}`
  }

  return {
    async list({ signal } = {}) {
      assertEnabled()
      const response = await transport.request({
        method: 'get',
        url: '/development/templates',
        timeout: 45_000,
        signal,
      })
      return parseTemplateList(response.data)
    },

    async createFromRoadmap(roadmapId, input, { signal } = {}) {
      assertEnabled()
      if (!validId(roadmapId)) throw new DevelopmentError('VALIDATION', 'Invalid roadmap ID.')

      const title = typeof input?.title === 'string' ? input.title.trim() : ''
      const description = typeof input?.description === 'string' ? input.description.trim() : ''

      if (!title || title.length > 160 || description.length > 1000) {
        throw new DevelopmentError('VALIDATION', 'Enter a valid template title and description.')
      }

      const response = await transport.request({
        method: 'post',
        url: '/development/templates',
        data: { roadmapId, title, description },
        timeout: 45_000,
        signal,
      })

      return parseTemplate(response.data)
    },

    async instantiate(templateId, input, { signal } = {}) {
      assertEnabled()

      const title = typeof input?.title === 'string' ? input.title.trim() : ''
      const startDate = input?.startDate || null
      const endDate = input?.endDate || null
      const requestId = input?.requestId

      if (!title || title.length > 160 || !validId(requestId)) {
        throw new DevelopmentError('VALIDATION', 'Enter a roadmap title.')
      }

      if (
        (startDate !== null && !isDateOnly(startDate)) ||
        (endDate !== null && !isDateOnly(endDate)) ||
        (startDate && endDate && startDate > endDate)
      ) {
        throw new DevelopmentError('VALIDATION', 'Use valid roadmap dates.')
      }

      const response = await transport.request({
        method: 'post',
        url: `${templatePath(templateId)}/roadmaps`,
        data: { title, startDate, endDate, requestId },
        timeout: 60_000,
        signal,
      })

      return parseRoadmapDetail(response.data)
    },
  }
}
