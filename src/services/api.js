import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000',
})

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem(
        'accessToken',
      )

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },
)

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
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

    return Promise.reject(error)
  },
)

export default api
