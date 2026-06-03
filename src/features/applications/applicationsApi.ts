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
};

export const applicationsApi = {
  /** Student — their own submitted applications. GET /applications/my */
  async getMine(): Promise<Application[]> {
    const res = await api.get("/applications/my");
    return extractList<Application>(res.data);
  },

  /**
   * Employer — applications for a specific job. GET /applications/jobs/:jobId
   * No bulk "all applications" endpoint exists server-side yet.
   */
  async getForJob(jobId: string): Promise<Application[]> {
    const res = await api.get(`/applications/jobs/${jobId}`);
    return extractList<Application>(res.data);
  },

  /** Student apply — POST /applications/jobs/:jobId */
  async apply(
    jobId: string,
    formData?: ApplicationFormData,
  ): Promise<Application> {
    const payload = formData
      ? { ...formData, message: JSON.stringify(formData) }
      : {};
    const res = await api.post(`/applications/jobs/${jobId}`, payload);
    return extractOne<Application>(res.data);
  },

  /** Employer accept — PUT /applications/:id/status { status: 'ACCEPTED' } */
  async accept(id: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, {
      status: "ACCEPTED",
    });
    return extractOne<Application>(res.data);
  },

  /** Employer reject — PUT /applications/:id/status { status: 'REJECTED' } */
  async reject(id: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/status`, {
      status: "REJECTED",
    });
    return extractOne<Application>(res.data);
  },
};
