import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../applications/applicationsApi';
import type { Application } from '../../applications/applicationsApi';

export default function EmployerApplicationsPage() {
  const [items, setItems]     = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState<string | null>(null);

  useEffect(() => {
    applicationsApi.getAll()
      .then(setItems)
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  async function decide(id: string, action: 'accept' | 'reject') {
    setBusyId(id);
    try {
      const updated = action === 'accept' ? await applicationsApi.accept(id) : await applicationsApi.reject(id);
      setItems(prev => prev.map(a => a.id === id ? updated : a));
      toast.success(action === 'accept' ? 'Application accepted. Acceptance email generated.' : 'Application rejected. Feedback email sent.');
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-black">Review Applications</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Check if student requirements are compatible. If not compatible, reject and email notification is generated.</p>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-black text-neutral-900 dark:text-white">No applications yet</p>
          <p className="mt-1 text-sm text-neutral-500">Applications from students will appear here.</p>
        </div>
      ) : (
        items.map(a => (
          <div className="card" key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{a.user?.fullName || `Applicant ${a.userId}`}</h2>
                <p className="text-sm text-neutral-500">
                  Applied for: {a.job?.title || a.jobId}
                  {a.score !== undefined && ` · Compatibility score ${a.score}%`}
                </p>
                {a.compatible === false && a.missing && a.missing.length > 0 && (
                  <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">Missing: {a.missing.join(', ')}</p>
                )}
                <p className="mt-3 text-sm font-bold">
                  Email:{' '}
                  {a.status === 'ACCEPTED' ? 'Acceptance email ready' : a.status === 'REJECTED' ? 'Rejection email sent with improvement advice' : 'Waiting for decision'}
                </p>
              </div>
              {a.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button disabled={busyId === a.id || a.compatible === false} onClick={() => decide(a.id, 'accept')} className="flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 font-bold text-white disabled:bg-neutral-300">
                    {busyId === a.id && <Loader2 size={14} className="animate-spin" />} Accept
                  </button>
                  <button disabled={busyId === a.id} onClick={() => decide(a.id, 'reject')} className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-bold text-white disabled:bg-neutral-300">
                    Reject
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm font-black">Status: {a.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
