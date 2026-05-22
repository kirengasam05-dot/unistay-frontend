import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { jobs as initial, courses } from '../../../data/mockData';

type Job = typeof initial[number];

export default function EmployerJobsPage(){
  const [jobs,setJobs]=useState<Job[]>(initial);
  const [form,setForm]=useState({title:'',category:'Software Development',location:'Kigali / Hybrid',salary:'100000',scheduleType:'INTERNSHIP',courseId:'c1',skills:'Communication, Teamwork'});
  const add=()=>{
    if(!form.title.trim()) return;
    const course=courses.find(c=>c.id===form.courseId);
    const requiredSkills=form.skills.split(',').map(s=>s.trim()).filter(Boolean);
    setJobs([{id:crypto.randomUUID(),title:form.title,company:'My Company',location:form.location,salary:Number(form.salary),scheduleType:form.scheduleType,employerId:'u-employer',category:form.category,deadline:'2026-07-30',requiredCourseIds:[form.courseId],requiredSkills,requirements:[course?`Complete ${course.title}`:'Complete linked course','Pass related exam with at least 70%','Submit application profile for compatibility review','Available for the selected schedule']} as Job,...jobs]);
    setForm({...form,title:''});
  };
  return <div className="space-y-6">
    <div className="card">
      <Badge>Employer dashboard</Badge>
      <h1 className="mt-3 text-3xl font-black">Create Jobs and Internship Requirements</h1>
      <p className="mt-2 text-neutral-600">Employers create jobs only. Courses, videos, exams and assignments are managed by Admin, then linked as requirements for job compatibility.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Job title e.g. Frontend Internship" />
        <Input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location" />
        <select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Software Development</option><option>Marketing</option><option>Sales & Communication</option><option>Administration</option></select>
        <select className="input" value={form.scheduleType} onChange={e=>setForm({...form,scheduleType:e.target.value})}><option value="INTERNSHIP">Internship</option><option value="PART_TIME">Part time</option><option value="FULL_TIME">Full time</option></select>
        <Input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} placeholder="Salary" />
        <select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <Input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="Required skills separated by comma" />
        <Button onClick={add}>Create job</Button>
      </div>
    </div>

    {jobs.map(j=><div className="card" key={j.id}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>{j.category}</Badge><Badge>{j.scheduleType}</Badge></div>
          <h2 className="mt-3 text-xl font-black">{j.title}</h2>
          <p className="text-sm text-neutral-500">{j.location} · RWF {j.salary.toLocaleString()}</p>
          <p className="mt-2 text-sm"><b>Skills:</b> {j.requiredSkills.join(', ')}</p>
          <p className="mt-2 text-sm text-neutral-600"><b>Rule:</b> If the applicant does not match these requirements, reject and send email feedback.</p>
        </div>
        <button onClick={()=>setJobs(jobs.filter(x=>x.id!==j.id))} className="rounded-2xl bg-red-600 px-4 py-2 font-bold text-white">Delete</button>
      </div>
    </div>)}
  </div>
}
