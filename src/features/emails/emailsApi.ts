import api from '../../lib/api';
import { extractList } from '../../types/api';

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
    const response = await api.get('/emails/my');
    return extractList<Email>(response.data);
  },
};
