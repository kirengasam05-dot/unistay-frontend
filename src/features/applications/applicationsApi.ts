import api from '../../lib/api';

export const applicationsApi = {
  list: () => api.get('/applications'),
  get: (id: string) => api.get('/applications/' + id),
  create: (data: unknown) => api.post('/applications', data),
  update: (id: string, data: unknown) => api.put('/applications/' + id, data),
  remove: (id: string) => api.delete('/applications/' + id),
};
