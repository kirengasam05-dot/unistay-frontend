import api from '../../shared/lib/api';
import { extractList, extractOne } from '../../shared/types/api';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  createdAt?: string;
};

export type CreateSkillPayload = {
  name: string;
  category: string;
  level: SkillLevel;
};

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
  isStandalone?: boolean;
  timeLimit?: number;
  questionCount?: number;
  passingScore?: number;
  status?: string;
  questions?: ExamQuestion[];
};

export type ExamOption = { id: string; text: string };
export type ExamQuestion = { id: string; text: string; options: ExamOption[] };
export type ExamAttempt = { id: string; assignmentId: string; assignment?: Assignment; questions?: { question: ExamQuestion }[] };
export type ExamResult = { score: number; passed?: boolean; status?: string };

export const skillsApi = {
  /** GET /skills — all skills (public) */
  async getAll(): Promise<Skill[]> {
    const res = await api.get('/skills');
    return extractList<Skill>(res.data);
  },

  /** GET /skills/:id */
  async getOne(id: string): Promise<Skill> {
    const res = await api.get('/skills/' + id);
    return extractOne<Skill>(res.data);
  },

  /** POST /skills { name, category, level } */
  async create(data: CreateSkillPayload): Promise<Skill> {
    const res = await api.post('/skills', data);
    return extractOne<Skill>(res.data);
  },

  /** PUT /skills/:id { name, category, level } */
  async update(id: string, data: CreateSkillPayload): Promise<Skill> {
    const res = await api.put('/skills/' + id, data);
    return extractOne<Skill>(res.data);
  },

  /** DELETE /skills/:id */
  async remove(id: string): Promise<void> {
    await api.delete('/skills/' + id);
  },

  /** GET /assignments — student exam/assignment list */
  async getAssignments(): Promise<Assignment[]> {
    const res = await api.get('/assignments');
    return extractList<Assignment>(res.data);
  },

  async getAssignment(id: string): Promise<Assignment> {
    const res = await api.get('/assignments/' + id);
    return extractOne<Assignment>(res.data);
  },

  async startAssignment(assignmentId: string): Promise<ExamAttempt> {
    const res = await api.post('/assignment-results/start', { assignmentId });
    return extractOne<ExamAttempt>(res.data);
  },

  async submitAssignment(assignmentResultId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<ExamResult> {
    const res = await api.post('/student-answers', { assignmentResultId, answers });
    return extractOne<ExamResult>(res.data);
  },

  /** No certificate endpoint yet — returns empty until backend adds it. */
  async getCertificates(): Promise<Certificate[]> {
    return [];
  },
};
