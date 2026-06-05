import api from '../../shared/lib/api';
import { extractList, extractOne } from '../../shared/types/api';

export type LearningProfile = {
  userSkills: { completionStatus: boolean; skill: { id: string; name: string; category: string; level: string } }[];
  certificates: { id: string; issuedAt: string; certificateUrl?: string; courseId?: string; course?: { id: string; title: string }; skills?: { skill: { id: string; name: string } }[] }[];
  enrollments: { id: string; progress: number; completedMaterials: number; courseId?: string; course?: { id: string; title: string } }[];
};

export function enrollmentCourseId(enrollment: LearningProfile['enrollments'][number]) {
  return enrollment.course?.id || enrollment.courseId || '';
}

export function certificateCourseId(certificate: LearningProfile['certificates'][number]) {
  return certificate.course?.id || certificate.courseId || '';
}

export function courseEnrollment(profile: LearningProfile | undefined | null, courseId: string) {
  return profile?.enrollments.find((enrollment) => enrollmentCourseId(enrollment) === courseId);
}

export function courseCertificate(profile: LearningProfile | undefined | null, courseId: string) {
  return profile?.certificates.find((certificate) => certificateCourseId(certificate) === courseId);
}

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
