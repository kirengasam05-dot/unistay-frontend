import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudUpload, ImageOff, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { housingApi } from '../../housing/housingApi';

interface FormState { title: string; location: string; price: string; bedrooms: string; description: string; amenities: string; }
const BLANK: FormState = { title: '', location: '', price: '', bedrooms: '', description: '', amenities: '' };

interface Picked { file: File; url: string; }

export default function HostAddListingPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<FormState & { image: string }>>({});
  const [images, setImages] = useState<Picked[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function addFiles(files: FileList | File[]) {
    const picked: Picked[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { setErrors(e => ({ ...e, image: 'Only image files are accepted.' })); return; }
      picked.push({ file, url: URL.createObjectURL(file) });
    });
    if (picked.length) { setImages(prev => [...prev, ...picked]); setErrors(e => ({ ...e, image: undefined })); }
  }

  function removeImage(index: number) {
    setImages(prev => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, []);

  function validate() {
    const e: Partial<FormState & { image: string }> = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (form.bedrooms.trim() && (isNaN(Number(form.bedrooms)) || Number(form.bedrooms) < 0)) e.bedrooms = 'Enter a valid number';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      price: Number(form.price),
      bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : undefined,
      description: form.description.trim() || undefined,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      availability: true,
    };

    setSubmitting(true);
    try {
      // POST /listings is multipart/form-data per the API contract.
      await housingApi.create(payload, images.map(i => i.file));
      toast.success('Listing created — pending verification.');
      navigate('/host/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/host/listings')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">New Listing</h1>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Fill in the details below to publish a housing listing.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Property photos</label>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={img.url} className="relative overflow-hidden rounded-xl">
                  <img src={img.url} alt="Preview" className="h-28 w-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${dragging ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-500'}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-700">
              {dragging ? <CloudUpload size={22} className="text-neutral-700 dark:text-neutral-200" /> : <ImageOff size={20} className="text-neutral-500 dark:text-neutral-400" />}
            </div>
            <div className="text-center">
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">{dragging ? 'Drop them here' : 'Drag & drop photos here'}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">or <span className="font-semibold text-neutral-900 underline dark:text-white">click to browse</span></p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); }} />
          {errors.image && <p className="mt-2 text-xs text-red-500">{errors.image}</p>}
        </div>

        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Property details</h2>
          {([['title','Title *','e.g. Kacyiru Student Residence'],['location','Location *','e.g. Kacyiru, Kigali'],['amenities','Amenities (comma-separated)','e.g. WiFi, Hot water, Security']] as const).map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>
              <input value={form[key as keyof FormState]} onChange={e => set(key as keyof FormState, e.target.value)} placeholder={placeholder} className="input" />
              {errors[key as keyof typeof errors] && <p className="mt-1 text-xs text-red-500">{errors[key as keyof typeof errors]}</p>}
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Monthly price (RWF) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 150000" className="input" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="e.g. 1" className="input" />
              {errors.bedrooms && <p className="mt-1 text-xs text-red-500">{errors.bedrooms}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description <span className="font-normal text-neutral-400">(optional)</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the property…" className="input resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pb-6">
          <button onClick={() => navigate('/host/listings')} className="btn-white rounded-xl">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-black rounded-xl flex items-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {submitting ? 'Creating…' : 'Create listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
