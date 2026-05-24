import api from './api';

export const tasksService = {
  async getAll() {
    const { data } = await api.get('/tasks');
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/tasks', payload);
    return data;
  },

  async getOne(id) {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};
