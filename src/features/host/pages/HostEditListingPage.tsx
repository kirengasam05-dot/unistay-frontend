import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useConfirm } from "../../../shared/components/ui/ConfirmDialog";
import type { Housing } from "../../../shared/types/api";

interface FormState { name: string; location: string; description: string; }

export default function HostEditListingPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages]     = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState<FormState>({ name: "", location: "", description: "" });

  useEffect(() => {
    (async () => {
      try {
        const h = await housingApi.getOne(id);
        setForm({
          name: h.name ?? h.title ?? "",
          location: h.location || "",
          description: h.description || "",
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
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Hostel name and location are required.");
      return;
    }
    setSaving(true);
    try {
      await housingApi.update(id, {
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim() || undefined,
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

        <div className="card space-y-4">
          <h2 className="font-black text-neutral-900 dark:text-white">Hostel details</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Update the hostel's basic info. To manage rooms, pricing &amp; amenities, use the Rooms tab.
          </p>

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
