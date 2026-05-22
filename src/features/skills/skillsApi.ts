import api from '../../lib/api';

export const skillsApi = {
  list: () => api.get('/skills'),
  get: (id: string) => api.get('/skills/' + id),
  create: (data: unknown) => api.post('/skills', data),
  update: (id: string, data: unknown) => api.put('/skills/' + id, data),
  remove: (id: string) => api.delete('/skills/' + id),
};
