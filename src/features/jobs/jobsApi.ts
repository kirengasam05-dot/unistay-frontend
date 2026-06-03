import api from '../../shared/lib/api';
import { extractList, extractOne } from '../../shared/types/api';

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
  image?: string;
  companyLogo?: string;
  createdAt?: string;
};

/** Map jobSkills (backend join table) → requiredSkills (string[]) */
function normalizeJob(j: any): Job {
  return {
    ...j,
    requiredSkills:
      Array.isArray(j.requiredSkills) && j.requiredSkills.length > 0
        ? j.requiredSkills
        : (j.jobSkills ?? []).map((js: any) => js.skill?.name).filter(Boolean),
  };
}

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

export type UpdateJobPayload = Partial<Pick<CreateJobPayload, 'title' | 'location' | 'salary' | 'scheduleType'>>;

export const jobsApi = {
  /** GET /jobs — all jobs (public) */
  async getAll(): Promise<Job[]> {
    const res = await api.get('/jobs');
    return extractList<any>(res.data).map(normalizeJob);
  },

  /** GET /jobs — employer's own jobs (no scoped endpoint yet, filters client-side) */
  async getMine(): Promise<Job[]> {
    const res = await api.get('/jobs');
    return extractList<any>(res.data).map(normalizeJob);
  },

  /** POST /jobs — employer creates a job */
  async create(data: CreateJobPayload): Promise<Job> {
    const res = await api.post('/jobs', data);
    return normalizeJob(extractOne<any>(res.data));
  },

  /** PUT /jobs/:id — employer updates a job */
  async update(id: string, data: UpdateJobPayload): Promise<Job> {
    const res = await api.put('/jobs/' + id, data);
    return normalizeJob(extractOne<any>(res.data));
  },

  /** DELETE /jobs/:id */
  async remove(id: string): Promise<void> {
    await api.delete('/jobs/' + id);
  },
};
