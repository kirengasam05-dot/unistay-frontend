import { Award, Download, X } from 'lucide-react';

export type CertificateData = {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  skills?: string[];
};

const safePdf = (value: string) => value.replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '');
const pdfSize = { width: 792, height: 612 };

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let lineText = '';

  words.forEach((word) => {
    const next = lineText ? `${lineText} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !lineText) {
      lineText = next;
      return;
    }
    lines.push(lineText);
    lineText = word;
  });

  if (lineText) lines.push(lineText);
  return lines.slice(0, 2);
}

function drawCenteredText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number) {
  ctx.fillText(value, x, y);
}

function drawSpacedCenteredText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, spacing: number) {
  const letters = value.split('');
  const width = letters.reduce((total, letter, index) => {
    return total + ctx.measureText(letter).width + (index === letters.length - 1 ? 0 : spacing);
  }, 0);
  let currentX = x - width / 2;

  letters.forEach((letter, index) => {
    ctx.fillText(letter, currentX, y);
    currentX += ctx.measureText(letter).width + (index === letters.length - 1 ? 0 : spacing);
  });
}

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function ascii(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

function buildImagePdf(jpeg: Uint8Array, width: number, height: number) {
  const drawImage = 'q 792 0 0 612 0 0 cm /CertImage Do Q';
  const objects = [
    ascii('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n'),
    ascii('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n'),
    ascii('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /XObject << /CertImage 4 0 R >> >> /Contents 5 0 R >> endobj\n'),
    concatBytes([
      ascii(`4 0 obj << /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >> stream\n`),
      jpeg,
      ascii('\nendstream endobj\n'),
    ]),
    ascii(`5 0 obj << /Length ${drawImage.length} >> stream\n${drawImage}\nendstream endobj\n`),
  ];
  const chunks = [ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
  const offsets: number[] = [];

  objects.forEach((object) => {
    offsets.push(chunks.reduce((total, chunk) => total + chunk.length, 0));
    chunks.push(object);
  });

  const xrefOffset = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const xref = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    ...offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    'trailer << /Size 6 /Root 1 0 R >>',
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');

  chunks.push(ascii(xref));
  return concatBytes(chunks);
}

export async function downloadCertificatePdf(certificate: CertificateData) {
  const student = certificate.studentName;
  const title = certificate.courseTitle;
  const date = safePdf(new Date(certificate.issuedAt).toLocaleDateString());
  const id = safePdf(certificate.id.slice(0, 12).toUpperCase());
  const skills = (certificate.skills || []).slice(0, 4).join(' | ');
  const canvas = document.createElement('canvas');
  canvas.width = pdfSize.width * 2;
  canvas.height = pdfSize.height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(2, 2);
  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, pdfSize.width, pdfSize.height);
  ctx.strokeStyle = '#123f4d';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 12, 764, 588);
  ctx.strokeStyle = '#c8a34b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 24, 740, 564);

  const logo = await loadImage('/unistaylogo-transparent.png');
  if (logo) ctx.drawImage(logo, 70, 72, 34, 34);
  ctx.font = '900 17px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('UniStay', 116, 91);
  ctx.fillStyle = '#0872c9';
  ctx.fillText('+', 185, 91);

  ctx.save();
  ctx.translate(684, 70);
  ctx.strokeStyle = '#c8a34b';
  ctx.fillStyle = '#fbfaf5';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(18, 10, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11, 18);
  ctx.lineTo(8, 34);
  ctx.lineTo(17, 28);
  ctx.lineTo(26, 34);
  ctx.lineTo(23, 18);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c8a34b';
  ctx.font = '900 13px Arial, sans-serif';
  drawSpacedCenteredText(ctx, 'CERTIFICATE OF ACHIEVEMENT', 396, 162, 8);

  ctx.fillStyle = '#64748b';
  ctx.font = '400 16px Arial, sans-serif';
  drawCenteredText(ctx, 'This certificate is proudly presented to', 396, 206);

  ctx.fillStyle = '#123f4d';
  ctx.font = `900 ${student.length > 28 ? 39 : 48}px Georgia, Times New Roman, serif`;
  drawCenteredText(ctx, student, 396, 258);

  ctx.strokeStyle = '#c8a34b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(132, 281);
  ctx.lineTo(580, 281);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '400 16px Arial, sans-serif';
  drawCenteredText(ctx, 'for successfully completing the course', 396, 318);

  ctx.fillStyle = '#0f172a';
  ctx.font = `900 ${title.length > 42 ? 25 : 31}px Arial, sans-serif`;
  wrapCanvasText(ctx, title, 560).forEach((lineText, index) => {
    drawCenteredText(ctx, lineText, 396, 361 + index * 32);
  });

  if (skills) {
    ctx.fillStyle = '#64748b';
    ctx.font = '700 13px Arial, sans-serif';
    wrapCanvasText(ctx, `Skills: ${skills}`, 560).forEach((lineText, index) => {
      drawCenteredText(ctx, lineText, 396, 396 + index * 16);
    });
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '400 12px Arial, sans-serif';
  ctx.fillText(`Issued ${date}`, 60, 460);
  ctx.fillText(`ID: ${id}`, 60, 480);

  ctx.strokeStyle = '#123f4d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(475, 459);
  ctx.lineTo(652, 459);
  ctx.stroke();
  ctx.fillStyle = '#123f4d';
  ctx.font = '700 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UniStay+ Learning', 564, 480);

  const jpeg = dataUrlBytes(canvas.toDataURL('image/jpeg', 0.95));
  const pdf = buildImagePdf(jpeg, canvas.width, canvas.height);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  link.download = `${certificate.courseTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-certificate.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function CertificateTemplate({ certificate }: { certificate: CertificateData }) {
  return (
    <div className="relative aspect-[1.294/1] w-full overflow-hidden bg-[#fbfaf5] p-3 text-slate-900 shadow-xl sm:p-5">
      <div className="absolute inset-[1.6%] border-[3px] border-[#123f4d] sm:border-4" />
      <div className="absolute inset-[3.2%] border border-[#c8a34b]" />
      <div className="relative flex h-full flex-col px-[8.5%] py-[9%]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/unistaylogo-transparent.png" alt="UniStay+" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            <span className="text-base font-black text-slate-950 sm:text-xl">UniStay<span className="text-[#0872c9]">+</span></span>
          </div>
          <Award className="text-[#c8a34b]" size={34} strokeWidth={2.5} />
        </div>
        <div className="mt-[7%] text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.48em] text-[#c8a34b] sm:text-sm">Certificate of Achievement</p>
          <p className="mt-[4.5%] text-xs text-slate-500 sm:text-base">This certificate is proudly presented to</p>
          <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-[#123f4d] sm:text-5xl">{certificate.studentName}</h2>
          <div className="mx-auto mt-2 h-px max-w-[68%] bg-[#c8a34b]" />
          <p className="mt-[4%] text-xs text-slate-500 sm:text-base">for successfully completing the course</p>
          <h3 className="mt-1.5 text-xl font-black leading-tight text-slate-950 sm:text-3xl">{certificate.courseTitle}</h3>
          {!!certificate.skills?.length && <p className="mt-2 text-[10px] font-bold text-slate-500 sm:text-sm">Skills: {certificate.skills.join(' | ')}</p>}
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
