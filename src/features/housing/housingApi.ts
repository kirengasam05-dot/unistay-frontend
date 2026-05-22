import api from '../../lib/api';

export const housingApi = {
  list: () => api.get('/housing'),
  get: (id: string) => api.get('/housing/' + id),
  create: (data: unknown) => api.post('/housing', data),
  update: (id: string, data: unknown) => api.put('/housing/' + id, data),
  remove: (id: string) => api.delete('/housing/' + id),
};
