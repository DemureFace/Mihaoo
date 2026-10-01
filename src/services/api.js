import axios from 'axios'

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

  (error) => {
    const isUnauthorized = error.response?.status === 401

    const hadAccessToken = Boolean(localStorage.getItem('accessToken'))

    if (isUnauthorized && hadAccessToken) {
      clearStoredAuth()

      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }

    return Promise.reject(error)
  },
)

export default api
