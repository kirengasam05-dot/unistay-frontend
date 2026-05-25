import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudUpload, ImageOff, Plus, X } from 'lucide-react';
import { addListing } from '../../../lib/listingsStorage';

interface FormState {
  title: string;
  location: string;
  price: string;
  description: string;
  amenities: string;
}

const BLANK: FormState = { title: '', location: '', price: '', description: '', amenities: '' };

export default function HostAddListingPage() {
  const navigate = useNavigate();

  const [form, setForm]       = useState<FormState>(BLANK);
  const [errors, setErrors]   = useState<Partial<FormState & { image: string }>>({});
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [dragging, setDragging]   = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErrors(e => ({ ...e, image: 'Only image files are accepted.' }));
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(reader.result as string);
      setErrors(e => ({ ...e, image: undefined }));
    };
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  function validate() {
    const e: Partial<FormState & { image: string }> = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Enter a valid price';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    addListing({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      location: form.location.trim(),
      price: Number(form.price),
      availability: true,
      verificationStatus: 'PENDING',
      hostId: 'u-host',
      image: imageFile ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
      description: form.description.trim() || undefined,
      amenities: form.amenities.trim() || undefined,
    });

    navigate('/host/listings');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/host/listings')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">New Listing</h1>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Fill in the details below to publish a housing listing.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">

        {/* Image upload */}
        <div className="card">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Property photo
          </label>

          {imageFile ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={imageFile} alt="Preview" className="h-64 w-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImageName(''); }}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                {imageName}
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${
                dragging
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-500 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-700">
                {dragging ? <CloudUpload size={26} className="text-neutral-700 dark:text-neutral-200" /> : <ImageOff size={24} className="text-neutral-500 dark:text-neutral-400" />}
              </div>
              <div className="text-center">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {dragging ? 'Drop it here' : 'Drag & drop your photo here'}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  or <span className="font-semibold text-neutral-900 underline dark:text-white">click to browse</span>
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">PNG, JPG, WEBP — max 10 MB</p>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }}
          />
          {errors.image && <p className="mt-2 text-xs text-red-500">{errors.image}</p>}
        </div>

        {/* Core details */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Property details</h2>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Kacyiru Student Residence"
              className="input"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Monthly price (RWF) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="e.g. 150000"
              className="input"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description <span className="font-normal text-neutral-400">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Describe the property — size, features, nearby amenities…"
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Amenities <span className="font-normal text-neutral-400">(optional)</span></label>
            <input
              value={form.amenities}
              onChange={e => set('amenities', e.target.value)}
              placeholder="e.g. WiFi, Hot water, Security, Parking"
              className="input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <button
            onClick={() => navigate('/host/listings')}
            className="btn-white rounded-xl"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-black rounded-xl flex items-center gap-2">
            <Plus size={15} /> Create listing
          </button>
        </div>
      </div>
    </div>
  );
}
