import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, Loader2, MapPin, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { housingApi } from '../../housing/housingApi';
import type { Housing } from '../../../types/api';

export default function HostListingsPage() {
  const navigate = useNavigate();
  const [items, setItems]   = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    housingApi.getMine()
      .then(setItems)
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(h: Housing) {
    setTogglingId(h.id);
    try {
      const updated = await housingApi.update(h.id, { availability: !h.availability });
      setItems(prev => prev.map(x => x.id === h.id ? updated : x));
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setTogglingId(null);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await housingApi.remove(id);
      setItems(prev => prev.filter(x => x.id !== id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">My Listings</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage your housing listings. Keep availability accurate so students can book.
            </p>
          </div>
          <button onClick={() => navigate('/host/listings/new')} className="btn-black shrink-0 rounded-xl flex items-center gap-2">
            <Plus size={15} /> Add listing
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <ImageOff size={40} className="mx-auto text-neutral-400 dark:text-neutral-600" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No listings yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Add your first listing to get started.</p>
          <button onClick={() => navigate('/host/listings/new')} className="btn-black mt-5 rounded-xl inline-flex items-center gap-2">
            <Plus size={15} /> Add listing
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map(h => (
            <div key={h.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative">
                {(h.image || (h.images && h.images[0])) ? (
                  <img src={h.image || h.images![0]} alt={h.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    <ImageOff size={32} className="text-neutral-400" />
                  </div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${h.availability ? 'bg-emerald-500 text-white' : 'bg-neutral-500 text-white'}`}>
                  {h.availability ? 'Available' : 'Booked'}
                </span>
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${h.verificationStatus === 'VERIFIED' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {h.verificationStatus}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-black text-neutral-900 dark:text-white">{h.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400"><MapPin size={13} />{h.location}</p>
                {h.description && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{h.description}</p>}
                {h.amenities && h.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {h.amenities.map(a => (
                      <span key={a} className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{a}</span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">RWF {h.price.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">per month</p>
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={togglingId === h.id}
                    onClick={() => toggleAvailability(h)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${h.availability ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'}`}
                  >
                    {togglingId === h.id ? <Loader2 size={16} className="animate-spin" /> : h.availability ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {h.availability ? 'Mark as booked' : 'Mark as available'}
                  </button>
                  <button
                    disabled={deletingId === h.id}
                    onClick={() => remove(h.id)}
                    className="flex items-center justify-center rounded-xl bg-red-50 px-4 text-red-600 hover:bg-red-100 disabled:opacity-60 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                  >
                    {deletingId === h.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
