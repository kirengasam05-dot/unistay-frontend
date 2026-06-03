import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MapPin, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../housingApi";
import type { Housing } from "../../../shared/types/api";
import { hostelName } from "../../../shared/types/api";

const money = (value: number) => `RWF ${Number(value || 0).toLocaleString()}`;
const firstImage = (h: Housing) =>
  h.images?.[0] || h.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";

export default function HousingPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = [searchParams.get("q"), searchParams.get("loc")].filter(Boolean).join(" ");
  const [items, setItems]   = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState(initialQuery);
  const [category, setCategory] = useState<string>("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    housingApi.getAll()
      .then(setItems)
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load hostels"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    return items.filter((h) => {
      const matchSearch = `${h.name ?? h.title} ${h.location} ${h.description || ""}`.toLowerCase().includes(value);
      const price = h.price ?? 0;
      const hCategory = h.category ?? (price >= 80000 ? "VIP" : price >= 35000 ? "Standard" : "Budget");
      const matchCategory = category === "ALL" || hCategory === category;
      const matchPrice = price <= maxPrice;
      const matchAvailability = !onlyAvailable || h.availability;
      return matchSearch && matchCategory && matchPrice && matchAvailability;
    });
  }, [items, query, category, maxPrice, onlyAvailable]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* hero */}
      <section className="rounded-[2rem] bg-black p-8 text-white">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-neutral-400">Verified hostels</p>
        <h1 className="mt-4 text-4xl font-black md:text-5xl">Find a safe student hostel and pay only after host confirmation.</h1>
        <p className="mt-4 max-w-2xl text-neutral-300">Live backend listings, host confirmation, and secure payment proof tracking.</p>
      </section>

      {/* search and filters */}
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition
                       placeholder:text-neutral-400 focus:border-neutral-500
                       dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
            placeholder="Search by location or title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "Budget", "Standard", "VIP"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  category === cat
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-4 min-w-[200px] flex-1 max-w-sm">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">Max Price:</span>
            <input
              type="range"
              min="20000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-black dark:accent-white"
            />
            <span className="text-xs font-black text-neutral-900 dark:text-white shrink-0">
              RWF {maxPrice.toLocaleString()}
            </span>
          </div>

          {/* Availability Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-800"
            />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Show Available Only</span>
          </label>
        </div>
      </section>

      {/* states */}
      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-[2rem] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <Loader2 className="animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Search size={24} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">No listings found</h2>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {query ? `No results for "${query}". Try a different search.` : "Check back soon for new verified rooms."}
          </p>
          {query && (
            <button onClick={() => setQuery("")} className="mt-5 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {filtered.map((housing) => {
            const isVerified = housing.verificationStatus === "VERIFIED";
            const canBook = isVerified && housing.availability;

            return (
              <Link
                key={housing.id}
                to={`/hostels/${housing.id}`}
                className="group block overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative">
                  <img src={firstImage(housing)} alt={hostelName(housing)} className="h-56 w-full object-cover" />
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
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white">{hostelName(housing)}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <MapPin size={15} />{housing.location}
                  </p>
                  <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                    {housing.description || "Verified student accommodation."}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Monthly price</p>
                      <p className="text-2xl font-black text-neutral-900 dark:text-white">{money(housing.price ?? 0)}</p>
                    </div>
                    <span className="rounded-2xl bg-black px-5 py-3 text-sm font-black text-white transition group-hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:group-hover:bg-neutral-100">
                      View details
                    </span>
                  </div>
                  {canBook && (
                    <p className="mt-4 flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 size={15} />Payment appears after host confirmation
                    </p>
                  )}
                  {!isVerified && (
                    <p className="mt-4 flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      <ShieldCheck size={15} />Waiting for verification
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
