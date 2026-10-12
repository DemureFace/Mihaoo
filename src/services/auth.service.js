import api from './api'

export const authService = {
  async login(payload) {
    const { data } = await api.post('/auth/login', payload)

    return data
  },

  async register(payload) {
    const { data } = await api.post('/auth/register', payload)

    return data
  },

  async me() {
    const { data } = await api.get('/users/me')

    return {
      id: data.id,
      email: data.email,
      name: data.name ?? '',
      role: data.role ?? 'USER',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  },

  async logout() {
    const { data } = await api.post('/auth/logout')

    return data
  },
}
