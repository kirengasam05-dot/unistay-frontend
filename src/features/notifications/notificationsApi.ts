import api from '../../lib/api';

export const notificationsApi = {
  list: () => api.get('/notifications'),
  get: (id: string) => api.get('/notifications/' + id),
  create: (data: unknown) => api.post('/notifications', data),
  update: (id: string, data: unknown) => api.put('/notifications/' + id, data),
  remove: (id: string) => api.delete('/notifications/' + id),
};
