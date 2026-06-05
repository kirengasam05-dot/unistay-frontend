import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  ImageOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useConfirm } from "../../../shared/components/ui/ConfirmDialog";
import type { Housing } from "../../../shared/types/api";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";
const firstImage = (h: Housing) => h.images?.[0] || h.image || FALLBACK_IMG;
const verifyPill = (s: Housing["verificationStatus"]) =>
  s === "VERIFIED"
    ? "bg-blue-500"
    : s === "REJECTED"
      ? "bg-red-500"
      : "bg-amber-500";
const hasOpenBeds = (h: Housing) => h.occupancyStatus ? h.occupancyStatus === "AVAILABLE" : (h.available ?? h.availability ?? false);

export default function HostListingsPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [items, setItems] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setItems(await housingApi.getMyListings());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load your listings",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(h: Housing) {
    const ok = await confirm({
      title: "Delete this listing?",
      description: `"${h.name ?? h.title}" will be permanently removed. This cannot be undone.`,
      confirmText: "Delete listing",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      setBusyId(h.id);
      await housingApi.remove(h.id);
      setItems((prev) => prev.filter((x) => x.id !== h.id));
      toast.success("Listing deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete listing",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">
              My Listings
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage your hostel listings. Availability is updated automatically
              from room beds and paid applications.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={load}
              className="btn-white rounded-xl flex items-center gap-2"
            >
              <RefreshCcw size={15} /> Refresh
            </button>
            <button
              onClick={() => navigate("/host/listings/new")}
              className="btn-black rounded-xl flex items-center gap-2"
            >
              <Plus size={15} /> Add listing
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card grid min-h-72 place-items-center">
          <Loader2 className="animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <ImageOff
            size={40}
            className="mx-auto text-neutral-400 dark:text-neutral-600"
          />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">
            No listings yet
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Add your first listing to get started.
          </p>
          <button
            onClick={() => navigate("/host/listings/new")}
            className="btn-black mt-5 rounded-xl inline-flex items-center gap-2"
          >
            <Plus size={15} /> Add listing
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((h) => {
            const isAvailable = hasOpenBeds(h);
            return (
            <div
              key={h.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900 max-w-[23rem]"
            >
              <div className="relative">
                <img
                  src={firstImage(h)}
                  alt={h.title}
                  className="h-44 w-full object-cover"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${isAvailable ? "bg-emerald-500" : "bg-red-600"}`}
                >
                  {isAvailable ? "Available" : "Occupied all"}
                </span>
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${verifyPill(h.verificationStatus)}`}
                >
                  {h.verificationStatus}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-black text-neutral-900 dark:text-white">
                  {h.name ?? h.title}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin size={13} />
                  {h.location}
                </p>
                {h.description && (
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {h.description}
                  </p>
                )}
                {h.amenities && h.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {h.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">
                  RWF {Number(h.price ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  per month
                </p>
                <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  Status updates automatically from available beds.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={busyId === h.id}
                    onClick={() => navigate(`/host/listings/${h.id}/edit`)}
                    title="Edit listing"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Pencil size={16} /> Edit listing
                  </button>
                  <button
                    disabled={busyId === h.id}
                    onClick={() => remove(h)}
                    title="Delete listing"
                    className="flex items-center justify-center rounded-xl bg-red-50 px-4 text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
