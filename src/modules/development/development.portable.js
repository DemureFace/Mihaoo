import {
  DevelopmentError,
  ROADMAP_STATUSES,
  isDateOnly,
  isRecord,
} from './development.model.js'
import { structuredCloneSafe } from './development.blocks.js'

export const DEVELOPMENT_ROADMAP_FILE_FORMAT = 'mihaoo-development-roadmap'
export const DEVELOPMENT_ROADMAP_FILE_VERSION = 1
export const DEVELOPMENT_ROADMAP_FILE_MAX_BYTES = 10 * 1024 * 1024

const MAX_PAGES = 25
const MAX_SECTIONS_PER_PAGE = 30
const MAX_BLOCKS = 300
const MAX_JSON_DEPTH = 20
const MAX_JSON_NODES = 50_000
const BLOCK_SPANS = new Set([3, 4, 6, 8, 12])
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

function fail(message) {
  throw new DevelopmentError('INVALID_ROADMAP_FILE', message)
}

function cleanString(value, max, fallback = '') {
  const result = typeof value === 'string' ? value.trim() : ''
  if (!result) return fallback
  if (result.length > max) fail(`Roadmap file contains text longer than ${max} characters.`)
  return result
}

function optionalDate(value) {
  if (value == null || value === '') return null
  if (!isDateOnly(value)) fail('Roadmap file contains an invalid date.')
  return value
}

function sanitizeJson(value, depth = 0, state = { nodes: 0 }) {
  state.nodes += 1
  if (state.nodes > MAX_JSON_NODES) fail('Roadmap file contains too much nested data.')
  if (depth > MAX_JSON_DEPTH) fail('Roadmap file is nested too deeply.')

  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('Roadmap file contains an invalid number.')
    return value
  }

  if (Array.isArray(value)) {
    if (value.length > 10_000) fail('Roadmap file contains an oversized array.')
    return value.map((item) => sanitizeJson(item, depth + 1, state))
  }

  if (!isRecord(value)) fail('Roadmap file contains unsupported data.')

  const result = Object.create(null)
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) fail('Roadmap file contains an unsafe object key.')
    result[key] = sanitizeJson(item, depth + 1, state)
  }
  return result
}

function normalizeBlock(block, order) {
  if (!isRecord(block)) fail('Roadmap file contains an invalid block.')

  const type = cleanString(block.type, 80)
  if (!type || !/^[A-Za-z0-9_:-]+$/u.test(type)) {
    fail('Roadmap file contains an invalid block type.')
  }

  const title = cleanString(block.title, 160, 'Block')
  const schemaVersion = Number.isInteger(block.schemaVersion) && block.schemaVersion >= 1
    ? block.schemaVersion
    : 1
  const span = Number(block.layout?.span)

  return {
    type,
    title,
    order,
    schemaVersion,
    layout: { span: BLOCK_SPANS.has(span) ? span : 12 },
    config: sanitizeJson(isRecord(block.config) ? block.config : {}),
    data: sanitizeJson(isRecord(block.data) ? block.data : {}),
  }
}

function normalizePages(pages) {
  if (!Array.isArray(pages) || pages.length > MAX_PAGES) {
    fail(`Roadmap file must contain no more than ${MAX_PAGES} pages.`)
  }

  let blockCount = 0

  return pages.map((page, pageIndex) => {
    if (!isRecord(page)) fail('Roadmap file contains an invalid page.')
    const sections = Array.isArray(page.sections) ? page.sections : []
    if (sections.length > MAX_SECTIONS_PER_PAGE) {
      fail(`A roadmap page must contain no more than ${MAX_SECTIONS_PER_PAGE} sections.`)
    }

    return {
      title: cleanString(page.title, 160, `Page ${pageIndex + 1}`),
      order: pageIndex,
      sections: sections.map((section, sectionIndex) => {
        if (!isRecord(section)) fail('Roadmap file contains an invalid section.')
        const blocks = Array.isArray(section.blocks) ? section.blocks : []
        blockCount += blocks.length
        if (blockCount > MAX_BLOCKS) {
          fail(`Roadmap file must contain no more than ${MAX_BLOCKS} blocks.`)
        }

        return {
          title: cleanString(section.title, 160, `Section ${sectionIndex + 1}`),
          order: sectionIndex,
          blocks: blocks.map((block, blockIndex) => normalizeBlock(block, blockIndex)),
        }
      }),
    }
  })
}

