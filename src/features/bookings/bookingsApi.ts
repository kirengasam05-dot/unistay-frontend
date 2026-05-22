import api from '../../lib/api';

export const bookingsApi = {
  list: () => api.get('/bookings'),
  get: (id: string) => api.get('/bookings/' + id),
  create: (data: unknown) => api.post('/bookings', data),
  update: (id: string, data: unknown) => api.put('/bookings/' + id, data),
  remove: (id: string) => api.delete('/bookings/' + id),
};
