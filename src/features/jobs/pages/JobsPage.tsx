import { useMemo, useState } from 'react';
import { jobs, courses } from '../../../data/mockData';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Briefcase, Clock3, MapPin, Search, Wallet } from 'lucide-react';

export default function JobsPage(){
  const [keyword,setKeyword]=useState('');
  const [schedule,setSchedule]=useState('ALL');
  const filtered=useMemo(()=>jobs.filter(job=>{
    const text=(job.title+' '+job.category+' '+job.requiredSkills.join(' ')).toLowerCase();
    return text.includes(keyword.toLowerCase()) && (schedule==='ALL' || job.scheduleType===schedule);
  }),[keyword,schedule]);

  return <section className="mx-auto max-w-7xl px-6 py-16">
    <div className="rounded-[2rem] bg-neutral-950 p-10 text-white">
      <Badge className="border-white/20 bg-white/10 text-white">Job marketplace</Badge>
      <h1 className="mt-4 text-5xl font-black">Find student jobs and internships</h1>
      <p className="mt-3 max-w-2xl text-neutral-300">Inspired by modern job portal layouts: search by category, location, schedule and required course completion before applying.</p>
      <div className="mt-8 grid gap-3 rounded-[1.5rem] bg-white p-3 md:grid-cols-[1fr_180px_auto]">
        <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-black"><Search size={18}/><input value={keyword} onChange={e=>setKeyword(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search job, skill or category"/></div>
        <select value={schedule} onChange={e=>setSchedule(e.target.value)} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-black outline-none"><option value="ALL">All schedules</option><option value="INTERNSHIP">Internship</option><option value="PART_TIME">Part time</option><option value="FULL_TIME">Full time</option></select>
        <Button variant="green">Search Jobs</Button>
      </div>
    </div>

    <div className="mt-10 grid gap-5 md:grid-cols-4">
      {[...new Set(jobs.map(j=>j.category))].map(cat=><div key={cat} className="card"><Briefcase/><h3 className="mt-4 font-black">{cat}</h3><p className="text-sm text-neutral-500">{jobs.filter(j=>j.category===cat).length} vacancy</p></div>)}
    </div>

    <div className="mt-10 flex flex-col gap-4">
      {filtered.map(j=>{
        const requiredCourses=courses.filter(c=>j.requiredCourseIds?.includes(c.id));
        return <div className="card flex flex-col justify-between gap-5 md:flex-row md:items-center" key={j.id}>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2"><Badge>{j.category}</Badge><Badge>{j.scheduleType}</Badge><Badge>Deadline {j.deadline}</Badge></div>
            <h2 className="mt-3 text-2xl font-black">{j.title}</h2>
            <p className="text-sm font-semibold text-neutral-700">{j.company}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600"><span className="flex items-center gap-1"><MapPin size={16}/>{j.location}</span><span className="flex items-center gap-1"><Wallet size={16}/>RWF {j.salary.toLocaleString()}</span><span className="flex items-center gap-1"><Clock3 size={16}/>{j.scheduleType}</span></div>
            <p className="mt-3 text-sm"><b>Skills:</b> {j.requiredSkills.join(', ')}</p>
            <div className="mt-3 rounded-2xl bg-neutral-50 p-4 text-sm"><b>Requirements:</b><ul className="mt-2 list-disc space-y-1 pl-5">{j.requirements.map((r:string)=><li key={r}>{r}</li>)}</ul></div>
            {requiredCourses.length>0 && <p className="mt-3 text-sm text-neutral-600"><b>Linked course:</b> {requiredCourses.map(c=>c.title).join(', ')}</p>}
          </div>
          <div className="w-full md:w-44"><Button className="w-full">Apply Now</Button><p className="mt-2 text-center text-xs text-neutral-500">Employer checks compatibility</p></div>
        </div>
      })}
    </div>
  </section>
}
