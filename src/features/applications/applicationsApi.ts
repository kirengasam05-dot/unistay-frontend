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
  /** Student — their own submitted applications. GET /applications/my */
  async getMine(): Promise<Application[]> {
    const res = await api.get('/applications/my');
    return extractList<Application>(res.data);
  },

  /**
   * Employer — applications for a specific job. GET /applications/jobs/:jobId
   * No bulk "all applications" endpoint exists server-side yet.
   */
  async getForJob(jobId: string): Promise<Application[]> {
    const res = await api.get(`/applications/jobs/${jobId}`);
    return extractList<Application>(res.data);
  },

  /** Student apply — POST /applications/jobs/:jobId (jobId in URL, no body needed) */
  async apply(jobId: string): Promise<Application> {
    const res = await api.post(`/applications/jobs/${jobId}`);
    return extractOne<Application>(res.data);
  },

  /** Employer accept — PUT /applications/:id/status { status: 'ACCEPTED' } */
  async accept(id: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, { status: 'ACCEPTED' });
    return extractOne<Application>(res.data);
  },

  /** Employer reject — PUT /applications/:id/status { status: 'REJECTED' } */
  async reject(id: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, { status: 'REJECTED' });
    return extractOne<Application>(res.data);
  },
};
