import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CheckCircle2, Loader2, MapPin, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { Housing } from "../../../shared/types/api";
import { useHousingQuery } from "../../housing/hooks/useHousingQueries";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const firstImage = (h: Housing) =>
  h.images?.[0] || h.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";

export default function StudentHousingPage() {
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const { data = [], error, isPending: loading } = useHousingQuery();
  const items: Housing[] = data.filter((h) => h.verificationStatus === "VERIFIED");

  useEffect(() => {
    if (error) toast.error(error instanceof Error ? error.message : "Failed to load hostels");
  }, [error]);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    return items.filter((h) => {
      const matchText = `${h.title} ${h.location} ${h.description || ""}`.toLowerCase().includes(value);
      const matchAvail = !onlyAvailable || h.availability;
      return matchText && matchAvail;
    });
  }, [items, query, onlyAvailable]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-700 to-slate-950 p-6 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Verified student stays</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black sm:text-4xl">Find a comfortable hostel close to where life happens.</h1>
        <p className="mt-3 max-w-xl text-sm text-emerald-50">Browse available verified rooms, compare amenities, and request your booking before making a payment.</p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by location or title…" className="input pl-10" />
        </div>
        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${onlyAvailable ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
        >
          {onlyAvailable ? "Available only" : "Showing all"}
        </button>
      </div>

      {loading ? (
        <div className="card grid min-h-72 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center">
          <ShieldCheck size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">No hostels found</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try a different search or check back soon for new verified rooms.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h) => (
            <Link key={h.id} to={`/hostels/${h.id}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative">
                <img src={firstImage(h)} alt={h.title} className="h-44 w-full object-cover" />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black text-white ${h.availability ? "bg-emerald-500" : "bg-neutral-500"}`}>
                  {h.availability ? "Available" : "Booked"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-black text-neutral-900 dark:text-white">{h.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400"><MapPin size={13} />{h.location}</p>
                {typeof h.bedrooms === "number" && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400"><BedDouble size={13} />{h.bedrooms} bedroom{h.bedrooms === 1 ? "" : "s"}</p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-500">Monthly</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-white">{money(h.price)}</p>
                  </div>
                  <span className="rounded-xl bg-black px-4 py-2.5 text-sm font-black text-white transition group-hover:bg-neutral-800 dark:bg-white dark:text-black">View &amp; book</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={13} /> Verified listing</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
