import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { housingApi } from '../../housing/housingApi';
import type { Housing } from '../../../types/api';

export default function AdminModerationPage() {
  const [items, setItems]     = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState<string | null>(null);

  useEffect(() => {
    housingApi.getAll()
      .then(all => setItems(all.filter(h => h.verificationStatus === 'PENDING')))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  async function act(id: string, action: 'verify' | 'reject') {
    setBusyId(id);
    try {
      if (action === 'verify') {
        await housingApi.verify(id);
        setItems(prev => prev.map(h => h.id === id ? { ...h, verificationStatus: 'VERIFIED' } : h));
        toast.success('Listing approved');
      } else {
        await housingApi.reject(id);
        setItems(prev => prev.map(h => h.id === id ? { ...h, verificationStatus: 'REJECTED' } : h));
        toast.success('Listing rejected');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-black">Housing & Job Moderation</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Approve verified listings and reject unsafe or incomplete content.</p>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-black text-neutral-900 dark:text-white">No pending listings</p>
          <p className="mt-1 text-sm text-neutral-500">All housing has been moderated.</p>
        </div>
      ) : (
        items.map(h => (
          <div className="card" key={h.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{h.title}</h2>
                <p className="text-sm text-neutral-500">{h.location} · RWF {h.price.toLocaleString()}/month</p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busyId === h.id || h.verificationStatus !== 'PENDING'}
                  onClick={() => act(h.id, 'verify')}
                  className="flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 font-bold text-white disabled:bg-neutral-300"
                >
                  {busyId === h.id && <Loader2 size={14} className="animate-spin" />}
                  Approve
                </button>
                <button
                  disabled={busyId === h.id || h.verificationStatus !== 'PENDING'}
                  onClick={() => act(h.id, 'reject')}
                  className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-bold text-white disabled:bg-neutral-300"
                >
                  Reject
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm font-black">Status: {h.verificationStatus}</p>
          </div>
        ))
      )}
    </div>
  );
}
