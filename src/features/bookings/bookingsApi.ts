import api from '../../lib/api';
import type { BookingStatus } from './bookingsStorage';

export interface CreateBookingDto {
  studentId: string;
  housingId: string;
  hostId: string;
}

export interface UpdateBookingDto {
  status: BookingStatus;
}

export const bookingsApi = {
  list: () => api.get('/bookings'),
  listByStudent: (studentId: string) => api.get(`/bookings?studentId=${studentId}`),
  listByHost: (hostId: string) => api.get(`/bookings?hostId=${hostId}`),
  get: (id: string) => api.get(`/bookings/${id}`),
  create: (data: CreateBookingDto) => api.post('/bookings', data),
  update: (id: string, data: UpdateBookingDto) => api.put(`/bookings/${id}`, data),
  remove: (id: string) => api.delete(`/bookings/${id}`),
};
