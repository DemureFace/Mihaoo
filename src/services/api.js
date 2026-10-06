import axios from 'axios'
import { getApiErrorMessage } from './apiError'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
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
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        // A non-JSON error body must not hide the original HTTP failure.
      }
    }
    error.message = getApiErrorMessage(error)
    error.status = error.response?.status
    error.data = error.response?.data

    const currentToken = localStorage.getItem('accessToken')
    const requestToken = error.config?.headers?.Authorization
    const requestPath = (error.config?.url || '').split('?')[0]
    const isAuthAttempt = ['/auth/login', '/auth/register'].includes(requestPath)

    if (
      error.response?.status === 401 &&
      currentToken &&
      requestToken === `Bearer ${currentToken}` &&
      !isAuthAttempt
    ) {
      clearStoredAuth()

      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }

    return Promise.reject(error)
  },
)

export default api
