import { Award, Download, X } from 'lucide-react';
import BrandLogo from '../../../shared/components/BrandLogo';

export type CertificateData = {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  skills?: string[];
};

const safePdf = (value: string) => value.replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '');
const line = (x1: number, y1: number, x2: number, y2: number) => `${x1} ${y1} m ${x2} ${y2} l S`;

export function downloadCertificatePdf(certificate: CertificateData) {
  const student = safePdf(certificate.studentName);
  const title = safePdf(certificate.courseTitle);
  const date = safePdf(new Date(certificate.issuedAt).toLocaleDateString());
  const id = safePdf(certificate.id.slice(0, 12).toUpperCase());
  const skills = safePdf((certificate.skills || []).slice(0, 4).join(' | '));
  const content = [
    '0.04 0.22 0.30 RG 4 w 26 26 740 560 re S',
    '0.78 0.64 0.30 RG 1.5 w 38 38 716 536 re S',
    '0.04 0.22 0.30 rg',
    'BT /F2 18 Tf 72 524 Td (UNISTAY+) Tj ET',
    '0.78 0.64 0.30 rg',
    'BT /F1 11 Tf 72 493 Td (CERTIFICATE OF ACHIEVEMENT) Tj ET',
    '0.18 0.22 0.25 rg',
    'BT /F1 13 Tf 72 422 Td (This certificate is proudly presented to) Tj ET',
    '0.04 0.22 0.30 rg',
    `BT /F2 31 Tf 72 370 Td (${student}) Tj ET`,
    '0.78 0.64 0.30 RG 1.2 w',
    line(72, 351, 600, 351),
    '0.18 0.22 0.25 rg',
    'BT /F1 13 Tf 72 310 Td (for successfully completing the course) Tj ET',
    '0.04 0.22 0.30 rg',
    `BT /F2 22 Tf 72 268 Td (${title}) Tj ET`,
    skills ? `BT /F1 10 Tf 72 226 Td (Skills: ${skills}) Tj ET` : '',
    '0.18 0.22 0.25 rg',
    `BT /F1 10 Tf 72 116 Td (Issued: ${date}) Tj ET`,
    `BT /F1 10 Tf 72 96 Td (Certificate ID: ${id}) Tj ET`,
    '0.04 0.22 0.30 RG 1 w',
    line(560, 116, 704, 116),
    '0.18 0.22 0.25 rg',
    'BT /F1 10 Tf 592 96 Td (UniStay+ Learning) Tj ET',
  ].filter(Boolean).join('\n');
  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
6 0 obj << /Length ${content.length} >> stream
${content}
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  link.download = `${certificate.courseTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-certificate.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function CertificateTemplate({ certificate }: { certificate: CertificateData }) {
  return (
    <div className="relative aspect-[1.294/1] w-full overflow-hidden bg-[#fbfaf5] p-3 text-slate-900 shadow-xl sm:p-5">
      <div className="absolute inset-3 border-4 border-[#123f4d] sm:inset-5" />
      <div className="absolute inset-5 border border-[#c8a34b] sm:inset-8" />
      <div className="relative flex h-full flex-col p-7 sm:p-12">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="scale-90 origin-left" />
          <Award className="text-[#c8a34b]" size={36} />
        </div>
        <div className="mt-8 text-center sm:mt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c8a34b] sm:text-sm">Certificate of Achievement</p>
          <p className="mt-5 text-xs text-slate-500 sm:text-base">This certificate is proudly presented to</p>
          <h2 className="mt-2 font-serif text-3xl font-black text-[#123f4d] sm:text-5xl">{certificate.studentName}</h2>
          <div className="mx-auto mt-3 h-px max-w-md bg-[#c8a34b]" />
          <p className="mt-5 text-xs text-slate-500 sm:text-base">for successfully completing the course</p>
          <h3 className="mt-2 text-lg font-black text-slate-900 sm:text-3xl">{certificate.courseTitle}</h3>
          {!!certificate.skills?.length && <p className="mt-3 text-[10px] font-bold text-slate-500 sm:text-sm">Skills: {certificate.skills.join(' | ')}</p>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 text-[9px] text-slate-500 sm:text-xs">
          <div><p>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p><p className="mt-1">ID: {certificate.id.slice(0, 12).toUpperCase()}</p></div>
          <div className="w-32 border-t border-[#123f4d] pt-2 text-center font-bold text-[#123f4d] sm:w-44">UniStay+ Learning</div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePreview({ certificate, onClose }: { certificate: CertificateData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-slate-950/75 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-full w-full flex-col items-end">
        <div className="mb-3 flex justify-end gap-2">
          <button onClick={() => downloadCertificatePdf(certificate)} className="btn-white rounded-lg"><Download size={16} /> Download PDF</button>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-900" aria-label="Close certificate preview"><X size={18} /></button>
        </div>
        <div className="mx-auto aspect-[1.294/1] w-[min(100%,calc((100vh-84px)*1.294))]">
          <CertificateTemplate certificate={certificate} />
        </div>
      </div>
    </div>
  );
}
