import { Link } from 'react-router-dom';
import { Building2, Briefcase, GraduationCap, Search, MapPin, Clock3, Wallet, CheckCircle2, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { housings, jobs, courses } from '../../../data/mockData';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const categories = [
  { name: 'Software Development', count: 18, icon: Briefcase },
  { name: 'Marketing', count: 12, icon: Users },
  { name: 'Sales & Communication', count: 21, icon: GraduationCap },
  { name: 'Administration', count: 9, icon: ShieldCheck },
];

export default function HomePage(){
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,_white,_transparent_35%),radial-gradient(circle_at_bottom_right,_white,_transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-white">UniStay+ Student ecosystem</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Find housing, jobs and skills that fit your student life.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              A single student profile helps you book verified housing, apply for internships, complete courses, take exams and earn certificates that improve your job match score.
            </p>

            <div className="mt-8 grid gap-3 rounded-[2rem] border border-white/10 bg-white p-3 text-black shadow-2xl md:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <Search size={18}/><input className="w-full bg-transparent text-sm outline-none" placeholder="Job, housing, course keyword" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                <MapPin size={18}/><input className="w-full bg-transparent text-sm outline-none" placeholder="Location e.g. Kigali" />
              </div>
              <Link to="/jobs" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 font-bold text-white hover:bg-neutral-800">
                Search <ArrowRight size={18}/>
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[['500+','Student opportunities'],['120+','Verified rooms'],['80+','Skill certificates']].map(([value,label])=>(
                <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-sm text-neutral-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.3rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <img className="h-[430px] w-full rounded-[1.8rem] object-cover" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" />
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
          <div><Badge>Explore by category</Badge><h2 className="mt-4 text-4xl font-black">Start from what you need today</h2></div>
          <Link to="/jobs" className="font-bold underline">Browse all jobs</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {categories.map(({name,count,icon:Icon})=>(
            <Card key={name} className="group hover:-translate-y-1 transition">
              <Icon className="h-10 w-10" />
              <h3 className="mt-5 text-lg font-black">{name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{count} active opportunities</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>Complete student journey</Badge>
            <h2 className="mt-4 text-4xl font-black">One platform from room search to career readiness.</h2>
            <p className="mt-4 text-neutral-600">UniStay+ connects housing, job matching and skills development so students can manage life, income and employability from one dashboard.</p>
            <div className="mt-6 space-y-3">
              {['Check room availability before payment','Apply to internships using course certificates','Get email results after employer compatibility review'].map(item=>(
                <div key={item} className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-600"/> {item}</div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {housings.slice(0,2).map(h=>(
              <div key={h.id} className="rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-neutral-200">
                <img className="h-48 w-full rounded-[1.4rem] object-cover" src={h.image}/>
                <div className="p-4"><h3 className="font-black">{h.title}</h3><p className="text-sm text-neutral-600">{h.location}</p><p className="mt-2 font-bold">RWF {h.price.toLocaleString()}/month</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><Badge>Latest opportunities</Badge><h2 className="mt-4 text-4xl font-black">Jobs and internships built around student skills</h2></div>
          <Link to="/jobs" className="rounded-2xl bg-black px-5 py-3 font-bold text-white">View all jobs</Link>
        </div>
        <div className="mt-8 space-y-4">
          {jobs.slice(0,4).map(j=>(
            <Card key={j.id} className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2"><Badge>{j.category}</Badge><Badge>{j.scheduleType}</Badge></div>
                <h3 className="mt-3 text-2xl font-black">{j.title}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-600"><span className="flex items-center gap-1"><MapPin size={16}/>{j.location}</span><span className="flex items-center gap-1"><Clock3 size={16}/>{j.deadline}</span><span className="flex items-center gap-1"><Wallet size={16}/>RWF {j.salary.toLocaleString()}</span></div>
              </div>
              <Link to="/jobs" className="rounded-2xl bg-black px-5 py-3 text-center font-bold text-white">Apply Now</Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1"><Badge className="border-white/20 bg-white/10 text-white">Skills path</Badge><h2 className="mt-4 text-4xl font-black">Study. Take exam. Earn certificate.</h2><p className="mt-3 text-neutral-300">Admin publishes courses, videos and exams. Students complete them to unlock certificates and improve profile strength.</p></div>
          <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            {courses.map(c=>(
              <div key={c.id} className="rounded-[2rem] bg-white p-4 text-black">
                <img className="h-32 w-full rounded-2xl object-cover" src={c.thumbnail}/>
                <h3 className="mt-4 font-black">{c.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{c.category}</p>
                <div className="mt-4 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-black" style={{width:`${c.progress}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-10 w-10" />
        <h2 className="mt-4 text-4xl font-black">Ready to manage student life smarter?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600">Start as a student or host. Admin will assign employer and admin roles internally for platform safety.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/register" className="btn-black">Create account</Link><Link to="/process" className="btn-white">See process</Link></div>
      </section>
    </div>
  )
}
