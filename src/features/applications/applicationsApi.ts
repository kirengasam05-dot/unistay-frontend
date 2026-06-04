import api from "../../shared/lib/api";
import { extractList, extractOne } from "../../shared/types/api";

export type Application = {
  id: string;
  jobId: string;
  userId?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  score?: number;
  compatible?: boolean;
  missing?: string[];
  createdAt?: string;
  message?: string;
  resumeUrl?: string;
  user?: { fullName: string; email: string; avatar?: string };
  job?: { id: string; title: string; company?: string };
};

export type ApplicationFormData = {
  dateOfBirth: string;
  nationality: string;
  idType: string;
  phone: string;
  address: string;
  location: string;
  linkedin: string;
  portfolio: string;
  coverLetter: string;
  confirmedSkills: string[];
  resumeName: string;
};

export const applicationsApi = {
  /** Student — their own submitted applications. GET /applications/my */
  async getMine(): Promise<Application[]> {
    const res = await api.get("/applications/my");
    return extractList<Application>(res.data);
  },

  /** Employer — all applications across all their jobs. GET /applications/employer */
  async getForEmployer(): Promise<Application[]> {
    const res = await api.get('/applications/employer');
    return extractList<Application>(res.data);
  },

  /** Employer — applications for a specific job. GET /applications/jobs/:jobId */
  async getForJob(jobId: string): Promise<Application[]> {
    const res = await api.get(`/applications/jobs/${jobId}`);
    return extractList<Application>(res.data);
  },

  /** Student apply — POST /applications/jobs/:jobId */
  async apply(jobId: string, formData?: ApplicationFormData): Promise<Application> {
    const body = formData ? { message: JSON.stringify(formData) } : {};
    const res = await api.post(`/applications/jobs/${jobId}`, body);
    // Response: { message: string, application: {...} }
    return (res.data?.application ?? extractOne<Application>(res.data)) as Application;
  },

  /** Student — upload resume PDF/DOCX for a submitted application */
  async uploadResume(applicationId: string, file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/applications/${applicationId}/resume`, form);
    return res.data?.resumeUrl ?? '';
  },

  /** Employer accept — PUT /applications/:id/status { status: 'ACCEPTED' } */
  async accept(id: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, {
      status: "ACCEPTED",
    });
    return extractOne<Application>(res.data);
  },

  /** Employer reject — PUT /applications/:id/status { status: 'REJECTED', message? } */
  async reject(id: string, reason?: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, {
      status: "REJECTED",
      ...(reason?.trim() ? { message: reason.trim() } : {}),
    });
    return extractOne<Application>(res.data);
  },
};
