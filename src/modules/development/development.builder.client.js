import {
  DevelopmentError,
  isRecord,
  parseRoadmapDetail,
  validId,
} from './development.model.js'

function persistedId(value) {
  return validId(value) && !value.startsWith('tmp_') ? value : undefined
}

function serializeBlock(block) {
  if (!isRecord(block)) throw new DevelopmentError('VALIDATION', 'Invalid block structure.')

  return {
    ...(persistedId(block.id) ? { id: block.id } : {}),
    type: block.type,
    title: block.title,
    order: block.order,
    schemaVersion: block.schemaVersion,
    layout: block.layout,
    config: block.config,
    data: block.data,
  }
}

function serializePages(pages) {
  return pages.map((page) => ({
    ...(persistedId(page.id) ? { id: page.id } : {}),
    title: page.title,
    order: page.order,
    sections: (page.sections || []).map((section) => ({
      ...(persistedId(section.id) ? { id: section.id } : {}),
      title: section.title,
      order: section.order,
      blocks: (section.blocks || []).map(serializeBlock),
    })),
  }))
}

export function createDevelopmentBuilderClient(transport, { enabled = false } = {}) {
  function assertEnabled() {
    if (!enabled) {
      throw new DevelopmentError(
        'NOT_READY',
        'Development Builder API is not connected yet.',
      )
    }
  }

  function path(id) {
    if (!validId(id)) {
      throw new DevelopmentError('VALIDATION', 'Invalid roadmap ID.')
    }

    return `/development/roadmaps/${encodeURIComponent(id)}/structure`
  }

  return {
    async saveSnapshot(id, { expectedVersion, pages }, { signal } = {}) {
      assertEnabled()

      if (!Number.isInteger(expectedVersion) || expectedVersion < 1 || !Array.isArray(pages)) {
        throw new DevelopmentError('VALIDATION', 'Invalid builder payload.')
      }

      const response = await transport.request({
        method: 'put',
        url: path(id),
        data: {
          expectedVersion,
          pages: serializePages(pages),
        },
        timeout: 60_000,
        signal,
      })

      return parseRoadmapDetail(response.data)
    },
  }
}
