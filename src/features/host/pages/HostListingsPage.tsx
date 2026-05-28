import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';
import { getListings, saveListings } from '../../../lib/listingsStorage';
import type { Listing } from '../../../lib/listingsStorage';

export default function HostListingsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Listing[]>([]);

  useEffect(() => { setItems(getListings()); }, []);

  function toggleAvailability(id: string) {
    const updated = items.map(h => h.id === id ? { ...h, availability: !h.availability } : h);
    setItems(updated);
    saveListings(updated);
  }

  function remove(id: string) {
    const updated = items.filter(h => h.id !== id);
    setItems(updated);
    saveListings(updated);
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

      {items.length === 0 && (
        <div className="card py-12 text-center">
          <ImageOff size={40} className="mx-auto text-neutral-400 dark:text-neutral-600" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No listings yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Add your first listing to get started.</p>
          <button onClick={() => navigate('/host/listings/new')} className="btn-black mt-5 rounded-xl inline-flex items-center gap-2">
            <Plus size={15} /> Add listing
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {items.map(h => (
          <div key={h.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative">
              <img src={h.image} alt={h.title} className="h-44 w-full object-cover" />
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
              {h.amenities && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.amenities.split(',').map(a => (
                    <span key={a} className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{a.trim()}</span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">RWF {h.price.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">per month</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleAvailability(h.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${h.availability ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'}`}
                >
                  {h.availability ? <><ToggleRight size={16} /> Mark as booked</> : <><ToggleLeft size={16} /> Mark as available</>}
                </button>
                <button onClick={() => remove(h.id)} className="flex items-center justify-center rounded-xl bg-red-50 px-4 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
