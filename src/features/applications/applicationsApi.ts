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
  async getMine(): Promise<Application[]> {
    const response = await api.get('/applications/my');
    return extractList<Application>(response.data);
  },
  async getForEmployer(): Promise<Application[]> {
    const response = await api.get('/applications');
    return extractList<Application>(response.data);
  },
  async apply(jobId: string): Promise<Application> {
    const response = await api.post('/applications', { jobId });
    return extractOne<Application>(response.data);
  },
  async accept(id: string): Promise<Application> {
    const response = await api.patch('/applications/' + id + '/accept');
    return extractOne<Application>(response.data);
  },
  async reject(id: string): Promise<Application> {
    const response = await api.patch('/applications/' + id + '/reject');
    return extractOne<Application>(response.data);
  },
};
