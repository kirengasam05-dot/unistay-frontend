import api from '../../lib/api';
import { extractList, extractOne } from '../../types/api';

export type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  isPublished?: boolean;
  uploadedBy?: string;
  createdAt?: string;
  /** Populated when fetched with include: { materials: true } */
  materials?: { id: string; title?: string; type?: string }[];
  /** Populated when fetched with include: { skills: true } */
  skills?: { skill: { id: string; name: string } }[];
  /** Populated when fetched with include: { assignments: true } */
  assignments?: { id: string; title: string }[];
  /** Student progress (0-100) — only present on student-scoped endpoints */
  progress?: number;
};

export type CreateCoursePayload = {
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  skillIds?: string[];
};

export const coursesApi = {
  /** GET /courses */
  async getAll(): Promise<Course[]> {
    const res = await api.get('/courses');
    return extractList<Course>(res.data);
  },

  /** POST /courses — requires admin token */
  async create(data: CreateCoursePayload): Promise<Course> {
    const res = await api.post('/courses', data);
    return extractOne<Course>(res.data);
  },

  /** PUT /courses/:id — requires admin token */
  async update(id: string, data: Partial<CreateCoursePayload>): Promise<Course> {
    const res = await api.put('/courses/' + id, data);
    return extractOne<Course>(res.data);
  },

  /** PUT /courses/:id/publish — requires admin token */
  async publish(id: string): Promise<Course> {
    const res = await api.put('/courses/' + id + '/publish');
    return extractOne<Course>(res.data);
  },

  /** DELETE /courses/:id — requires admin token */
  async remove(id: string): Promise<void> {
    await api.delete('/courses/' + id);
  },
};
