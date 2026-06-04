import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2, Clock3, GraduationCap, MapPin, ShieldCheck, Users, Wallet } from 'lucide-react';
import type { Housing } from '../../../shared/types/api';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { useHousingQuery } from '../../housing/hooks/useHousingQueries';
import { useJobsQuery } from '../../jobs/hooks/useJobsQuery';
import { useCoursesQuery } from '../../courses/hooks/useCoursesQueries';

const categories = [
  { name: 'Software Development', icon: Briefcase },
  { name: 'Marketing', icon: Users },
  { name: 'Sales & Communication', icon: GraduationCap },
  { name: 'Administration', icon: ShieldCheck },
];

const money = (value?: number | null) => `RWF ${Number(value || 0).toLocaleString()}`;
const image = (housing: Housing) => housing.images?.[0] || housing.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80';

export default function HomePage() {
  const housing = (useHousingQuery().data ?? []).filter(item => item.verificationStatus === 'VERIFIED');
  const jobs = useJobsQuery().data ?? [];
  const courses = useCoursesQuery().data ?? [];
  const featured = housing.slice(0, 2);

  return (
    <div className="bg-white dark:bg-neutral-950">
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-6 pb-12 pt-24 text-white">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
        <div className="relative mx-auto w-full max-w-7xl">
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] sm:text-6xl">Find a place to stay and opportunities to grow.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">Browse available student hostels, courses, jobs, and internships in one place.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/hostels" className="rounded-lg bg-white px-6 py-3 font-black text-slate-950">Find a hostel</Link><Link to="/register" className="rounded-lg border border-white/40 px-6 py-3 font-black text-white hover:bg-white/10">Create account</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Explore opportunities</p><h2 className="mt-2 text-4xl font-black text-neutral-900 dark:text-white">Start from what you need today</h2></div>
          <Link to="/jobs" className="inline-flex items-center gap-2 font-black text-neutral-900 dark:text-white">Browse all jobs <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {categories.map(({ name, icon: Icon }) => (
            <Card key={name} className="transition hover:-translate-y-1 hover:shadow-md">
              <Icon className="h-9 w-9 text-neutral-700 dark:text-neutral-300" />
              <h3 className="mt-5 text-lg font-black text-neutral-900 dark:text-white">{name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{jobs.filter(job => job.category === name).length} active opportunities</p>
            </Card>
          ))}
        </div>
      </section>

      {housing.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Verified hostels</p><h2 className="mt-2 text-4xl font-black text-neutral-900 dark:text-white">Hostels available right now</h2></div>
            <Link to="/hostels" className="inline-flex items-center gap-2 font-black text-neutral-900 dark:text-white">Browse all <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {housing.slice(0, 6).map(item => (
              <Link key={item.id} to={`/hostels/${item.id}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div className="relative"><img src={image(item)} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" /><span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black text-white ${item.availability ? 'bg-emerald-600' : 'bg-neutral-500'}`}>{item.availability ? 'Available' : 'Booked'}</span></div>
                <div className="p-5"><h3 className="text-lg font-black text-neutral-900 dark:text-white">{item.title}</h3><p className="mt-1 flex items-center gap-1 text-sm text-neutral-500"><MapPin size={14} />{item.location}</p><div className="mt-4 flex items-center justify-between"><p className="text-xl font-black text-neutral-900 dark:text-white">{money(item.price)}<span className="text-xs font-normal text-neutral-500"> / month</span></p><span className="rounded-lg bg-black px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black">View</span></div></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-neutral-200 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white">One platform from room search to career readiness.</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">UniStay+ connects hostels, job matching, and skills development so students can manage daily needs and future opportunities from one dashboard.</p>
            <div className="mt-6 space-y-3">
              {['Check room availability before payment', 'Apply to internships using course certificates', 'Build skills that improve your profile'].map(item => <div key={item} className="flex items-center gap-3 font-semibold text-neutral-900 dark:text-neutral-200"><CheckCircle2 className="shrink-0 text-emerald-500" size={20} /> {item}</div>)}
            </div>
            <Link to="/hostels" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-bold text-white dark:bg-white dark:text-neutral-900">Explore verified hostels <ArrowRight size={18} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map(item => <Link key={item.id} to={`/hostels/${item.id}`} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-800 dark:ring-neutral-700"><img className="h-48 w-full rounded-md object-cover" src={image(item)} alt={item.title} /><div className="p-3"><h3 className="font-black text-neutral-900 dark:text-white">{item.title}</h3><p className="text-sm text-neutral-500">{item.location}</p><p className="mt-2 font-bold text-neutral-900 dark:text-white">{money(item.price)} / month</p></div></Link>)}
          </div>
        </div>
      </section>

      {jobs.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><h2 className="max-w-3xl text-4xl font-black text-neutral-900 dark:text-white">Jobs and internships built around student skills</h2><Link to="/jobs" className="rounded-lg bg-black px-5 py-3 text-center font-bold text-white dark:bg-white dark:text-neutral-900">View all jobs</Link></div>
          <div className="mt-8 space-y-4">
            {jobs.slice(0, 4).map(job => (
              <Card key={job.id} className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div><div className="flex flex-wrap gap-2">{job.category && <Badge>{job.category}</Badge>}<Badge>{job.scheduleType}</Badge></div><h3 className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">{job.title}</h3><div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400"><span className="flex items-center gap-1"><MapPin size={16} />{job.location}</span>{job.deadline && <span className="flex items-center gap-1"><Clock3 size={16} />{job.deadline}</span>}{job.salary && <span className="flex items-center gap-1"><Wallet size={16} />{money(job.salary)}</span>}</div></div>
                <Link to="/jobs" className="rounded-lg bg-black px-5 py-3 text-center font-bold text-white dark:bg-white dark:text-neutral-900">Apply now</Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="bg-neutral-950 px-6 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            <div><h2 className="text-4xl font-black">Study. Take an exam. Earn a certificate.</h2><p className="mt-3 text-neutral-300">Complete instructor-led courses and improve the skills visible on your profile.</p></div>
            <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
              {courses.slice(0, 3).map(course => <Link key={course.id} to="/register" className="rounded-lg bg-white p-4 text-black transition hover:-translate-y-1">{course.thumbnail && <img className="h-32 w-full rounded-md object-cover" src={course.thumbnail} alt={course.title} />}<h3 className="mt-4 font-black">{course.title}</h3>{course.category && <p className="mt-1 text-sm text-neutral-600">{course.category}</p>}</Link>)}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-neutral-900 dark:text-white">Ready to manage student life smarter?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">Create your profile to explore verified accommodation, useful learning paths, and career opportunities.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/register" className="btn-black">Create account</Link><Link to="/process" className="btn-white">See process</Link></div>
      </section>
    </div>
  );
}
