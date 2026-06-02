import api from '../../shared/lib/api';
import { extractList, extractOne } from '../../shared/types/api';

export type Material = {
  id: string;
  courseId?: string;
  course?: { id: string; title: string };
  title: string;
  description?: string;
  type: 'VIDEO' | 'PDF' | 'ARTICLE' | 'QUIZ';
  duration?: number;
  files?: MaterialFile[];
};
export type MaterialFile = { id: string; url: string; originalName?: string; resourceType?: string; mimeType?: string };

export type AnswerOption = { id: string; text: string; isCorrect?: boolean };
export type Question = { id: string; text: string; options?: AnswerOption[] };
export type Exam = {
  id: string;
  courseId: string;
  title: string;
  isStandalone?: boolean;
  timeLimit?: number;
  passingScore?: number;
  questions?: Question[];
};

export const learningAuthorApi = {
  async getMaterials(): Promise<Material[]> {
    const res = await api.get('/materials');
    return extractList<Material>(res.data);
  },
  async createMaterial(courseId: string, data: Omit<Material, 'id' | 'courseId' | 'course'>): Promise<Material> {
    const res = await api.post(`/materials/course/${courseId}`, data);
    return extractOne<Material>(res.data);
  },
  async removeMaterial(id: string): Promise<void> {
    await api.delete(`/materials/${id}`);
  },
  async updateMaterial(id: string, data: Partial<Pick<Material, 'title' | 'description' | 'type' | 'duration'>>): Promise<Material> {
    const res = await api.put(`/materials/${id}`, data);
    return extractOne<Material>(res.data);
  },
  async uploadMaterialFile(materialId: string, file: File): Promise<MaterialFile> {
    const data = new FormData();
    data.append('materialId', materialId);
    data.append('file', file);
    const res = await api.post('/uploads', data);
    return extractOne<MaterialFile>(res.data);
  },
  async removeMaterialFile(id: string): Promise<void> {
    await api.delete(`/uploads/${id}`);
  },
  async getExams(): Promise<Exam[]> {
    const res = await api.get('/assignments');
    return extractList<Exam>(res.data);
  },
  async createExam(data: Pick<Exam, 'courseId' | 'title' | 'isStandalone' | 'timeLimit' | 'passingScore'>): Promise<Exam> {
    const res = await api.post('/assignments', data);
    return extractOne<Exam>(res.data);
  },
  async removeExam(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },
  async updateExam(id: string, data: Partial<Pick<Exam, 'title' | 'isStandalone' | 'timeLimit' | 'passingScore'>>): Promise<Exam> {
    const res = await api.put(`/assignments/${id}`, data);
    return extractOne<Exam>(res.data);
  },
  async createQuestion(assignmentId: string, text: string): Promise<Question> {
    const res = await api.post('/questions', { assignmentId, text });
    return extractOne<Question>(res.data);
  },
  async removeQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  },
  async updateQuestion(id: string, text: string): Promise<Question> {
    const res = await api.put(`/questions/${id}`, { text });
    return extractOne<Question>(res.data);
  },
  async createOption(questionId: string, text: string, isCorrect: boolean): Promise<AnswerOption> {
    const res = await api.post('/options', { questionId, text, isCorrect });
    return extractOne<AnswerOption>(res.data);
  },
  async removeOption(id: string): Promise<void> {
    await api.delete(`/options/${id}`);
  },
  async updateOption(id: string, data: Pick<AnswerOption, 'text' | 'isCorrect'>): Promise<AnswerOption> {
    const res = await api.put(`/options/${id}`, data);
    return extractOne<AnswerOption>(res.data);
  },
};
