import {
  DevelopmentError,
  buildCreatePayload,
  parseMembers,
  parseRoadmapDetail,
  parseRoadmapList,
  validId,
} from './development.model.js'
import {
  clonePagesWithFreshIds,
  createEmptyLocalRoadmap,
  createLocalTemplateSummary,
  getLocalDevelopmentUser,
  importPagesToRoadmapPages,
  localId,
  mutateLocalDevelopmentStore,
  nowIso,
  permanentizePages,
  readLocalDevelopmentStore,
  templatePagesFromRoadmap,
  touchLocalRoadmap,
} from './development.local.storage.js'
import { parseLocalRoadmapSpreadsheet } from './development.local.xlsx.js'
import { parseDevelopmentRoadmapFilePayload } from './development.portable.js'

function findRoadmap(store, id) {
  const roadmap = store.roadmaps.find((item) => item.id === id)
  if (!roadmap) {
    throw new DevelopmentError('NOT_FOUND', 'This local roadmap is not available.')
  }
  return roadmap
}

function findTemplate(store, id) {
  const template = store.templates.find((item) => item.id === id)
  if (!template) throw new DevelopmentError('NOT_FOUND', 'This local template is not available.')
  return template
}

function findImport(store, id) {
  const job = store.imports.find((item) => item.id === id)
  if (!job) throw new DevelopmentError('NOT_FOUND', 'This local import is not available.')
  return job
}

function normalizeDate(value) {
  return value || null
}

function createRoadmapFromTemplate(template, input) {
  const now = nowIso()
  return {
    id: localId('roadmap'),
    title: input.title,
    description: template.description || '',
    status: 'DRAFT',
    myRole: 'OWNER',
    version: 1,
    startDate: normalizeDate(input.startDate),
    endDate: normalizeDate(input.endDate),
    updatedAt: now,
    createdAt: now,
    schemaVersion: 1,
    capabilities: {
      canRead: true,
      canEditStructure: true,
      canContribute: true,
      canManageAccess: false,
      canArchive: true,
    },
    pages: clonePagesWithFreshIds(template.pages || []),
    storageMode: 'local',
    localRequestId: input.requestId || null,
  }
}

function createRoadmapFromImport(job, payload) {
  const now = nowIso()
  return {
    id: localId('roadmap'),
    title: String(payload.roadmapTitle || job.fileName.replace(/\.xlsx$/iu, '') || 'Imported roadmap').slice(0, 160),
    description: `Imported locally from ${job.fileName}`,
    status: 'DRAFT',
    myRole: 'OWNER',
    version: 1,
    startDate: null,
    endDate: null,
    updatedAt: now,
    createdAt: now,
    schemaVersion: 1,
    capabilities: {
      canRead: true,
      canEditStructure: true,
      canContribute: true,
      canManageAccess: false,
      canArchive: true,
    },
    pages: importPagesToRoadmapPages(payload.pages || []),
    storageMode: 'local',
    localRequestId: payload.requestId || null,
  }
}


function createRoadmapFromPortableFile(portable, { title, requestId }) {
  const user = getLocalDevelopmentUser()
  const now = nowIso()
  const source = portable.roadmap

  return {
    id: localId('roadmap'),
    title: String(title || source.title || 'Imported roadmap').trim().slice(0, 160),
    description: source.description || '',
    status: source.status || 'DRAFT',
    myRole: 'OWNER',
    version: 1,
    startDate: source.startDate || null,
    endDate: source.endDate || null,
    updatedAt: now,
    createdAt: now,
    schemaVersion: source.schemaVersion || 1,
    capabilities: {
      canRead: true,
      canEditStructure: true,
      canContribute: true,
      canManageAccess: false,
      canArchive: true,
    },
    pages: permanentizePages(source.pages || []),
    ownerUserId: user.id,
    storageMode: 'local',
    localRequestId: requestId || null,
    importSource: {
      kind: 'mihaoo-roadmap-file',
      formatVersion: portable.formatVersion,
      exportedAt: portable.exportedAt || null,
    },
  }
}

