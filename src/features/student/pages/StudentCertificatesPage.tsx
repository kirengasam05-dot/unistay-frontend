import { useEffect, useState } from 'react';
import { Award, Download, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { learningProfileApi } from '../learningProfileApi';
import type { LearningProfile } from '../learningProfileApi';
import LearningLayout from '../components/LearningLayout';
import CertificatePreview, { downloadCertificatePdf, type CertificateData } from '../components/CertificatePreview';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [preview, setPreview] = useState<CertificateData | null>(null);
  useEffect(() => { learningProfileApi.getMine().then(setProfile).catch(() => setProfile(null)); }, []);
  if (!profile) return <div className="card grid min-h-60 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;
  const certificateData = (certificate: LearningProfile['certificates'][number]): CertificateData => ({
    id: certificate.id,
    studentName: user?.fullName || 'Student',
    courseTitle: certificate.course.title,
    issuedAt: certificate.issuedAt,
    skills: certificate.skills?.map(({ skill }) => skill.name),
  });
  return <LearningLayout><div className="space-y-6"><section className="rounded-xl bg-slate-950 p-7 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Achievements</p><h1 className="mt-2 text-3xl font-black">Certificates</h1></section>{profile.certificates.map((certificate) => { const data = certificateData(certificate); return <article key={certificate.id} className="card flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><Award className="text-emerald-600" /><div><h2 className="font-black">{certificate.course.title}</h2><p className="text-sm text-neutral-500">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => setPreview(data)} className="btn-white rounded-lg"><Eye size={15} /> Preview</button><button onClick={() => downloadCertificatePdf(data)} className="btn-black rounded-lg"><Download size={15} /> Download PDF</button></div></article>; })}{profile.certificates.length === 0 && <div className="card text-sm text-neutral-500">Pass a course exam to unlock your first certificate.</div>}{preview && <CertificatePreview certificate={preview} onClose={() => setPreview(null)} />}</div></LearningLayout>;
}
