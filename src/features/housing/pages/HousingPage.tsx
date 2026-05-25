import { MapPin } from 'lucide-react';
import { housings } from '../../../data/mockData';

export default function HousingPage() {
  return (
    <div className="dark:bg-neutral-950">
      <section className="page-hero">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-black text-white sm:text-5xl">Verified student housing</h1>
          <p className="mt-3 max-w-xl text-neutral-400">Browse verified rooms and apartments. Payment only processes after your host confirms the booking.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {housings.map((h) => (
            <div key={h.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative overflow-hidden">
                <img className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" src={h.image} alt={h.title} />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${h.availability ? 'bg-emerald-500' : 'bg-neutral-500'}`}>
                    {h.availability ? 'Available' : 'Booked'}
                  </span>
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {h.verificationStatus}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-black text-neutral-900 dark:text-white">{h.title}</h2>
                <div className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin size={13} />{h.location}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-black text-neutral-900 dark:text-white">RWF {h.price.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">per month</p>
                  </div>
                  <button className="btn-black rounded-xl px-4 py-2 text-sm">Request booking</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
