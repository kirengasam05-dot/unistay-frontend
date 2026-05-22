import api from '../../lib/api';

export const emailsApi = {
  list: () => api.get('/emails'),
  get: (id: string) => api.get('/emails/' + id),
  create: (data: unknown) => api.post('/emails', data),
  update: (id: string, data: unknown) => api.put('/emails/' + id, data),
  remove: (id: string) => api.delete('/emails/' + id),
};
