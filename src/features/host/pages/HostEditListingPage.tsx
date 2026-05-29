import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import type { Housing } from "../../../types/api";

interface FormState { title: string; location: string; price: string; bedrooms: string; description: string; amenities: string; }

export default function HostEditListingPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({ title: "", location: "", price: "", bedrooms: "", description: "", amenities: "" });

  useEffect(() => {
    (async () => {
      try {
        const h = await housingApi.getOne(id);
        setForm({
          title: h.title || "",
          location: h.location || "",
          price: String(h.price ?? ""),
          bedrooms: h.bedrooms != null ? String(h.bedrooms) : "",
          description: h.description || "",
          amenities: (h.amenities || []).join(", "),
        });
        setImages(h.images || []);
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

  async function save() {
    if (!form.title.trim() || !form.location.trim() || !form.price.trim()) {
      toast.error("Title, location and price are required.");
      return;
    }
    setSaving(true);
    try {
      await housingApi.update(id, {
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),
        bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : undefined,
        description: form.description.trim(),
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      });
      toast.success("Listing updated");
      navigate("/host/listings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update listing");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    try {
      const updated = await housingApi.addImages(id, Array.from(files));
      syncImages(updated);
      toast.success("Images added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload images");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeImage(url: string) {
    const ok = await confirm({
      title: "Remove this image?",
      description: "The image will be deleted from this listing.",
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
      description: `"${form.title}" will be permanently removed. This cannot be undone.`,
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
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {images.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-xl">
                  <img src={url} alt="Listing" className="h-28 w-full object-cover" />
                  <button onClick={() => removeImage(url)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-red-600">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No photos yet.</p>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-white mt-4 inline-flex items-center gap-2 rounded-xl disabled:opacity-60">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {uploading ? "Uploading…" : "Add photos"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && uploadImages(e.target.files)} />
        </div>

        {/* details */}
        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Property details</h2>
          {([["title", "Title *", "e.g. Kacyiru Student Residence"], ["location", "Location *", "e.g. Kacyiru, Kigali"], ["amenities", "Amenities (comma-separated)", "e.g. WiFi, Hot water, Security"]] as const).map(([key, label, ph]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>
              <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph} className="input" />
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Monthly price (RWF) *</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pb-6">
          <button onClick={deleteListing} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
            <Trash2 size={15} /> Delete
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate("/host/listings")} className="btn-white rounded-xl">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-black rounded-xl inline-flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
