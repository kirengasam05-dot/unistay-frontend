import api from '../../lib/api';
import { extractList, extractOne } from '../../types/api';

export type Application = {
  id: string;
  jobId: string;
  userId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  score?: number;
  compatible?: boolean;
  missing?: string[];
  user?: { fullName: string; email: string };
  job?: { id: string; title: string; company?: string };
};

export const applicationsApi = {
  /** Employer — all applications for their posted jobs. */
  async getAll(): Promise<Application[]> {
    const res = await api.get('/applications');
    return extractList<Application>(res.data);
  },

  /** Student — only their own submitted applications. */
  async getMine(): Promise<Application[]> {
    const res = await api.get('/applications/my');
    return extractList<Application>(res.data);
  },

  async apply(jobId: string): Promise<Application> {
    const res = await api.post('/applications', { jobId });
    return extractOne<Application>(res.data);
  },

  async accept(id: string): Promise<Application> {
    const res = await api.patch('/applications/' + id + '/accept');
    return extractOne<Application>(res.data);
  },

  async reject(id: string): Promise<Application> {
    const res = await api.patch('/applications/' + id + '/reject');
    return extractOne<Application>(res.data);
  },
};
