import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudUpload, ImageOff, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { housingApi } from '../../housing/housingApi';

interface FormState {
  name: string;
  location: string;
  description: string;
  price: string;
  category: '' | 'VIP' | 'Standard' | 'Budget';
  bedrooms: string;
  capacity: string;
}
const BLANK: FormState = {
  name: '', location: '', description: '',
  price: '', category: '', bedrooms: '', capacity: '',
};

interface Picked { file: File; url: string; }

const COMMON_AMENITIES = [
  'WiFi', 'Hot Water', 'Security', 'Parking', 'Laundry',
  'Study Room', 'Kitchen', 'Generator', 'CCTV', 'Gym',
];

export default function HostAddListingPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'image' | 'amenities', string>>>({});
  const [images, setImages] = useState<Picked[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
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

  function addAmenity(value?: string) {
    const item = (value ?? amenityInput).trim();
    if (!item) return;
    if (amenities.includes(item)) { toast.error('Already added'); return; }
    setAmenities(prev => [...prev, item]);
    setAmenityInput('');
  }

  function removeAmenity(item: string) {
    setAmenities(prev => prev.filter(a => a !== item));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, []);

  function validate() {
    const e: Partial<Record<keyof FormState | 'image', string>> = {};
    if (!form.name.trim())     e.name     = 'Hostel name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.price.trim())    e.price    = 'Monthly price is required';
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) <= 0))
      e.price = 'Enter a valid price';
    if (!form.category) e.category = 'Please select a category';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      category: form.category as 'VIP' | 'Standard' | 'Budget',
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      amenities: amenities.length ? amenities : undefined,
    };

    setSubmitting(true);
    try {
      await housingApi.create(payload, images.map(i => i.file));
      toast.success('Hostel created — pending verification.');
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
        </div>

        {/* Pricing & Category */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Pricing &amp; category</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Set the monthly price and category so students know what to expect.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Monthly Price */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Monthly price (RWF) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">RWF</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="e.g. 150000"
                  className="input pl-12"
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="input"
              >
                <option value="">Select category…</option>
                <option value="VIP">🌟 VIP — Premium rooms</option>
                <option value="Standard">🏠 Standard — Comfortable rooms</option>
                <option value="Budget">💰 Budget — Affordable rooms</option>
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>
          </div>

          {/* Category description hint */}
          {form.category && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${
              form.category === 'VIP'
                ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400'
                : form.category === 'Standard'
                ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-400'
                : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {form.category === 'VIP' && '🌟 VIP rooms typically include en-suite bathrooms, AC, better furnishing, and more privacy.'}
              {form.category === 'Standard' && '🏠 Standard rooms offer shared facilities with good comfort at a moderate price.'}
              {form.category === 'Budget' && '💰 Budget rooms are the most affordable option, ideal for cost-conscious students.'}
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Capacity</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            How many rooms and beds does this hostel have?
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Number of rooms <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.bedrooms}
                onChange={e => set('bedrooms', e.target.value)}
                placeholder="e.g. 20"
                className="input"
              />
            </div>

            {/* Total Capacity */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Total bed capacity <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                placeholder="e.g. 80"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Amenities</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Select or type the amenities your hostel offers.
          </p>

          {/* Quick-add common amenities */}
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.filter(a => !amenities.includes(a)).map(a => (
              <button
                key={a}
                type="button"
                onClick={() => addAmenity(a)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-500"
              >
                <Plus size={12} /> {a}
              </button>
            ))}
          </div>

          {/* Custom amenity input */}
          <div className="flex gap-2">
            <input
              value={amenityInput}
              onChange={e => setAmenityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
              placeholder="Type a custom amenity and press Enter…"
              className="input flex-1"
            />
            <button type="button" onClick={() => addAmenity()} className="btn-white rounded-xl inline-flex items-center gap-1.5 shrink-0 text-sm">
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Selected amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
                  {a}
                  <button type="button" onClick={() => removeAmenity(a)} className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 dark:hover:bg-neutral-900/20">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
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
