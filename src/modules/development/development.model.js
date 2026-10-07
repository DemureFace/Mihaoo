// Draft API v1. Client validation is NOT a substitute for server authorization.
export const ROADMAP_ROLES = Object.freeze(['OWNER', 'EDITOR', 'CONTRIBUTOR', 'VIEWER'])
export const SHARE_ROLES = Object.freeze([
  { value: 'VIEWER', label: 'Viewer - read only' },
  { value: 'CONTRIBUTOR', label: 'Contributor - fill workspace fields' },
  { value: 'EDITOR', label: 'Editor - change the plan and blocks' },
])
export const ROADMAP_STATUSES = Object.freeze(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
const CAPABILITY_KEYS = ['canRead', 'canEditStructure', 'canContribute', 'canManageAccess', 'canArchive']

export class DevelopmentError extends Error {
  constructor(code, message, status = null) {
    super(message)
    this.name = 'DevelopmentError'
    this.code = code
    this.status = status
  }
}

function requireValue(condition, message = 'The Development API returned an unexpected response.') {
  if (!condition) throw new DevelopmentError('INVALID_RESPONSE', message)
}
export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
function nonEmptyString(value, max = 160) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}
export function validId(value) {
  return nonEmptyString(value, 128) && /^[A-Za-z0-9_-]+$/.test(value)
}
export function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
function optionalDate(value) {
  return value === null || isDateOnly(value)
}
export function parseCapabilities(value) {
  requireValue(isRecord(value))
  requireValue(CAPABILITY_KEYS.every((key) => typeof value[key] === 'boolean'))
  requireValue(value.canRead === true)
  return Object.fromEntries(CAPABILITY_KEYS.map((key) => [key, value[key]]))
}
export function parseRoadmapSummary(value) {
  requireValue(isRecord(value) && validId(value.id) && nonEmptyString(value.title))
  requireValue(typeof value.description === 'string' && value.description.length <= 4000)
  requireValue(ROADMAP_STATUSES.includes(value.status) && ROADMAP_ROLES.includes(value.myRole))
  requireValue(Number.isInteger(value.version) && value.version >= 1)
  requireValue(optionalDate(value.startDate) && optionalDate(value.endDate))
  requireValue(!value.startDate || !value.endDate || value.startDate <= value.endDate)
  requireValue(typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)))
  return {
    id: value.id,
    title: value.title,
    description: value.description,
    status: value.status,
    myRole: value.myRole,
    version: value.version,
    startDate: value.startDate,
    endDate: value.endDate,
    updatedAt: value.updatedAt,
    capabilities: parseCapabilities(value.capabilities),
  }
}
export function parseRoadmapList(value) {
  requireValue(isRecord(value) && Array.isArray(value.items))
  requireValue(Number.isInteger(value.total) && value.total >= 0)
  requireValue(Number.isInteger(value.page) && value.page >= 1)
  requireValue(Number.isInteger(value.pageSize) && value.pageSize >= 1 && value.pageSize <= 100)
  requireValue(value.items.length <= value.pageSize && value.total >= value.items.length)
  const items = value.items.map(parseRoadmapSummary)
  requireValue(new Set(items.map((item) => item.id)).size === items.length)
  return { items, total: value.total, page: value.page, pageSize: value.pageSize }
}
export function parseRoadmapDetail(value) {
  const summary = parseRoadmapSummary(value)
  requireValue(value.schemaVersion === 1 && Array.isArray(value.pages) && value.pages.length <= 25)
  const seen = new Set([summary.id])
  let blockCount = 0
  function identity(item) {
    requireValue(isRecord(item) && validId(item.id) && !seen.has(item.id))
    requireValue(nonEmptyString(item.title) && Number.isInteger(item.order) && item.order >= 0)
    seen.add(item.id)
  }
  const pages = value.pages.map((page) => {
    identity(page)
    requireValue(Array.isArray(page.sections) && page.sections.length <= 30)
    const sections = page.sections.map((section) => {
      identity(section)
      requireValue(Array.isArray(section.blocks))
      const blocks = section.blocks.map((block) => {
        identity(block)
        blockCount += 1
        requireValue(blockCount <= 300 && nonEmptyString(block.type, 80))
        requireValue(Number.isInteger(block.schemaVersion) && block.schemaVersion >= 1)
        requireValue(isRecord(block.layout) && [3, 4, 6, 8, 12].includes(block.layout.span))
        requireValue(isRecord(block.config) && isRecord(block.data))
        // Preserve unknown types for future read-only renderers; never execute imported HTML.
        return { ...block }
      }).sort((a, b) => a.order - b.order)
      return { id: section.id, title: section.title, order: section.order, blocks }
    }).sort((a, b) => a.order - b.order)
    return { id: page.id, title: page.title, order: page.order, sections }
  }).sort((a, b) => a.order - b.order)
  return { ...summary, schemaVersion: 1, pages }
}
export function parseMembers(value) {
  requireValue(isRecord(value) && Array.isArray(value.items))
  requireValue(Number.isInteger(value.aclVersion) && value.aclVersion >= 1)
  requireValue(value.items.length >= 1 && value.items.length <= 100)
  const ids = new Set()
  const items = value.items.map((member) => {
    requireValue(isRecord(member) && isRecord(member.user))
    requireValue(validId(member.user.id) && !ids.has(member.user.id))
    requireValue(typeof member.user.displayName === 'string' && typeof member.user.email === 'string')
    requireValue(ROADMAP_ROLES.includes(member.role))
    ids.add(member.user.id)
    return { user: { ...member.user }, role: member.role }
  })
  requireValue(items.filter((item) => item.role === 'OWNER').length === 1)
  return { aclVersion: value.aclVersion, items }
}
export function buildCreatePayload(input, requestId) {
  const title = typeof input?.title === 'string' ? input.title.trim() : ''
  const description = typeof input?.description === 'string' ? input.description.trim() : ''
  const startDate = input?.startDate || null
  const endDate = input?.endDate || null
  if (!title || title.length > 160 || description.length > 4000) {
    throw new DevelopmentError('VALIDATION', 'Enter a title (up to 160 characters) and a shorter description.')
  }
  if (!optionalDate(startDate) || !optionalDate(endDate) || (startDate && endDate && endDate < startDate)) {
    throw new DevelopmentError('VALIDATION', 'Use valid dates. The end date cannot precede the start date.')
  }
  if (!validId(requestId)) throw new DevelopmentError('VALIDATION', 'A valid request ID is required.')
  // Identity, permissions and status cannot be supplied by the create form.
  return { title, description, startDate, endDate, requestId }
}
export function formatDevelopmentError(error) {
  if (error instanceof DevelopmentError) return error.message
  const status = error?.response?.status ?? error?.status
  const messages = {
    400: 'Check the entered values.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You no longer have permission to perform this action.',
    404: 'This roadmap is unavailable or has not been shared with you.',
    409: 'The data changed in another session. Refresh before trying again.',
    413: 'This file or request is too large.',
    422: 'Check the entered values.',
    429: 'Too many requests. Wait a moment and try again.',
  }
  return messages[status] || 'The Development API is unavailable. No local fallback was used.'
}
