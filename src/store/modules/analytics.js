import {
  analyticsService,
} from '@/services/analytics.service'

import {
  createDefaultAnalyticsFilters,
} from '@/constants/analytics'

function getErrorMessage(error) {
  if (
    error.code === 'AUTH_REQUIRED' ||
    error.response?.status === 401
  ) {
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

    filters:
      createDefaultAnalyticsFilters(),

    filterVersion: 0,

    page: 1,

    loading: false,

    error: '',

    total: null,

    hasNext: false,

    requestId: 0,

    members: [],

    membersLoading: false,

    membersError: '',
  }),

  getters: {
    memberName:
      (state) =>
      (memberId) => {
        if (!memberId) {
          return '—'
        }

        const member =
          state.members.find(
            (item) =>
              item.id === memberId,
          )

        return (
          member?.displayName ||
          `ID ${memberId}`
        )
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

    RESET_FILTERS(state) {
      state.filters =
        createDefaultAnalyticsFilters()

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

      state.hasNext =
        result.hasNext
    },

    FAIL(state, message) {
      state.rows = []

      state.error = message
    },

    FINISH(state) {
      state.loading = false
    },

    MEMBERS_BEGIN(state) {
      state.membersLoading = true

      state.membersError = ''
    },

    MEMBERS_SUCCESS(
      state,
      members,
    ) {
      state.members = members

      state.membersLoading = false
    },

    MEMBERS_FAIL(
      state,
      message,
    ) {
      state.members = []

      state.membersLoading = false

      state.membersError = message
    },
  },

  actions: {
    async load(
      { state, commit },
      {
        page = state.page,
        signal,
      } = {},
    ) {
      commit('BEGIN', page)

      const requestId =
        state.requestId

      try {
        if (
          !localStorage.getItem(
            'accessToken',
          )
        ) {
          const error =
            new Error(
              'Authentication required',
            )

          error.code =
            'AUTH_REQUIRED'

          throw error
        }

        const result =
          await analyticsService.list(
            {
              ...state.filters,
              page,
            },
            signal,
          )

        if (
          requestId ===
            state.requestId &&
          !signal?.aborted
        ) {
          commit(
            'SUCCESS',
            result,
          )
        }
      } catch (error) {
        if (
          requestId ===
            state.requestId &&
          !signal?.aborted &&
          error.code !==
            'ERR_CANCELED'
        ) {
          commit(
            'FAIL',
            getErrorMessage(
              error,
            ),
          )
        }
      } finally {
        if (
          requestId ===
          state.requestId
        ) {
          commit('FINISH')
        }
      }
    },

    async loadMembers({
      state,
      commit,
    }) {
      if (
        state.membersLoading ||
        state.members.length
      ) {
        return
      }

      if (
        !localStorage.getItem(
          'accessToken',
        )
      ) {
        return
      }

      commit(
        'MEMBERS_BEGIN',
      )

      try {
        const members =
          await analyticsService.listMembers()

        commit(
          'MEMBERS_SUCCESS',
          members,
        )
      } catch (error) {
        commit(
          'MEMBERS_FAIL',
          'Не вдалося завантажити список команди.',
        )
      }
    },
  },
}
