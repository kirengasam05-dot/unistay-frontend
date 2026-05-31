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
  /**
   * No /skills/certificates endpoint exists in the backend yet.
   * Returns empty array until the backend adds certificate tracking.
   */
  async getCertificates(): Promise<Certificate[]> {
    return [];
  },

  /** GET /assignments — backend stores assignments separately from skills */
  async getAssignments(): Promise<Assignment[]> {
    const res = await api.get('/assignments');
    return extractList<Assignment>(res.data);
  },
};
