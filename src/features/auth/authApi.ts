import api from '../../lib/api';

export const authApi = {
  list: () => api.get('/auth'),
  get: (id: string) => api.get('/auth/' + id),
  create: (data: unknown) => api.post('/auth', data),
  update: (id: string, data: unknown) => api.put('/auth/' + id, data),
  remove: (id: string) => api.delete('/auth/' + id),
};