function localRoadmapApi() {
  return {
    async list({ search = '', scope = 'all', page = 1, pageSize = 12 } = {}) {
      if (!['all', 'owned', 'shared'].includes(scope)) {
        throw new DevelopmentError('VALIDATION', 'Invalid roadmap filter.')
      }
      const store = readLocalDevelopmentStore()
      const term = String(search).trim().toLowerCase()
      let rows = scope === 'shared' ? [] : [...store.roadmaps]
      if (term) {
        rows = rows.filter((item) =>
          `${item.title} ${item.description || ''}`.toLowerCase().includes(term),
        )
      }
      rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      const total = rows.length
      const start = (page - 1) * pageSize
      return parseRoadmapList({
        items: rows.slice(start, start + pageSize),
        total,
        page,
        pageSize,
      })
    },

    async get(id) {
      if (!validId(id)) throw new DevelopmentError('VALIDATION', 'Invalid roadmap ID.')
      const roadmap = findRoadmap(readLocalDevelopmentStore(), id)
      return parseRoadmapDetail(roadmap)
    },

    async create(input, { requestId } = {}) {
      const payload = buildCreatePayload(input, requestId)
      return mutateLocalDevelopmentStore((store) => {
        const existing = store.roadmaps.find((item) => item.localRequestId === payload.requestId)
        if (existing) return parseRoadmapDetail(existing)
        const roadmap = createEmptyLocalRoadmap(payload)
        store.roadmaps.unshift(roadmap)
        return parseRoadmapDetail(roadmap)
      })
    },

    async importPortable(payload, { title, requestId } = {}) {
      const portable = parseDevelopmentRoadmapFilePayload(payload)
      const resolvedTitle = String(title || portable.roadmap.title || '').trim()

      if (!resolvedTitle || resolvedTitle.length > 160) {
        throw new DevelopmentError('VALIDATION', 'Enter a valid roadmap title.')
      }

      if (requestId && !validId(requestId)) {
        throw new DevelopmentError('VALIDATION', 'Invalid import request ID.')
      }

      return mutateLocalDevelopmentStore((store) => {
        if (requestId) {
          const existing = store.roadmaps.find((item) => item.localRequestId === requestId)
          if (existing) return parseRoadmapDetail(existing)
        }

        const roadmap = createRoadmapFromPortableFile(portable, {
          title: resolvedTitle,
          requestId,
        })
        store.roadmaps.unshift(roadmap)
        return parseRoadmapDetail(roadmap)
      })
    },

    async members(id) {
      findRoadmap(readLocalDevelopmentStore(), id)
      const user = getLocalDevelopmentUser()
      return parseMembers({
        aclVersion: 1,
        items: [{ user: { id: user.id, email: user.email, displayName: user.displayName }, role: 'OWNER' }],
      })
    },

    async share() {
      throw new DevelopmentError(
        'LOCAL_ONLY',
        'Sharing is available after the Development backend is connected. Local roadmaps exist only in this browser profile.',
      )
    },

    async revoke() {
      throw new DevelopmentError(
        'LOCAL_ONLY',
        'Sharing is available after the Development backend is connected.',
      )
    },
  }
}

function localBuilderApi() {
  return {
    async saveSnapshot(id, { expectedVersion, pages }) {
      if (!validId(id) || !Number.isInteger(expectedVersion) || !Array.isArray(pages)) {
        throw new DevelopmentError('VALIDATION', 'Invalid builder payload.')
      }
      return mutateLocalDevelopmentStore((store) => {
        const roadmap = findRoadmap(store, id)
        if (roadmap.version !== expectedVersion) {
          throw new DevelopmentError(
            'CONFLICT',
            'This local roadmap changed in another tab. Reload it before saving again.',
            409,
          )
        }
        roadmap.pages = permanentizePages(pages)
        touchLocalRoadmap(roadmap)
        return parseRoadmapDetail(roadmap)
      })
    },
  }
}

