import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MapPin, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../housingApi";
import type { Housing } from "../../../types/api";

const money = (value: number) => `RWF ${Number(value || 0).toLocaleString()}`;
const firstImage = (h: Housing) =>
  h.images?.[0] || h.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";

export default function HousingPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = [searchParams.get("q"), searchParams.get("loc")].filter(Boolean).join(" ");
  const [items, setItems] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);

  async function loadHousing() {
    try {
      setLoading(true);
      setItems(await housingApi.getAll());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load housing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHousing(); }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    return items.filter((h) =>
      `${h.title} ${h.location} ${h.description || ""}`.toLowerCase().includes(value)
    );
  }, [items, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] bg-black p-8 text-white">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-neutral-400">Verified housing</p>
        <h1 className="mt-4 text-4xl font-black md:text-5xl">Find safe student housing and pay only after host confirmation.</h1>
        <p className="mt-4 max-w-2xl text-neutral-300">Live backend listings, host confirmation, and secure payment proof tracking.</p>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-black"
            placeholder="Search by location or title" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-[2rem] border border-neutral-200 bg-white">
          <Loader2 className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center">
          <h2 className="text-2xl font-black">No listings found</h2>
          <p className="mt-2 text-neutral-600">Try a different search, or check back soon for new verified rooms.</p>
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {filtered.map((housing) => {
            const isVerified = housing.verificationStatus === "VERIFIED";
            const canBook = isVerified && housing.availability;

            return (
              <Link key={housing.id} to={`/housing/${housing.id}`} className="group block overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative">
                  <img src={firstImage(housing)} alt={housing.title} className="h-56 w-full object-cover" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${housing.availability ? "bg-green-600" : "bg-red-600"}`}>
                      {housing.availability ? "Available" : "Booked"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${isVerified ? "bg-black" : "bg-neutral-500"}`}>
                      {housing.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black">{housing.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500"><MapPin size={15} />{housing.location}</p>
                  <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-neutral-600">{housing.description || "Verified student accommodation."}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div><p className="text-xs font-bold text-neutral-500">Monthly price</p><p className="text-2xl font-black">{money(housing.price)}</p></div>
                    <span className="rounded-2xl bg-black px-5 py-3 text-sm font-black text-white transition group-hover:bg-neutral-800">View details</span>
                  </div>
                  {canBook && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-green-700"><CheckCircle2 size={15} />Payment appears after host confirmation</p>}
                  {!isVerified && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-neutral-500"><ShieldCheck size={15} />Waiting for verification</p>}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
