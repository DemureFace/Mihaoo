import { analyticsService } from '@/services/analytics.service'

import { createDefaultAnalyticsFilters } from '@/constants/analytics'

const referenceRequests = new WeakMap()
const memberRequests = new WeakMap()

function getErrorMessage(error) {
  if (error.code === 'AUTH_REQUIRED' || error.response?.status === 401) {
    return 'Увійди у Mihaoo через Login, потім натисни «Оновити».'
  }

  if (error.response?.status === 403) {
    return 'API відмовив у доступі.'
  }

  if (error.response?.status >= 500) {
    return 'Помилка Gateway або analytics-service.'
  }

  if (error.code === 'ERR_NETWORK') {
    return 'API недоступний. Перевір Gateway та CORS.'
  }

  return 'Не вдалося завантажити задачі.'
}

export default {
  namespaced: true,

  state: () => ({
    rows: [],

    filters: createDefaultAnalyticsFilters(),

    filterVersion: 0,

    page: 1,

    sortBy: 'reportDate',

    sortOrder: 'desc',

    loading: false,

    error: '',

    total: null,

    hasNext: false,

    requestId: 0,

    members: [],

    membersLoading: false,

    membersError: '',

    referenceData: null,

    referenceDataLoading: false,

    referenceDataError: '',
  }),

  getters: {
    memberName: (state) => (memberId) => {
      if (!memberId) {
        return '—'
      }

      const member = state.members.find((item) => item.id === memberId)

      return member?.displayName || `ID ${memberId}`
    },
    platformLabel: (state) => (code) => {
      if (!code) {
        return '—'
      }

      return state.referenceData?.platforms?.find((item) => item.code === code)?.name || code
    },

    brandLabel: (state) => (code) => {
      if (!code) {
        return '—'
      }

      return state.referenceData?.brands?.find((item) => item.code === code)?.name || code
    },

    taskTypeLabel: (state) => (code) => {
      if (!code) {
        return '—'
      }

      return state.referenceData?.taskTypes?.find((item) => item.code === code)?.name || code
    },
  },

  mutations: {
    APPLY_FILTERS(state, filters) {
      state.filters = {
        ...createDefaultAnalyticsFilters(),
        ...filters,
      }

      state.page = 1

      state.filterVersion += 1
    },

    SET_SORT(state, sortBy) {
      if (state.sortBy === sortBy) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        state.sortBy = sortBy
        state.sortOrder = 'desc'
      }

      state.page = 1
      state.filterVersion += 1
    },

    RESET_FILTERS(state) {
      state.filters = createDefaultAnalyticsFilters()

      state.page = 1

      state.filterVersion += 1
    },

    BEGIN(state, page) {
      state.requestId += 1

      state.page = page

      state.loading = true

      state.error = ''

      state.total = null

      state.hasNext = false
    },

    SUCCESS(state, result) {
      state.rows = result.items

      state.total = result.total

      state.hasNext = result.hasNext
    },

    FAIL(state, message) {
      state.rows = []

      state.error = message
    },

    FINISH(state) {
      state.loading = false
    },

    CLEAR_RESULT(state) {
      state.requestId += 1
      state.rows = []
      state.loading = false
      state.error = ''
      state.total = null
      state.hasNext = false
    },

    MEMBERS_BEGIN(state) {
      state.membersLoading = true

      state.membersError = ''
    },

    MEMBERS_SUCCESS(state, members) {
      state.members = members

      state.membersLoading = false
    },

    MEMBERS_FAIL(state, message) {
      state.members = []

      state.membersLoading = false

      state.membersError = message
    },

    REFERENCE_DATA_BEGIN(state) {
      state.referenceDataLoading = true
      state.referenceDataError = ''
    },

    REFERENCE_DATA_SUCCESS(state, data) {
      state.referenceData = data
      state.referenceDataLoading = false
    },

    REFERENCE_DATA_FAIL(state, message) {
      state.referenceData = null
      state.referenceDataLoading = false
      state.referenceDataError = message
    },
  },

  actions: {
    async load({ state, commit }, { page = state.page, signal } = {}) {
      commit('BEGIN', page)

      const requestId = state.requestId

      try {
        if (!localStorage.getItem('accessToken')) {
          const error = new Error('Authentication required')

          error.code = 'AUTH_REQUIRED'

          throw error
        }

        const result = await analyticsService.list(
          {
            ...state.filters,

            sortBy: state.sortBy,
            sortOrder: state.sortOrder,

            page,
          },
          signal,
        )

        if (requestId === state.requestId && !signal?.aborted) {
          commit('SUCCESS', result)
        }
      } catch (error) {
        if (requestId === state.requestId && !signal?.aborted && error.code !== 'ERR_CANCELED') {
          commit('FAIL', getErrorMessage(error))
        }
      } finally {
        if (requestId === state.requestId) {
          commit('FINISH')
        }
      }
    },

    async loadMembers({ state, commit }) {
      if (memberRequests.has(state)) return memberRequests.get(state)
      if (state.members.length) return state.members

      if (!localStorage.getItem('accessToken')) {
        return
      }

      commit('MEMBERS_BEGIN')

      const request = analyticsService
        .listMembers()
        .then((members) => {
          commit('MEMBERS_SUCCESS', members)
          return members
        })
        .catch(() => {
          commit('MEMBERS_FAIL', 'Не вдалося завантажити список команди.')
        })
        .finally(() => memberRequests.delete(state))
      memberRequests.set(state, request)
      return request
    },

    async loadReferenceData({ state, commit }) {
      if (referenceRequests.has(state)) return referenceRequests.get(state)
      if (state.referenceData) return state.referenceData

      if (!localStorage.getItem('accessToken')) {
        return
      }

      commit('REFERENCE_DATA_BEGIN')

      const request = analyticsService
        .getReferenceData()
        .then((data) => {
          commit('REFERENCE_DATA_SUCCESS', data)
          return data
        })
        .catch(() => {
          commit('REFERENCE_DATA_FAIL', 'Не вдалося завантажити бренди, платформи та типи задач.')
        })
        .finally(() => referenceRequests.delete(state))
      referenceRequests.set(state, request)
      return request
    },
  },
}
