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
    const response = await api.get('/courses');
    return extractList<Course>(response.data);
  },
  async create(data: CreateCoursePayload): Promise<Course> {
    const response = await api.post('/courses', data);
    return extractOne<Course>(response.data);
  },
  async publish(id: string): Promise<Course> {
    const response = await api.patch('/courses/' + id + '/publish');
    return extractOne<Course>(response.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete('/courses/' + id);
  },
};
