import {
  DevelopmentError,
  isRecord,
  validId,
} from './development.model.js'

export const IMPORT_STATUSES = Object.freeze([
  'UPLOADED',
  'PARSING',
  'REVIEW_REQUIRED',
  'READY',
  'IMPORTED',
  'FAILED',
])

function requireValue(condition, message = 'The Import API returned an unexpected response.') {
  if (!condition) throw new DevelopmentError('INVALID_RESPONSE', message)
}

function normalizeDetectedBlock(value, index) {
  requireValue(isRecord(value))

  return {
    id: validId(value.id) ? value.id : `detected_${index}`,
    title: typeof value.title === 'string' ? value.title : 'Imported block',
    sourceSheet: typeof value.sourceSheet === 'string' ? value.sourceSheet : '',
    sourceRange: typeof value.sourceRange === 'string' ? value.sourceRange : '',
    detectedType: typeof value.detectedType === 'string' ? value.detectedType : 'table',
    targetType: typeof value.targetType === 'string' ? value.targetType : value.detectedType || 'table',
    confidence: typeof value.confidence === 'number' ? Math.max(0, Math.min(1, value.confidence)) : null,
    include: value.include !== false,
    data: isRecord(value.data) ? value.data : {},
  }
}

function normalizePreview(value) {
  if (!isRecord(value) || !Array.isArray(value.pages)) return { pages: [] }

  return {
    pages: value.pages.map((page, pageIndex) => ({
      id: validId(page?.id) ? page.id : `page_${pageIndex}`,
      title: typeof page?.title === 'string' ? page.title : `Page ${pageIndex + 1}`,
      sourceSheet: typeof page?.sourceSheet === 'string' ? page.sourceSheet : '',
      sections: Array.isArray(page?.sections)
        ? page.sections.map((section, sectionIndex) => ({
            id: validId(section?.id) ? section.id : `section_${pageIndex}_${sectionIndex}`,
            title: typeof section?.title === 'string' ? section.title : 'Section',
            blocks: Array.isArray(section?.blocks)
              ? section.blocks.map(normalizeDetectedBlock)
              : [],
          }))
        : [],
    })),
  }
}

export function parseImportJob(value) {
  requireValue(isRecord(value) && validId(value.id))
  requireValue(IMPORT_STATUSES.includes(value.status))
  requireValue(typeof value.fileName === 'string')

  return {
    id: value.id,
    status: value.status,
    fileName: value.fileName,
    warnings: Array.isArray(value.warnings) ? value.warnings.filter((item) => typeof item === 'string') : [],
    error: typeof value.error === 'string' ? value.error : '',
    preview: normalizePreview(value.preview),
    roadmapId: validId(value.roadmapId) ? value.roadmapId : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
  }
}

export function validateRoadmapSpreadsheet(file) {
  if (!(file instanceof File)) {
    throw new DevelopmentError('VALIDATION', 'Choose an XLSX file.')
  }

  const name = file.name.toLowerCase()
  const maxSize = 20 * 1024 * 1024

  if (!name.endsWith('.xlsx')) {
    throw new DevelopmentError('VALIDATION', 'Only .xlsx files are supported.')
  }

  if (file.size <= 0 || file.size > maxSize) {
    throw new DevelopmentError('VALIDATION', 'The XLSX file must be smaller than 20 MB.')
  }

  return file
}

export function createDevelopmentImportClient(transport, { enabled = false } = {}) {
  function assertEnabled() {
    if (!enabled) {
      throw new DevelopmentError('NOT_READY', 'Development Import API is not connected yet.')
    }
  }

  function path(id) {
    if (!validId(id)) throw new DevelopmentError('VALIDATION', 'Invalid import ID.')
    return `/development/imports/${encodeURIComponent(id)}`
  }

  return {
    async upload(file, { roadmapId = null, signal } = {}) {
      assertEnabled()
      validateRoadmapSpreadsheet(file)

      if (roadmapId !== null && !validId(roadmapId)) {
        throw new DevelopmentError('VALIDATION', 'Invalid roadmap ID.')
      }

      const form = new FormData()
      form.append('file', file)
      if (roadmapId) form.append('roadmapId', roadmapId)

      const response = await transport.request({
        method: 'post',
        url: '/development/imports',
        data: form,
        timeout: 120_000,
        signal,
      })

      return parseImportJob(response.data)
    },

    async get(id, { signal } = {}) {
      assertEnabled()
      const response = await transport.request({
        method: 'get',
        url: path(id),
        timeout: 45_000,
        signal,
      })
      return parseImportJob(response.data)
    },

    async confirm(id, payload, { signal } = {}) {
      assertEnabled()

      if (!isRecord(payload) || !Array.isArray(payload.pages)) {
        throw new DevelopmentError('VALIDATION', 'Invalid import mapping.')
      }

      const response = await transport.request({
        method: 'post',
        url: `${path(id)}/confirm`,
        data: payload,
        timeout: 120_000,
        signal,
      })

      return parseImportJob(response.data)
    },
  }
}
