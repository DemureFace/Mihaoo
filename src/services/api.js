import axios from 'axios'
import { getApiErrorMessage } from './apiError'

export const AUTH_EXPIRED_EVENT = 'auth:expired'
export const AUTH_REFRESHED_EVENT = 'auth:refreshed'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL,
})

// Separate client without interceptors.
// Important: refresh must not recursively trigger itself.
const refreshApi = axios.create({
  baseURL,
})

let refreshPromise = null

function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

function expireSession() {
  const hadSession =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('refreshToken') ||
    localStorage.getItem('user')

  clearStoredAuth()

  if (hadSession) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
  }
}

function saveRefreshedTokens(data) {
  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('Invalid refresh response')
  }

  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)

  window.dispatchEvent(
    new CustomEvent(AUTH_REFRESHED_EVENT, {
      detail: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    }),
  )
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    expireSession()

    throw new Error('Refresh token is missing')
  }

  refreshPromise = refreshApi
    .post('/auth/refresh', {
      refreshToken,
    })
    .then(({ data }) => {
      // Prevent an in-flight refresh from restoring a session
      // after the user manually logged out.
      if (localStorage.getItem('refreshToken') !== refreshToken) {
        throw new Error('Auth session changed while refreshing')
      }

      saveRefreshedTokens(data)

      return data.accessToken
    })
    .catch((error) => {
      expireSession()

      throw error
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    const requestPath = (originalRequest?.url || '').split('?')[0]

    const isPublicAuthRequest = [
      '/auth/login',
      '/auth/register',
    ].includes(requestPath)

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest
    ) {
      originalRequest._retry = true

      const currentAccessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        expireSession()
      } else {
        try {
          const requestToken = originalRequest.headers?.Authorization

          // Another request may already have refreshed the session.
          if (
            currentAccessToken &&
            requestToken &&
            requestToken !== `Bearer ${currentAccessToken}`
          ) {
            originalRequest.headers.Authorization =
              `Bearer ${currentAccessToken}`

            return api.request(originalRequest)
          }

          const newAccessToken = await refreshSession()

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`

          return api.request(originalRequest)
        } catch {
          // refreshSession already cleared the invalid session.
        }
      }
    } else if (
      status === 401 &&
      originalRequest?._retry &&
      !isPublicAuthRequest
    ) {
      // Even the newly issued access token failed.
      expireSession()
    }

    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(
          await error.response.data.text(),
        )
      } catch {
        // Keep the original HTTP error.
      }
    }

    error.message = getApiErrorMessage(error)
    error.status = error.response?.status
    error.data = error.response?.data

    return Promise.reject(error)
  },
)

export default api
