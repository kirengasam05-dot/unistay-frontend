import api from '../../lib/api';
import { extractList } from '../../types/api';

export type Certificate = {
  id: string;
  title?: string;
  courseId?: string;
  userId?: string;
  issuedAt?: string;
  certificateUrl?: string;
};

export type Assignment = {
  id: string;
  title: string;
  courseId?: string;
  timeLimit?: number;
  questionCount?: number;
  passingScore?: number;
  status?: string;
};

export const skillsApi = {
  async getCertificates(): Promise<Certificate[]> {
    const res = await api.get('/skills/certificates');
    return extractList<Certificate>(res.data);
  },

  async getAssignments(): Promise<Assignment[]> {
    const res = await api.get('/skills/assignments');
    return extractList<Assignment>(res.data);
  },
};
