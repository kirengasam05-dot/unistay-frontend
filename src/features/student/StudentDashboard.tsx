import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, Building2, MapPin } from 'lucide-react';
import { useHousingQuery } from '../housing/hooks/useHousingQueries';
import { useJobsQuery } from '../jobs/hooks/useJobsQuery';
import { useCoursesQuery } from '../courses/hooks/useCoursesQueries';
import type { Housing } from '../../shared/types/api';
import type { Course } from '../courses/coursesApi';
import type { Job } from '../jobs/jobsApi';

const fallbackHousing = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80';
const fallbackCourse = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
const fallbackJob = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80';
const money = (value?: number | null) => `RWF ${Number(value || 0).toLocaleString()}`;

function UpdateHeading({ title, description, to, icon: Icon }: { title: string; description: string; to: string; icon: typeof Building2 }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400"><Icon size={15} /> Latest update</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Link to={to} className="flex items-center gap-1 text-sm font-black text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">View all <ArrowRight size={15} /></Link>
    </div>
  );
}

export default function StudentDashboard() {
  const housingQuery = useHousingQuery();
  const jobsQuery = useJobsQuery();
  const coursesQuery = useCoursesQuery();
  const housing = (housingQuery.data ?? []).filter(item => item.availability && item.verificationStatus === 'VERIFIED').slice(0, 3);
  const jobs = (jobsQuery.data ?? []).slice(0, 3);
  const courses = (coursesQuery.data ?? []).slice(0, 3);
  const loading = housingQuery.isPending || jobsQuery.isPending || coursesQuery.isPending;

  return (
    <div className="space-y-10 pb-10">
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-br from-emerald-700 via-slate-900 to-slate-950 px-6 pb-16 pt-44 text-white sm:px-10 sm:pb-20 sm:pt-40">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-300">Student workspace</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">New places, practical learning, and opportunities for your next step.</h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-300">Stay up to date with newly available hostels, courses, jobs, and internships from one place.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-white rounded-xl" to="/student/hostels">Find a hostel</Link>
            <Link className="btn rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" to="/student/jobs">Browse opportunities</Link>
          </div>
        </div>
      </div>

      {loading && <div className="card text-sm font-bold text-slate-500">Loading your latest updates...</div>}

      <section>
        <UpdateHeading title="New hostels available" description="Verified student rooms ready for booking." to="/student/hostels" icon={Building2} />
        <div className="grid gap-4 md:grid-cols-3">
          {housing.map((item: Housing) => (
            <Link key={item.id} to={`/hostels/${item.id}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <img src={item.images?.[0] || item.image || fallbackHousing} alt={item.title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Available now</p>
                <h3 className="mt-1 font-black text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} /> {item.location}</p>
                <p className="mt-3 font-black text-slate-900 dark:text-white">{money(item.price)} <span className="text-xs font-semibold text-slate-500">/ month</span></p>
              </div>
            </Link>
          ))}
          {!loading && housing.length === 0 && <p className="card text-sm text-slate-500 md:col-span-3">No new verified hostels are available yet.</p>}
        </div>
      </section>

      <section>
        <UpdateHeading title="New jobs and internships" description="Fresh opportunities that can help you build experience." to="/student/jobs" icon={Briefcase} />
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((job: Job) => (
            <Link key={job.id} to="/student/jobs" className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <img src={job.image || job.companyLogo || fallbackJob} alt="" className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-wide text-blue-600">{job.scheduleType || 'Opportunity'}</p>
                <h3 className="mt-1 font-black text-slate-950 dark:text-white">{job.title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{job.company || 'UniStay+ employer'}</p>
                <p className="mt-3 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} /> {job.location}</p>
              </div>
            </Link>
          ))}
          {!loading && jobs.length === 0 && <p className="card text-sm text-slate-500 md:col-span-3">No new jobs or internships have been posted yet.</p>}
        </div>
      </section>

      <section>
        <UpdateHeading title="New courses to explore" description="Build useful skills and add achievements to your profile." to="/student/learning" icon={BookOpen} />
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((course: Course) => (
            <Link key={course.id} to={`/student/learning/${course.id}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <img src={course.thumbnail || fallbackCourse} alt={course.title} className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{course.category || 'New course'}</p>
                <h3 className="mt-1 font-black text-slate-950 dark:text-white">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{course.description || 'Start learning practical skills at your own pace.'}</p>
              </div>
            </Link>
          ))}
          {!loading && courses.length === 0 && <p className="card text-sm text-slate-500 md:col-span-3">No new courses are available yet.</p>}
        </div>
      </section>
    </div>
  );
}
