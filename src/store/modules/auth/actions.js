import { authService } from '@/services/auth.service'

import {
  LOGIN_ACTION,
  SIGNUP_ACTION,
  LOGOUT_ACTION,
  FETCH_USER_ACTION,
  SET_USER_MUTATION,
  CLEAR_AUTH_MUTATION,
} from '@/store/storeconstants'

function persistAuth(data) {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('user', JSON.stringify(data.user))
}

function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export default {
  async [LOGIN_ACTION]({ commit }, payload) {
    const data = await authService.login(payload)

    persistAuth(data)

    commit(SET_USER_MUTATION, {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return data
  },

  async [SIGNUP_ACTION]({ commit }, payload) {
    const data = await authService.register(payload)

    persistAuth(data)

    commit(SET_USER_MUTATION, {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return data
  },

  async [FETCH_USER_ACTION]({ commit }) {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken && !refreshToken) {
      clearStoredAuth()
      commit(CLEAR_AUTH_MUTATION)

      return null
    }

    try {
      const user = await authService.me()

      // Token may have been automatically refreshed while /users/me was running.
      const currentAccessToken = localStorage.getItem('accessToken')
      const currentRefreshToken = localStorage.getItem('refreshToken')

      // User may have logged out while the request was in progress.
      if (!currentAccessToken || !currentRefreshToken) {
        return null
      }

      localStorage.setItem('user', JSON.stringify(user))

      commit(SET_USER_MUTATION, {
        user,
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
      })

      return user
    } catch {
      if (
        !localStorage.getItem('accessToken') &&
        !localStorage.getItem('refreshToken')
      ) {
        clearStoredAuth()
        commit(CLEAR_AUTH_MUTATION)
      }

      return null
    }
  },

  async [LOGOUT_ACTION]({ commit }) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (accessToken || refreshToken) {
        await authService.logout()
      }
    } catch {
      // Logout locally even if backend is unavailable.
    } finally {
      clearStoredAuth()
      commit(CLEAR_AUTH_MUTATION)
    }
  },
}
