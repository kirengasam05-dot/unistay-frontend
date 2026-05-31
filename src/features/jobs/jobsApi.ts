import api from '../../lib/api';
import { extractList, extractOne } from '../../types/api';

export type Job = {
  id: string;
  title: string;
  company?: string;
  location: string;
  salary?: number;
  scheduleType: string;
  category?: string;
  deadline?: string;
  requiredSkills?: string[];
  requiredCourseIds?: string[];
  requirements?: string[];
  employerId?: string;
  description?: string;
};

export type CreateJobPayload = {
  title: string;
  location?: string;
  salary?: number;
  scheduleType?: string;
  category?: string;
  deadline?: string;
  requiredSkills?: string[];
  requiredCourseIds?: string[];
  description?: string;
};

export const jobsApi = {
  /** GET /jobs — all jobs (public) */
  async getAll(): Promise<Job[]> {
    const res = await api.get('/jobs');
    return extractList<Job>(res.data);
  },

  /**
   * GET /jobs — backend has no employer-scoped endpoint yet,
   * so this returns all jobs (caller can filter by employerId client-side).
   */
  async getMine(): Promise<Job[]> {
    const res = await api.get('/jobs');
    return extractList<Job>(res.data);
  },

  /** POST /jobs — employer creates a job */
  async create(data: CreateJobPayload): Promise<Job> {
    const res = await api.post('/jobs', data);
    return extractOne<Job>(res.data);
  },

  /** DELETE /jobs/:id */
  async remove(id: string): Promise<void> {
    await api.delete('/jobs/' + id);
  },
};
