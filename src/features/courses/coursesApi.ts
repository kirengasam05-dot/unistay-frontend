import api from '../../lib/api';
import { extractList, extractOne } from '../../types/api';

export type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  materials?: number;
  exam?: string;
  certificateAvailable?: boolean;
  isPublished?: boolean;
  progress?: number;
};

export type CreateCoursePayload = {
  title: string;
  description?: string;
  category?: string;
};

export const coursesApi = {
  /** GET /courses */
  async getAll(): Promise<Course[]> {
    const res = await api.get('/courses');
    return extractList<Course>(res.data);
  },

  /** POST /courses (admin only) */
  async create(data: CreateCoursePayload): Promise<Course> {
    const res = await api.post('/courses', data);
    return extractOne<Course>(res.data);
  },

  /** PUT /courses/:id/publish (admin only) — backend uses PUT not PATCH */
  async publish(id: string): Promise<Course> {
    const res = await api.put('/courses/' + id + '/publish');
    return extractOne<Course>(res.data);
  },

  /** DELETE /courses/:id (admin only) */
  async remove(id: string): Promise<void> {
    await api.delete('/courses/' + id);
  },
};