function localTemplateApi() {
  return {
    async list() {
      const store = readLocalDevelopmentStore()
      return {
        items: store.templates
          .slice()
          .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
          .map(createLocalTemplateSummary),
        total: store.templates.length,
      }
    },

    async createFromRoadmap(roadmapId, input) {
      const title = typeof input?.title === 'string' ? input.title.trim() : ''
      const description = typeof input?.description === 'string' ? input.description.trim() : ''
      if (!title || title.length > 160 || description.length > 1000) {
        throw new DevelopmentError('VALIDATION', 'Enter a valid template title and description.')
      }

      return mutateLocalDevelopmentStore((store) => {
        const roadmap = findRoadmap(store, roadmapId)
        const now = nowIso()
        const template = {
          id: localId('template'),
          title,
          description,
          version: 1,
          createdAt: now,
          updatedAt: now,
          pages: templatePagesFromRoadmap(roadmap.pages),
        }
        store.templates.unshift(template)
        return createLocalTemplateSummary(template)
      })
    },

    async instantiate(templateId, input) {
      const title = typeof input?.title === 'string' ? input.title.trim() : ''
      if (!title) throw new DevelopmentError('VALIDATION', 'Enter a roadmap title.')

      return mutateLocalDevelopmentStore((store) => {
        const duplicate = store.roadmaps.find((item) => item.localRequestId === input.requestId)
        if (duplicate) return parseRoadmapDetail(duplicate)
        const template = findTemplate(store, templateId)
        const roadmap = createRoadmapFromTemplate(template, { ...input, title })
        store.roadmaps.unshift(roadmap)
        return parseRoadmapDetail(roadmap)
      })
    },
  }
}

function localImportApi() {
  return {
    async upload(file, { roadmapId = null } = {}) {
      if (roadmapId) findRoadmap(readLocalDevelopmentStore(), roadmapId)
      const parsed = await parseLocalRoadmapSpreadsheet(file)
      return mutateLocalDevelopmentStore((store) => {
        const now = nowIso()
        const job = {
          id: localId('import'),
          status: 'REVIEW_REQUIRED',
          fileName: parsed.fileName,
          warnings: parsed.warnings,
          error: '',
          preview: parsed.preview,
          roadmapId: null,
          targetRoadmapId: roadmapId || null,
          createdAt: now,
          updatedAt: now,
          storageMode: 'local',
        }
        store.imports.unshift(job)
        return structuredCloneJob(job)
      })
    },

    async get(id) {
      if (!validId(id)) throw new DevelopmentError('VALIDATION', 'Invalid import ID.')
      return structuredCloneJob(findImport(readLocalDevelopmentStore(), id))
    },

    async confirm(id, payload) {
      if (!payload || !Array.isArray(payload.pages)) {
        throw new DevelopmentError('VALIDATION', 'Invalid import mapping.')
      }

      return mutateLocalDevelopmentStore((store) => {
        const job = findImport(store, id)
        if (job.status === 'IMPORTED' && job.roadmapId) return structuredCloneJob(job)

        let roadmap
        if (payload.mode === 'existing') {
          const targetId = payload.roadmapId || job.targetRoadmapId
          roadmap = findRoadmap(store, targetId)
          const importedPages = importPagesToRoadmapPages(payload.pages)
          roadmap.pages = [
            ...roadmap.pages,
            ...importedPages.map((page, index) => ({
              ...page,
              order: roadmap.pages.length + index,
            })),
          ]
          touchLocalRoadmap(roadmap)
        } else {
          const duplicate = store.roadmaps.find((item) => item.localRequestId === payload.requestId)
          roadmap = duplicate || createRoadmapFromImport(job, payload)
          if (!duplicate) store.roadmaps.unshift(roadmap)
        }

        job.status = 'IMPORTED'
        job.roadmapId = roadmap.id
        job.preview = { pages: [] }
        job.updatedAt = nowIso()
        return structuredCloneJob(job)
      })
    },
  }
}

function structuredCloneJob(job) {
  return JSON.parse(JSON.stringify(job))
}

export function createLocalDevelopmentClients() {
  return {
    developmentApi: localRoadmapApi(),
    developmentBuilderApi: localBuilderApi(),
    developmentImportApi: localImportApi(),
    developmentTemplateApi: localTemplateApi(),
  }
}
