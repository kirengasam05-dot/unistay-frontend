import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import { housings } from '../../data/mockData';

export default function HostDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800 sm:p-8">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">Manage housing, bookings &amp; availability.</h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">Students cannot pay until you confirm the booking and room availability.</p>
          <Link className="btn-white mt-6 inline-flex rounded-xl" to="/host/listings">Add or manage housing</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total listings', value: housings.length,                              color: 'text-neutral-900 dark:text-white',         bg: 'bg-neutral-100 dark:bg-neutral-800', icon: Building2      },
          { label: 'Available',      value: housings.filter(h => h.availability).length,  color: 'text-emerald-600 dark:text-emerald-400',   bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: CheckCircle2 },
          { label: 'Booked',         value: housings.filter(h => !h.availability).length, color: 'text-red-600 dark:text-red-400',           bg: 'bg-red-50 dark:bg-red-900/30',       icon: XCircle        },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
                <p className={`mt-0.5 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">Listing status</h2>
        <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
          {housings.map(h => (
            <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-black text-neutral-900 dark:text-white">{h.title}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{h.location} · RWF {h.price.toLocaleString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${h.availability ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {h.availability ? 'AVAILABLE' : 'BOOKED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
