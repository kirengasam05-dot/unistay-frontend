import api from '../../lib/api';

export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get('/users/' + id),
  create: (data: unknown) => api.post('/users', data),
  update: (id: string, data: unknown) => api.put('/users/' + id, data),
  remove: (id: string) => api.delete('/users/' + id),
};
