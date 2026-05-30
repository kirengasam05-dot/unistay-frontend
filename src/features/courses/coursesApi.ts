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
  async getAll(): Promise<Course[]> {
    const res = await api.get('/courses');
    return extractList<Course>(res.data);
  },

  async create(data: CreateCoursePayload): Promise<Course> {
    const res = await api.post('/courses', data);
    return extractOne<Course>(res.data);
  },

  async publish(id: string): Promise<Course> {
    const res = await api.patch('/courses/' + id + '/publish');
    return extractOne<Course>(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete('/courses/' + id);
  },
};
