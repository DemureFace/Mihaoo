import {
  DevelopmentError, buildCreatePayload, parseRoadmapDetail, parseRoadmapList,
  parseMembers, validId, SHARE_ROLES,
} from './development.model.js'

// Pure factory: tests use an explicit fake transport, never a production fallback.
export function createDevelopmentClient(transport, { enabled = false } = {}) {
  const base = '/development/roadmaps'
  function path(id) {
    if (!validId(id)) throw new DevelopmentError('VALIDATION', 'Invalid roadmap ID.')
    return `${base}/${encodeURIComponent(id)}`
  }
  async function request(config, parser, signal) {
    if (!enabled) throw new DevelopmentError('NOT_READY', 'Development API is not connected yet.')
    const response = await transport.request({ ...config, timeout: 45000, signal })
    return parser(response.data)
  }
  return {
    list({ search = '', scope = 'all', page = 1, pageSize = 12, signal } = {}) {
      if (!['all', 'owned', 'shared'].includes(scope) || !Number.isInteger(page) || page < 1 ||
          !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new DevelopmentError('VALIDATION', 'Invalid list filters.')
      }
      return request({ method: 'get', url: base,
        params: { search: String(search).trim().slice(0, 160), scope, page, pageSize } }, parseRoadmapList, signal)
    },
    get(id, { signal } = {}) {
      return request({ method: 'get', url: path(id) }, parseRoadmapDetail, signal)
    },
    create(input, { requestId, signal } = {}) {
      return request({ method: 'post', url: base, data: buildCreatePayload(input, requestId) }, parseRoadmapDetail, signal)
    },
    members(id, { signal } = {}) {
      return request({ method: 'get', url: `${path(id)}/members` }, parseMembers, signal)
    },
    share(id, { email, role, expectedAclVersion }, { signal } = {}) {
      if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
          !SHARE_ROLES.some((item) => item.value === role) || !Number.isInteger(expectedAclVersion) || expectedAclVersion < 1) {
        throw new DevelopmentError('VALIDATION', 'Enter an existing user email and select an access level.')
      }
      return request({ method: 'put', url: `${path(id)}/members`,
        data: { email: email.trim(), role, expectedAclVersion } }, parseMembers, signal)
    },
    revoke(id, userId, expectedAclVersion, { signal } = {}) {
      if (!validId(userId) || !Number.isInteger(expectedAclVersion) || expectedAclVersion < 1) {
        throw new DevelopmentError('VALIDATION', 'Invalid access change.')
      }
      return request({ method: 'delete', url: `${path(id)}/members/${encodeURIComponent(userId)}`,
        data: { expectedAclVersion } }, parseMembers, signal)
    },
  }
}
