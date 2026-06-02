import api from '../../shared/lib/api';
import { extractList, extractOne } from '../../shared/types/api';

export type LearningProfile = {
  userSkills: { completionStatus: boolean; skill: { id: string; name: string; category: string; level: string } }[];
  certificates: { id: string; issuedAt: string; certificateUrl?: string; course: { id: string; title: string }; skills?: { skill: { id: string; name: string } }[] }[];
  enrollments: { id: string; progress: number; completedMaterials: number; course: { id: string; title: string } }[];
};

export type InstructorEnrollment = {
  id: string;
  progress: number;
  completedMaterials: number;
  enrolledAt: string;
  course: { id: string; title: string };
  user: { id: string; fullName: string; email: string };
};

export const learningProfileApi = {
  async getMine(): Promise<LearningProfile> {
    const res = await api.get('/enrollments/profile');
    return extractOne<LearningProfile>(res.data);
  },
  async enroll(courseId: string): Promise<void> {
    await api.post('/enrollments', { courseId });
  },
  async getInstructorEnrollments(): Promise<InstructorEnrollment[]> {
    const res = await api.get('/enrollments/instructor');
    return extractList<InstructorEnrollment>(res.data);
  },
};
