import { DevelopmentError } from './development.model.js'
import {
  createDevelopmentBlock,
  createDevelopmentPage,
  createDevelopmentSection,
  getDevelopmentBlockDefinition,
  structuredCloneSafe,
} from './development.blocks.js'

const STORAGE_PREFIX = 'mihaoo:development:v1'
const STORE_VERSION = 1

function nowIso() {
  return new Date().toISOString()
}

function localId(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '_')}`
}

function readStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user && typeof user === 'object' && !Array.isArray(user) ? user : null
  } catch {
    return null
  }
}

export function getLocalDevelopmentUser() {
  const user = readStoredUser()
  const identity = user?.id || user?.sub || user?.email

  if (!identity) {
    throw new DevelopmentError(
      'AUTH_REQUIRED',
      'Sign in to Mihaoo before using local Development roadmaps.',
    )
  }

  return {
    id: String(identity),
    email: typeof user?.email === 'string' ? user.email : '',
    displayName:
      typeof user?.displayName === 'string'
        ? user.displayName
        : typeof user?.name === 'string'
          ? user.name
          : typeof user?.email === 'string'
            ? user.email
            : String(identity),
  }
}

function storageKey() {
  const user = getLocalDevelopmentUser()
  return `${STORAGE_PREFIX}:${encodeURIComponent(user.id)}`
}

function emptyStore() {
  return {
    version: STORE_VERSION,
    roadmaps: [],
    templates: [],
    imports: [],
  }
}

export function readLocalDevelopmentStore() {
  const key = storageKey()
  const raw = localStorage.getItem(key)
  if (!raw) return emptyStore()

  try {
    const parsed = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== STORE_VERSION ||
      !Array.isArray(parsed.roadmaps) ||
      !Array.isArray(parsed.templates) ||
      !Array.isArray(parsed.imports)
    ) {
      throw new Error('invalid local development store')
    }
    return parsed
  } catch {
    throw new DevelopmentError(
      'LOCAL_STORE_CORRUPT',
      'Local Development data cannot be read. Export or clear the browser data before continuing.',
    )
  }
}

export function writeLocalDevelopmentStore(store) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(store))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('development:local-changed'))
    }
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      throw new DevelopmentError(
        'LOCAL_STORE_FULL',
        'Local browser storage is full. Remove unused local roadmaps or move them to the backend before saving more data.',
      )
    }
    throw error
  }
}

export function mutateLocalDevelopmentStore(mutator) {
  const store = readLocalDevelopmentStore()
  const result = mutator(store)
  writeLocalDevelopmentStore(store)
  return structuredCloneSafe(result)
}

export function getLocalRoadmapCapabilities() {
  return {
    canRead: true,
    canEditStructure: true,
    canContribute: true,
    canManageAccess: false,
    canArchive: true,
  }
}

function permanentizeBlock(block, order) {
  return {
    ...structuredCloneSafe(block),
    id: block?.id && !String(block.id).startsWith('tmp_') ? block.id : localId('block'),
    order,
    layout: {
      span: [3, 4, 6, 8, 12].includes(Number(block?.layout?.span))
        ? Number(block.layout.span)
        : 12,
    },
    config: block?.config && typeof block.config === 'object' ? block.config : {},
    data: block?.data && typeof block.data === 'object' ? block.data : {},
    schemaVersion: Number.isInteger(block?.schemaVersion) ? block.schemaVersion : 1,
  }
}

function permanentizePages(pages = []) {
  return pages.map((page, pageIndex) => ({
    ...structuredCloneSafe(page),
    id: page?.id && !String(page.id).startsWith('tmp_') ? page.id : localId('page'),
    order: pageIndex,
    sections: (page?.sections || []).map((section, sectionIndex) => ({
      ...structuredCloneSafe(section),
      id:
        section?.id && !String(section.id).startsWith('tmp_')
          ? section.id
          : localId('section'),
      order: sectionIndex,
      blocks: (section?.blocks || []).map((block, blockIndex) =>
        permanentizeBlock(block, blockIndex),
      ),
    })),
  }))
}

export function createEmptyLocalRoadmap({ title, description, startDate, endDate, requestId }) {
  const user = getLocalDevelopmentUser()
  const createdAt = nowIso()
  const firstPage = createDevelopmentPage('Overview', 0)

  return {
    id: localId('roadmap'),
    title,
    description,
    status: 'DRAFT',
    myRole: 'OWNER',
    version: 1,
    startDate: startDate || null,
    endDate: endDate || null,
    updatedAt: createdAt,
    createdAt,
    schemaVersion: 1,
    capabilities: getLocalRoadmapCapabilities(),
    pages: permanentizePages([firstPage]),
    ownerUserId: user.id,
    localRequestId: requestId || null,
    storageMode: 'local',
  }
}

export function clonePagesWithFreshIds(pages = []) {
  return pages.map((page, pageIndex) => ({
    ...structuredCloneSafe(page),
    id: localId('page'),
    order: pageIndex,
    sections: (page?.sections || []).map((section, sectionIndex) => ({
      ...structuredCloneSafe(section),
      id: localId('section'),
      order: sectionIndex,
      blocks: (section?.blocks || []).map((block, blockIndex) => ({
        ...structuredCloneSafe(block),
        id: localId('block'),
        order: blockIndex,
      })),
    })),
  }))
}

function resetBlockForTemplate(block) {
  const definition = getDevelopmentBlockDefinition(block.type)
  const personalTypes = new Set([
    'journal',
    'blockers',
    'monthly_report',
    'self_assessment',
    'check_in',
    'evidence',
    'final_review',
  ])

  if (!personalTypes.has(block.type) || !definition) return structuredCloneSafe(block)

  return {
    ...structuredCloneSafe(block),
    data: structuredCloneSafe(definition.defaultData || {}),
  }
}

export function templatePagesFromRoadmap(pages = []) {
  return pages.map((page) => ({
    ...structuredCloneSafe(page),
    sections: (page.sections || []).map((section) => ({
      ...structuredCloneSafe(section),
      blocks: (section.blocks || []).map(resetBlockForTemplate),
    })),
  }))
}

function genericImportedData(definition, rawRows = []) {
  const rows = Array.isArray(rawRows) ? rawRows : []
  const editor = definition?.editor
  if (!editor) return structuredCloneSafe(definition?.defaultData || {})

  if (editor.kind === 'text') {
    return {
      ...(structuredCloneSafe(definition.defaultData || {})),
      [editor.key]: rows.flat().filter((value) => String(value ?? '').trim()).join('\n'),
    }
  }

  if (editor.kind === 'table') {
    const width = rows.reduce((max, row) => Math.max(max, row.length), 0)
    const headers = rows[0] || []
    const columns = Array.from({ length: width }, (_, index) => ({
      id: `column_${index + 1}`,
      label: String(headers[index] || `Column ${index + 1}`),
    }))
    return {
      columns,
      rows: rows.slice(1).map((row, rowIndex) => ({
        id: `row_${rowIndex + 1}`,
        cells: Object.fromEntries(columns.map((column, col) => [column.id, row[col] ?? ''])),
      })),
    }
  }

  if (editor.kind === 'list') {
    const dataRows = rows.length > 1 ? rows.slice(1) : rows
    return {
      ...(structuredCloneSafe(definition.defaultData || {})),
      [editor.key]: dataRows
        .filter((row) => row.some((value) => String(value ?? '').trim()))
        .map((row, rowIndex) => ({
          id: `import_${rowIndex + 1}`,
          ...Object.fromEntries(
            editor.fields.map((field, fieldIndex) => [field.key, row[fieldIndex] ?? '']),
          ),
        })),
    }
  }

  if (editor.kind === 'fields') {
    const result = structuredCloneSafe(definition.defaultData || {})
    const text = rows.flat().filter((value) => String(value ?? '').trim()).join('\n')
    const preferred = editor.fields.find((field) => field.type === 'textarea') || editor.fields[0]
    if (preferred) result[preferred.key] = text
    return result
  }

  return structuredCloneSafe(definition.defaultData || {})
}

export function importedBlockToRoadmapBlock(block, order) {
  let next
  try {
    next = createDevelopmentBlock(block.targetType || block.detectedType || 'table', { order })
  } catch {
    next = createDevelopmentBlock('table', { order })
  }

  next.id = localId('block')
  next.title = String(block.title || next.title).slice(0, 160)
  const sameType = (block.targetType || block.detectedType) === block.detectedType
  next.data = sameType
    ? structuredCloneSafe(block.data || next.data || {})
    : genericImportedData(getDevelopmentBlockDefinition(next.type), block.rawRows || [])
  next.config = {
    ...(next.config || {}),
    importSource: {
      sheet: block.sourceSheet || '',
      range: block.sourceRange || '',
      detectedType: block.detectedType || 'table',
    },
  }
  return next
}

export function importPagesToRoadmapPages(pages = []) {
  return pages.map((page, pageIndex) => ({
    id: localId('page'),
    title: String(page.title || `Page ${pageIndex + 1}`).slice(0, 160),
    order: pageIndex,
    sections: (page.sections || []).map((section, sectionIndex) => ({
      id: localId('section'),
      title: String(section.title || 'Imported content').slice(0, 160),
      order: sectionIndex,
      blocks: (section.blocks || [])
        .filter((block) => block.include !== false)
        .map((block, blockIndex) => importedBlockToRoadmapBlock(block, blockIndex)),
    })),
  }))
}

export function touchLocalRoadmap(roadmap) {
  roadmap.version = Number.isInteger(roadmap.version) ? roadmap.version + 1 : 1
  roadmap.updatedAt = nowIso()
  roadmap.capabilities = getLocalRoadmapCapabilities()
  roadmap.myRole = 'OWNER'
  roadmap.storageMode = 'local'
  return roadmap
}

export function createLocalTemplateSummary(template) {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    version: template.version,
    updatedAt: template.updatedAt,
  }
}

export { localId, nowIso, permanentizePages }
