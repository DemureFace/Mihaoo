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
  localStorage.setItem(
    'accessToken',
    data.accessToken,
  )

  localStorage.removeItem(
    'refreshToken',
  )

  localStorage.setItem(
    'user',
    JSON.stringify(data.user),
  )
}

function clearStoredAuth() {
  localStorage.removeItem(
    'accessToken',
  )

  localStorage.removeItem(
    'refreshToken',
  )

  localStorage.removeItem(
    'user',
  )
}

export default {
  async [LOGIN_ACTION](
    { commit },
    payload,
  ) {
    const data =
      await authService.login(
        payload,
      )

    persistAuth(data)

    commit(
      SET_USER_MUTATION,
      {
        user: data.user,
        accessToken:
          data.accessToken,
        refreshToken: null,
      },
    )

    return data
  },

  async [SIGNUP_ACTION](
    { commit },
    payload,
  ) {
    const data =
      await authService.register(
        payload,
      )

    persistAuth(data)

    commit(
      SET_USER_MUTATION,
      {
        user: data.user,
        accessToken:
          data.accessToken,
        refreshToken: null,
      },
    )

    return data
  },

  async [FETCH_USER_ACTION]({
    commit,
  }) {
    const accessToken =
      localStorage.getItem(
        'accessToken',
      )

    if (!accessToken) {
      clearStoredAuth()
      commit(CLEAR_AUTH_MUTATION)

      return null
    }

    try {
      const user =
        await authService.me()

      localStorage.setItem(
        'user',
        JSON.stringify(user),
      )

      commit(
        SET_USER_MUTATION,
        {
          user,
          accessToken,
          refreshToken: null,
        },
      )

      return user
    } catch {
      clearStoredAuth()
      commit(CLEAR_AUTH_MUTATION)

      return null
    }
  },

  async [LOGOUT_ACTION]({
    commit,
  }) {
    clearStoredAuth()
    commit(CLEAR_AUTH_MUTATION)
  },
}
