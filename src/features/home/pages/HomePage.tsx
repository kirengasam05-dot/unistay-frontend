import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, GraduationCap, Search, MapPin, Clock3, Wallet, CheckCircle2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { jobs, courses, housings as mockHousings } from '../../../data/mockData';
import { housingApi } from '../../housing/housingApi';
import type { Housing } from '../../../types/api';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const staticCategories = [
  { name: 'Software Development', icon: Briefcase },
  { name: 'Marketing',            icon: Users },
  { name: 'Sales & Communication', icon: GraduationCap },
  { name: 'Administration',       icon: ShieldCheck },
];

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const firstImage = (h: Housing) => h.images?.[0] || h.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80';

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [liveHousing, setLiveHousing] = useState<Housing[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await housingApi.getAll();
        setLiveHousing(all.filter((h) => h.verificationStatus === 'VERIFIED'));
      } catch {
        /* landing page still renders with mock featured rooms */
      }
    })();
  }, []);

  const featured = useMemo(() => (liveHousing.length ? liveHousing.slice(0, 2) : (mockHousings as unknown as Housing[]).slice(0, 2)), [liveHousing]);
  const housingList = useMemo(() => liveHousing.slice(0, 6), [liveHousing]);
  const isLive = liveHousing.length > 0;

  function runSearch() {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location.trim()) params.set('loc', location.trim());
    navigate(`/housing${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <div className="bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-950 text-white dark:border-neutral-800">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,_white,_transparent_35%),radial-gradient(circle_at_bottom_right,_white,_transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neutral-300">
              <ShieldCheck size={14} /> Verified student platform
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Find housing, jobs and skills that fit your student life.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              One student profile to book verified housing, apply for internships, complete courses and earn certificates that boost your job match score.
            </p>

            <div className="mt-8 grid gap-3 rounded-[2rem] border border-white/10 bg-white p-3 text-black shadow-2xl md:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <Search size={18} />
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} className="w-full bg-transparent text-sm outline-none" placeholder="Housing, job or course keyword" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <MapPin size={18} />
                <input value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} className="w-full bg-transparent text-sm outline-none" placeholder="Location e.g. Kigali" />
              </div>
              <button onClick={runSearch} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 font-bold text-white hover:bg-neutral-800">
                Search <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[[isLive ? `${liveHousing.length}+` : '120+', 'Verified rooms'], ['500+', 'Student opportunities'], ['80+', 'Skill certificates']].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-sm text-neutral-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.3rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <img className="h-[430px] w-full rounded-[1.8rem] object-cover" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Students" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-black">
              <div className="rounded-2xl bg-white p-4"><b>Book</b><p className="text-xs text-neutral-500">verified housing</p></div>
              <div className="rounded-2xl bg-white p-4"><b>Apply</b><p className="text-xs text-neutral-500">jobs/internships</p></div>
              <div className="rounded-2xl bg-white p-4"><b>Earn</b><p className="text-xs text-neutral-500">certificates</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="text-4xl font-black text-neutral-900 dark:text-white">Start from what you need today</h2>
          <Link to="/jobs" className="font-bold underline text-neutral-900 dark:text-white">Browse all jobs</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {categories.map(({ name, count, icon: Icon }) => (
            <Card key={name} className="group hover:-translate-y-1 transition">
              <Icon className="h-10 w-10 text-neutral-700 dark:text-neutral-300" />
              <h3 className="mt-5 text-lg font-black text-neutral-900 dark:text-white">{name}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{jobs.filter(j => j.category === name).length} active opportunities</p>
            </Card>
          ))}
        </div>
      </section>

      {isLive && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Verified housing</p>
              <h2 className="mt-2 text-4xl font-black text-neutral-900 dark:text-white">Housing available right now</h2>
            </div>
            <Link to="/housing" className="inline-flex items-center gap-2 font-bold text-neutral-900 underline dark:text-white">
              Browse all housing <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {housingList.map((h) => (
              <Link key={h.id} to={`/housing/${h.id}`} className="group overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div className="relative">
                  <img src={firstImage(h)} alt={h.title} className="h-52 w-full object-cover" />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black text-white ${h.availability ? "bg-emerald-600" : "bg-neutral-500"}`}>
                    {h.availability ? "Available" : "Booked"}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">{h.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400"><MapPin size={14} />{h.location}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-neutral-900 dark:text-white">{money(h.price)}<span className="text-xs font-normal text-neutral-500">/mo</span></p>
                    <span className="rounded-xl bg-black px-4 py-2 text-sm font-black text-white transition group-hover:bg-neutral-800 dark:bg-white dark:text-black">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-neutral-200 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white">One platform from room search to career readiness.</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">UniStay+ connects housing, job matching and skills development so students can manage life, income and employability from one dashboard.</p>
            <div className="mt-6 space-y-3">
              {['Check room availability before payment', 'Apply to internships using course certificates', 'Get email results after employer compatibility review'].map((item) => (
                <div key={item} className="flex items-center gap-3 font-semibold text-neutral-900 dark:text-neutral-200"><CheckCircle2 className="shrink-0 text-emerald-500" /> {item}</div>
              ))}
            </div>
            <Link to="/housing" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-bold text-white dark:bg-white dark:text-neutral-900">
              Explore verified housing <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((h) => {
              const inner = (
                <>
                  <img className="h-48 w-full rounded-[1.4rem] object-cover" src={firstImage(h)} alt={h.title} />
                  <div className="p-4">
                    <h3 className="font-black text-neutral-900 dark:text-white">{h.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{h.location}</p>
                    <p className="mt-2 font-bold text-neutral-900 dark:text-white">{money(h.price)}/month</p>
                  </div>
                </>
              );
              return isLive ? (
                <Link key={h.id} to={`/housing/${h.id}`} className="rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-800 dark:ring-neutral-700">{inner}</Link>
              ) : (
                <div key={h.id} className="rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">{inner}</div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="text-4xl font-black text-neutral-900 dark:text-white">Jobs and internships built around student skills</h2>
          <Link to="/jobs" className="rounded-2xl bg-black px-5 py-3 font-bold text-white dark:bg-white dark:text-neutral-900">View all jobs</Link>
        </div>
        <div className="mt-8 space-y-4">
          {jobs.slice(0, 4).map((j) => (
            <Card key={j.id} className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2"><Badge>{j.category}</Badge><Badge>{j.scheduleType}</Badge></div>
                <h3 className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">{j.title}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400"><span className="flex items-center gap-1"><MapPin size={16} />{j.location}</span><span className="flex items-center gap-1"><Clock3 size={16} />{j.deadline}</span><span className="flex items-center gap-1"><Wallet size={16} />{money(j.salary)}</span></div>
              </div>
              <Link to="/jobs" className="rounded-2xl bg-black px-5 py-3 text-center font-bold text-white dark:bg-white dark:text-neutral-900">Apply Now</Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1"><h2 className="text-4xl font-black">Study. Take exam. Earn certificate.</h2><p className="mt-3 text-neutral-300">Admin publishes courses, videos and exams. Students complete them to unlock certificates and improve profile strength.</p></div>
          <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            {courses.map((c) => (
              <div key={c.id} className="rounded-[2rem] bg-white p-4 text-black">
                <img className="h-32 w-full rounded-2xl object-cover" src={c.thumbnail} alt={c.title} />
                <h3 className="mt-4 font-black">{c.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{c.category}</p>
                <div className="mt-4 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-black" style={{ width: `${c.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-neutral-900 dark:text-white">Ready to manage student life smarter?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">Start as a student or host. Admin will assign employer and admin roles internally for platform safety.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="btn-black">Create account</Link>
          <Link to="/process" className="btn-white">See process</Link>
        </div>
      </section>
    </div>
  );
}
