import api from './api'

import { ANALYTICS_TASK_TYPES } from '@/constants/analytics'

export const PAGE_SIZE = 25

const taskTypeLabels = new Map(ANALYTICS_TASK_TYPES.map((type) => [type.value, type.label]))

function readItems(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  throw new Error('Unexpected Analytics API response')
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  )
}

function normalizeTask(row) {
  const group = row.taskGroup

  if (!group || row.id == null) {
    throw new Error('Unexpected TaskBrand response')
  }

  return {
    id: row.id,
    taskGroupId: row.taskGroupId,

    jira: group.jiraKey || '—',

    title: group.title || 'Без назви',

    type: taskTypeLabels.get(group.taskType) || group.taskType,

    platform: group.platform === 'P8' ? '8P' : group.platform,

    brand: row.brand === 'RANDOM' ? 'Random' : row.brand,

    executorId: row.executorId,

    assignee: row.executor?.displayName || null,

    reporterId: group.requestedById,

    sp: row.storyPoints,

    status: row.status,

    reportDate: group.reportDate,

    dueDate: group.dueDate,
  }
}

export const analyticsService = {
  async list(query, signal) {
    const page = query.page || 1
    const skip = (page - 1) * PAGE_SIZE

    const params = cleanParams({
      skip,
      take: PAGE_SIZE + 1,

      search: query.search,
      from: query.from,
      to: query.to,

      executorId: query.executorId,
      requestedById: query.requestedById,

      brand: query.brand,
      platform: query.platform,
      taskType: query.taskType,
      status: query.status,
    })

    const { data } = await api.get('/tasks', {
      params,
      signal,
      timeout: 20000,
    })

    const rows = readItems(data)

    const total = Number.isInteger(data?.total) ? data.total : null

    return {
      items: rows.slice(0, PAGE_SIZE).map(normalizeTask),

      total,

      hasNext: total !== null ? skip + PAGE_SIZE < total : rows.length > PAGE_SIZE,
    }
  },

  async listMembers(signal) {
    const { data } = await api.get('/team-members', {
      params: {
        active: 'true',
      },

      signal,

      timeout: 20000,
    })

    return readItems(data)
  },
  async getReferenceData(signal) {
    const { data } = await api.get('/reference-data', {
      signal,
      timeout: 20000,
    })

    return data
  },

  async createTask(payload, signal) {
    const { data } = await api.post('/tasks', payload, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async getTask(id, signal) {
    if (!id) {
      throw new Error('Task id is required')
    }

    const { data } = await api.get(`/tasks/${id}`, {
      signal,
      timeout: 20000,
    })

    return data
  },
  async updateTaskBrand(id, payload, signal) {
    const { data } = await api.patch(`/tasks/${id}`, payload, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async updateTaskGroup(id, payload, signal) {
    const { data } = await api.patch(`/tasks/${id}/group`, payload, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async exportCsv(query, signal) {
    const params = cleanParams({
      search: query.search,
      from: query.from,
      to: query.to,

      executorId: query.executorId,
      requestedById: query.requestedById,

      brand: query.brand,
      platform: query.platform,
      taskType: query.taskType,
      status: query.status,
    })

    const response = await api.get('/tasks/export', {
      params,
      signal,
      timeout: 30000,
      responseType: 'blob',
    })

    const disposition = response.headers['content-disposition'] || ''

    const filenameMatch = disposition.match(/filename="?([^"]+)"?/i)

    return {
      blob: response.data,
      filename: filenameMatch?.[1] || 'tasks.csv',
    }
  },

  async addTaskComment(id, body, signal) {
    const { data } = await api.post(
      `/tasks/${id}/comments`,
      { body },
      {
        signal,
        timeout: 20000,
      },
    )

    return data
  },
}
