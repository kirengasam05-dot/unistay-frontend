import api from '../../lib/api';

export const coursesApi = {
  list: () => api.get('/courses'),
  get: (id: string) => api.get('/courses/' + id),
  create: (data: unknown) => api.post('/courses', data),
  update: (id: string, data: unknown) => api.put('/courses/' + id, data),
  remove: (id: string) => api.delete('/courses/' + id),
};
