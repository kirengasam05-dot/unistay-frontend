import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, MapPin, Sparkles, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { jobsApi } from "../../jobs/jobsApi";
import { useAuth } from "../../../context/AuthContext";
import type { Housing } from "../../../types/api";
import type { Job } from "../../jobs/jobsApi";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const firstImage = (h: Housing) => h.images?.[0] || h.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";

export default function StudentRecommendationsPage() {
  const { user } = useAuth();
  const [housing, setHousing] = useState<Housing[]>([]);
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      housingApi.getAll().then(all => all.filter(h => h.verificationStatus === "VERIFIED" && h.availability)).catch(() => [] as Housing[]),
      jobsApi.getAll().catch(() => [] as Job[]),
    ]).then(([h, j]) => { setHousing(h); setJobs(j); })
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load recommendations"))
      .finally(() => setLoading(false));
  }, []);

  const topHousing = useMemo(() => housing.slice(0, 3), [housing]);
  const topJobs    = useMemo(() => jobs.slice(0, 3), [jobs]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-black p-8 text-white">
        <p className="flex items-center gap-2 text-sm font-bold text-neutral-300"><Sparkles size={16} /> Personalised for you</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Recommendations{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
        <p className="mt-3 max-w-2xl text-neutral-300">Verified rooms that are available right now and jobs that fit a student schedule.</p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Top verified housing</h2>
          <Link to="/housing" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Browse all</Link>
        </div>
        {loading ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-2xl border border-neutral-200 dark:border-neutral-800"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : topHousing.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">No available verified rooms right now. Check back soon.</p>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {topHousing.map(h => (
              <Link key={h.id} to={`/housing/${h.id}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <img src={firstImage(h)} alt={h.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-black text-neutral-900 dark:text-white">{h.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500"><MapPin size={13} />{h.location}</p>
                  <p className="mt-2 font-black text-neutral-900 dark:text-white">{money(h.price)}<span className="text-xs font-normal text-neutral-500">/mo</span></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Jobs that fit your schedule</h2>
          <Link to="/student/jobs" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">See all jobs</Link>
        </div>
        {loading ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-2xl border border-neutral-200 dark:border-neutral-800"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : topJobs.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">No jobs available right now.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {topJobs.map(j => (
              <div key={j.id} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:flex-row md:items-center md:justify-between">
                <div>
                  {j.category && <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{j.category}</span>}
                  <h3 className="mt-2 text-lg font-black text-neutral-900 dark:text-white">{j.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{j.location}</span>
                    {j.salary && <span className="flex items-center gap-1"><Wallet size={14} />{money(j.salary)}</span>}
                  </div>
                </div>
                <Link to="/student/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 font-bold text-white dark:bg-white dark:text-black">Apply <ArrowRight size={15} /></Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
