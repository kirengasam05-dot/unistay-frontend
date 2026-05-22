import api from '../../lib/api';

export const jobsApi = {
  list: () => api.get('/jobs'),
  get: (id: string) => api.get('/jobs/' + id),
  create: (data: unknown) => api.post('/jobs', data),
  update: (id: string, data: unknown) => api.put('/jobs/' + id, data),
  remove: (id: string) => api.delete('/jobs/' + id),
};
