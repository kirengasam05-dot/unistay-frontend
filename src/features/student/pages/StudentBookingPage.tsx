import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { housings } from '../../../data/mockData';

type Status = 'idle' | 'requested' | 'confirmed' | 'paid';

const statusLabel: Record<Status, string> = {
  idle: 'Ready to request',
  requested: 'Waiting for host confirmation…',
  confirmed: 'Confirmed — payment unlocked',
  paid: 'Payment completed',
};

export default function StudentBookingPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Housing Booking</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Check availability first. The payment button appears only after the host confirms your request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {housings.map((h) => {
          const s = status[h.id] || 'idle';
          const unavailable = !h.availability;

          return (
            <div key={h.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative">
                <img src={h.image} className="h-48 w-full object-cover" alt={h.title} />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${h.availability ? 'bg-emerald-500 text-white' : 'bg-neutral-500 text-white'}`}>
                  {h.availability ? 'Available' : 'Booked'}
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-black text-neutral-900 dark:text-white">{h.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin size={13} />{h.location}
                </p>
                <p className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">RWF {h.price.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">per month</p>

                <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm dark:bg-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Status: </span>
                  <span className="text-neutral-600 dark:text-neutral-400">{unavailable ? 'Already booked' : statusLabel[s]}</span>
                </div>

                <div className="mt-4 grid gap-2">
                  {unavailable ? (
                    <button disabled className="w-full rounded-xl bg-neutral-100 py-3 font-bold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600">
                      Not available
                    </button>
                  ) : s === 'idle' ? (
                    <button onClick={() => setStatus({ ...status, [h.id]: 'requested' })} className="btn-black w-full rounded-xl">
                      Request booking
                    </button>
                  ) : s === 'requested' ? (
                    <button onClick={() => setStatus({ ...status, [h.id]: 'confirmed' })} className="w-full rounded-xl bg-amber-500 py-3 font-bold text-white hover:bg-amber-600">
                      Simulate host confirmation
                    </button>
                  ) : s === 'confirmed' ? (
                    <button onClick={() => setStatus({ ...status, [h.id]: 'paid' })} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700">
                      Pay now
                    </button>
                  ) : (
                    <button disabled className="w-full rounded-xl bg-emerald-100 py-3 font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Payment completed ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
