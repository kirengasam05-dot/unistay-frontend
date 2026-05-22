import api from '../../lib/api';

export const adminApi = {
  list: () => api.get('/admin'),
  get: (id: string) => api.get('/admin/' + id),
  create: (data: unknown) => api.post('/admin', data),
  update: (id: string, data: unknown) => api.put('/admin/' + id, data),
  remove: (id: string) => api.delete('/admin/' + id),
};
