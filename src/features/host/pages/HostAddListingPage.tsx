import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudUpload, ImageOff, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { housingApi } from '../../housing/housingApi';

interface FormState { name: string; location: string; description: string; }
const BLANK: FormState = { name: '', location: '', description: '' };

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
    if (!form.name.trim())     e.name     = 'Hostel name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // Backend hostel fields: name, location, description only.
    // Price / bedrooms / amenities belong to Rooms and are set there.
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await housingApi.create(payload, images.map(i => i.file));
      toast.success('Hostel created — pending verification. You can now add rooms.');
      navigate('/host/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create hostel');
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
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Fill in the details below to publish a hostel listing.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Property photos</label>
          {images.length === 0 ? (
            /* Empty state — full drop zone */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${dragging ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-500'}`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-700">
                {dragging ? <CloudUpload size={24} className="text-neutral-700 dark:text-neutral-200" /> : <ImageOff size={22} className="text-neutral-500 dark:text-neutral-400" />}
              </div>
              <div className="text-center">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">{dragging ? 'Drop them here' : 'Drag & drop photos here'}</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">or <span className="font-semibold text-neutral-900 underline dark:text-white">click to browse</span></p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">PNG, JPG, WEBP — up to 10 photos</p>
              </div>
            </div>
          ) : (
            /* Photos grid — fills the space; last tile is "add more" */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`grid grid-cols-3 gap-3 rounded-2xl transition-colors ${dragging ? 'ring-2 ring-neutral-900 dark:ring-white' : ''}`}
            >
              {images.map((img, i) => (
                <div key={img.url} className="relative overflow-hidden rounded-xl">
                  <img src={img.url} alt={`Photo ${i + 1}`} className="h-36 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-red-600"
                  >
                    <X size={13} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-lg bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">Cover</span>
                  )}
                </div>
              ))}
              {/* Add more tile */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 transition hover:border-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:border-neutral-500"
              >
                <Plus size={22} />
                <span className="text-xs font-semibold">Add more</span>
              </button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); }} />
          {errors.image && <p className="mt-2 text-xs text-red-500">{errors.image}</p>}
        </div>

        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Hostel details</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Fill in the basic hostel info. You can add rooms (with pricing &amp; amenities) after creation.
          </p>

          {/* Hostel Name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Hostel name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Kacyiru Student Residence"
              className="input"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Location *</label>
            <input
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Kacyiru, Kigali"
              className="input"
            />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Describe the hostel — facilities, rules, nearby landmarks…"
              className="input resize-none"
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
            💡 <strong>Tip:</strong> After the hostel is created and verified, go to <em>Manage Rooms</em> to add room types, set prices, and upload room-specific photos.
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
