import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useConfirm } from "../../../shared/components/ui/ConfirmDialog";
import type { Housing } from "../../../shared/types/api";

interface FormState {
  name: string;
  location: string;
  description: string;
  price: string;
  category: '' | 'VIP' | 'Standard' | 'Budget';
  bedrooms: string;
  capacity: string;
}

const COMMON_AMENITIES = [
  'WiFi', 'Hot Water', 'Security', 'Parking', 'Laundry',
  'Study Room', 'Kitchen', 'Generator', 'CCTV', 'Gym',
];

export default function HostEditListingPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages]     = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [form, setForm] = useState<FormState>({
    name: "", location: "", description: "",
    price: "", category: "", bedrooms: "", capacity: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const h = await housingApi.getOne(id);
        setForm({
          name: h.name ?? h.title ?? "",
          location: h.location || "",
          description: h.description || "",
          price: h.price != null ? String(h.price) : "",
          category: (h.category as FormState['category']) || "",
          bedrooms: h.bedrooms != null ? String(h.bedrooms) : "",
          capacity: h.capacity != null ? String(h.capacity) : "",
        });
        setImages(h.images || []);
        setAmenities(h.amenities || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load listing");
        navigate("/host/listings");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  function set(key: keyof FormState, value: string) { setForm((f) => ({ ...f, [key]: value })); }
  function syncImages(h: Housing) { setImages(h.images || []); }

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

  async function save() {
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Hostel name and location are required.");
      return;
    }
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) <= 0)) {
      toast.error("Enter a valid price.");
      return;
    }
    setSaving(true);
    try {
      await housingApi.update(id, {
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim() || undefined,
        price: form.price ? Number(form.price) : undefined,
        category: form.category || undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        amenities: amenities.length ? amenities : undefined,
      });
      toast.success("Hostel updated");
      navigate("/host/listings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update hostel");
    } finally {
      setSaving(false);
    }
  }

  async function addImage() {
    const url = imageUrl.trim();
    if (!url) return toast.error("Paste an image URL first");
    if (!/^https?:\/\//i.test(url)) return toast.error("URL must start with http:// or https://");
    setUploading(true);
    try {
      const updated = await housingApi.addImages(id, [url]);
      syncImages(updated);
      setImageUrl("");
      toast.success("Image added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add image");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(url: string) {
    const ok = await confirm({
      title: "Remove this image?",
      description: "The image will be removed from this listing.",
      confirmText: "Remove image",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const updated = await housingApi.removeImage(id, url);
      syncImages(updated);
      toast.success("Image removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove image");
    }
  }

  async function deleteListing() {
    const ok = await confirm({
      title: "Delete this listing?",
      description: `"${form.name || 'This hostel'}" will be permanently removed. This cannot be undone.`,
      confirmText: "Delete listing",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await housingApi.remove(id);
      toast.success("Listing deleted");
      navigate("/host/listings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete listing");
    }
  }

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/host/listings")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Edit Listing</h1>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Update details, manage photos, or delete this listing.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        {/* images */}
        <div className="card">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Photos</label>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-xl">
                  <img src={url} alt="Listing" className="h-28 w-full object-cover" />
                  <button onClick={() => removeImage(url)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-red-600">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              placeholder="Paste image URL (https://...)"
              className="input flex-1"
            />
            <button onClick={addImage} disabled={uploading} className="btn-black rounded-xl inline-flex items-center gap-2 shrink-0 disabled:opacity-60">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              {uploading ? "Adding…" : "Add"}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">Paste a Cloudinary, Unsplash, or any public image URL and press Enter or click Add.</p>
        </div>

        {/* Hostel details */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Hostel details</h2>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Hostel name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Kacyiru Student Residence" className="input" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Location *</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Kacyiru, Kigali" className="input" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none" placeholder="Describe the hostel…" />
          </div>
        </div>

        {/* Pricing & Category */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Pricing &amp; category</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Set the monthly price and room category so students know what to expect.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Monthly Price */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Monthly price (RWF)</label>
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
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Category</label>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Number of rooms</label>
              <input
                type="number"
                min="1"
                value={form.bedrooms}
                onChange={e => set('bedrooms', e.target.value)}
                placeholder="e.g. 20"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Total bed capacity</label>
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
          <button onClick={deleteListing} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
            <Trash2 size={15} /> Delete
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate("/host/listings")} className="btn-white rounded-xl">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-black rounded-xl inline-flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
