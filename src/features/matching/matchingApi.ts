import api from '../../lib/api';

export const matchingApi = {
  list: () => api.get('/matching'),
  get: (id: string) => api.get('/matching/' + id),
  create: (data: unknown) => api.post('/matching', data),
  update: (id: string, data: unknown) => api.put('/matching/' + id, data),
  remove: (id: string) => api.delete('/matching/' + id),
};
