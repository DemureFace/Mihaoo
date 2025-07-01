import axios from 'axios'

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Basic ${token}` } : {}
}

const api = axios.create({
  baseURL: 'https://your-api-endpoint.com',
})

api.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  }
  return config
})

export default api
