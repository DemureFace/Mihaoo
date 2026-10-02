import api from './api'

export const PAGE_SIZE = 25

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

    type: group.taskType,

    platform: group.platform,

    brand: row.brand,

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

      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
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

  async getDuplicateTemplate(id, signal) {
    const { data } = await api.get(`/tasks/${id}/duplicate`, {
      signal,
      timeout: 20000,
    })

    return data
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

  async listSprints(signal) {
    const { data } = await api.get('/sprints', {
      signal,
      timeout: 20000,
    })

    return Array.isArray(data) ? data : data?.items || []
  },

  async listWeeklyReports(query = {}, signal) {
    const params = cleanParams({
      sprintId: query.sprintId,
      teamMemberId: query.teamMemberId,
      from: query.from,
      to: query.to,
    })

    const { data } = await api.get('/weekly-reports', {
      params,
      signal,
      timeout: 20000,
    })

    return readItems(data)
  },

  async getWeeklyReport(id, signal) {
    if (!id) {
      throw new Error('Weekly Report id is required')
    }

    const { data } = await api.get(`/weekly-reports/${id}`, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async createWeeklyReport(payload, signal) {
    const { data } = await api.post('/weekly-reports', payload, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async updateWeeklyReport(id, payload, signal) {
    if (!id) {
      throw new Error('Weekly Report id is required')
    }

    const { data } = await api.patch(`/weekly-reports/${id}`, payload, {
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

  async deleteTaskBrand(id, signal) {
    const { data } = await api.delete(`/tasks/${id}`, {
      signal,
      timeout: 20000,
    })

    return data
  },

  async restoreTaskBrand(id, signal) {
    const { data } = await api.post(`/tasks/${id}/restore`, null, {
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
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
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