function normalizeRoadmap(value) {
  if (!isRecord(value)) fail('Roadmap file does not contain a roadmap.')

  const title = cleanString(value.title, 160)
  if (!title) fail('Roadmap file does not contain a title.')

  const description = typeof value.description === 'string' ? value.description : ''
  if (description.length > 4000) fail('Roadmap description is too long.')

  const startDate = optionalDate(value.startDate)
  const endDate = optionalDate(value.endDate)
  if (startDate && endDate && startDate > endDate) {
    fail('Roadmap end date cannot be earlier than the start date.')
  }

  return {
    title,
    description,
    status: ROADMAP_STATUSES.includes(value.status) ? value.status : 'DRAFT',
    startDate,
    endDate,
    schemaVersion: Number.isInteger(value.schemaVersion) && value.schemaVersion >= 1
      ? value.schemaVersion
      : 1,
    pages: normalizePages(value.pages),
  }
}

export function createDevelopmentRoadmapFilePayload(roadmap) {
  const normalized = normalizeRoadmap(roadmap)

  return {
    format: DEVELOPMENT_ROADMAP_FILE_FORMAT,
    formatVersion: DEVELOPMENT_ROADMAP_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      app: 'Mihaoo',
      roadmapVersion: Number.isInteger(roadmap?.version) ? roadmap.version : null,
    },
    roadmap: normalized,
  }
}

export function parseDevelopmentRoadmapFilePayload(value) {
  if (!isRecord(value)) fail('This is not a Mihaoo roadmap file.')
  if (value.format !== DEVELOPMENT_ROADMAP_FILE_FORMAT) {
    fail('This file is not a Mihaoo Development roadmap export.')
  }
  if (value.formatVersion !== DEVELOPMENT_ROADMAP_FILE_VERSION) {
    fail(`Unsupported Mihaoo roadmap file version: ${String(value.formatVersion ?? 'unknown')}.`)
  }

  const exportedAt =
    typeof value.exportedAt === 'string' && Number.isFinite(Date.parse(value.exportedAt))
      ? value.exportedAt
      : null
  const roadmap = normalizeRoadmap(value.roadmap)

  return {
    format: DEVELOPMENT_ROADMAP_FILE_FORMAT,
    formatVersion: DEVELOPMENT_ROADMAP_FILE_VERSION,
    exportedAt,
    source: isRecord(value.source) ? sanitizeJson(value.source) : {},
    roadmap,
    summary: getDevelopmentRoadmapFileSummary({ roadmap }),
  }
}

export async function readDevelopmentRoadmapFile(file) {
  if (!(file instanceof File)) {
    throw new DevelopmentError('VALIDATION', 'Choose a Mihaoo roadmap file.')
  }

  const lowerName = file.name.toLowerCase()
  const supportedName =
    lowerName.endsWith('.mihaoo-roadmap.json') ||
    lowerName.endsWith('.mihaoo-roadmap') ||
    lowerName.endsWith('.json')

  if (!supportedName) {
    throw new DevelopmentError(
      'VALIDATION',
      'Choose a .mihaoo-roadmap.json, .mihaoo-roadmap, or .json roadmap file.',
    )
  }

  if (file.size <= 0 || file.size > DEVELOPMENT_ROADMAP_FILE_MAX_BYTES) {
    throw new DevelopmentError('VALIDATION', 'Roadmap file must be smaller than 10 MB.')
  }

  let parsed
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new DevelopmentError('INVALID_ROADMAP_FILE', 'Roadmap file is not valid JSON.')
  }

  return {
    fileName: file.name,
    ...parseDevelopmentRoadmapFilePayload(parsed),
  }
}

export function getDevelopmentRoadmapFileSummary(payload) {
  const roadmap = payload?.roadmap || payload
  const pages = Array.isArray(roadmap?.pages) ? roadmap.pages : []
  const sections = pages.reduce(
    (total, page) => total + (Array.isArray(page?.sections) ? page.sections.length : 0),
    0,
  )
  const blocks = pages.reduce(
    (total, page) =>
      total +
      (Array.isArray(page?.sections)
        ? page.sections.reduce(
            (pageTotal, section) =>
              pageTotal + (Array.isArray(section?.blocks) ? section.blocks.length : 0),
            0,
          )
        : 0),
    0,
  )

  return { pages: pages.length, sections, blocks }
}

export function developmentRoadmapFileName(title) {
  const safe = String(title || 'roadmap')
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/gu, '-')
    .replace(/\s+/gu, '-')
    .replace(/-+/gu, '-')
    .replace(/^[.-]+|[.-]+$/gu, '')
    .slice(0, 100)

  return `${safe || 'roadmap'}.mihaoo-roadmap.json`
}

export function downloadDevelopmentRoadmapFile(roadmap) {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    throw new DevelopmentError('UNAVAILABLE', 'File download is not available in this environment.')
  }

  const payload = createDevelopmentRoadmapFilePayload(roadmap)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/vnd.mihaoo.roadmap+json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = developmentRoadmapFileName(payload.roadmap.title)
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)

  return {
    fileName: anchor.download,
    payload: structuredCloneSafe(payload),
  }
}
