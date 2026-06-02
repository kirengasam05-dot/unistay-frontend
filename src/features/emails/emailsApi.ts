import api from '../../shared/lib/api';
import { extractList } from '../../shared/types/api';

export type Email = {
  id: string;
  subject: string;
  from?: string;
  body?: string;
  content?: string;
  createdAt?: string;
  read?: boolean;
};

export const emailsApi = {
  async getMine(): Promise<Email[]> {
    const res = await api.get('/emails/my');
    return extractList<Email>(res.data);
  },
};
