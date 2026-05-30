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
};

export const jobsApi = {
  async getAll(): Promise<Job[]> {
    const response = await api.get('/jobs');
    return extractList<Job>(response.data);
  },
  async getMine(): Promise<Job[]> {
    const response = await api.get('/jobs/mine');
    return extractList<Job>(response.data);
  },
  async create(data: CreateJobPayload): Promise<Job> {
    const response = await api.post('/jobs', data);
    return extractOne<Job>(response.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete('/jobs/' + id);
  },
};
