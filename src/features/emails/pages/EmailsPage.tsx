import { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { emailsApi } from '../emailsApi';
import type { Email } from '../emailsApi';

export default function EmailsPage() {
  const [emails, setEmails]   = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emailsApi.getMine()
      .then(setEmails)
      .catch(() => setEmails([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-black">Emails</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Booking updates, application decisions, verification notices, and certificates sent to your inbox.</p>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : emails.length === 0 ? (
        <div className="card py-12 text-center">
          <Mail size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No emails yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Notifications about bookings, applications and verifications will appear here.</p>
        </div>
      ) : (
        emails.map(e => (
          <div className="card" key={e.id}>
            {e.from && <p className="text-sm font-bold text-neutral-500">From: {e.from}</p>}
            {e.createdAt && <p className="text-xs text-neutral-400 mt-0.5">{new Date(e.createdAt).toLocaleDateString()}</p>}
            <h2 className="mt-1 text-xl font-black">{e.subject}</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">{e.body || e.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
