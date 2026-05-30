import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../jobs/jobsApi';
import { coursesApi } from '../../courses/coursesApi';
import type { Job, CreateJobPayload } from '../../jobs/jobsApi';
import type { Course } from '../../courses/coursesApi';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const BLANK: CreateJobPayload = { title: '', category: 'Software Development', location: 'Kigali / Hybrid', salary: 100000, scheduleType: 'INTERNSHIP', requiredSkills: [], requiredCourseIds: [] };

export default function EmployerJobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm]       = useState({ title: '', category: 'Software Development', location: 'Kigali / Hybrid', salary: '100000', scheduleType: 'INTERNSHIP', courseId: '', skills: '' });

  useEffect(() => {
    Promise.all([
      jobsApi.getMine().catch(() => [] as Job[]),
      coursesApi.getAll().catch(() => [] as Course[]),
    ]).then(([j, c]) => { setJobs(j); setCourses(c); }).finally(() => setLoading(false));
  }, []);

  async function add() {
    if (!form.title.trim()) return toast.error('Enter a job title');
    setSaving(true);
    try {
      const payload: CreateJobPayload = {
        title: form.title.trim(),
        location: form.location,
        salary: Number(form.salary),
        scheduleType: form.scheduleType,
        category: form.category,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requiredSkills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        requiredCourseIds: form.courseId ? [form.courseId] : [],
      };
      const newJob = await jobsApi.create(payload);
      setJobs(prev => [newJob, ...prev]);
      setForm({ title: '', category: 'Software Development', location: 'Kigali / Hybrid', salary: '100000', scheduleType: 'INTERNSHIP', courseId: '', skills: '' });
      toast.success('Job created successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await jobsApi.remove(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <Badge>Employer dashboard</Badge>
        <h1 className="mt-3 text-3xl font-black">Create Jobs and Internship Requirements</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Employers create jobs only. Courses, videos, exams and assignments are managed by Admin, then linked as requirements for job compatibility.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Job title e.g. Frontend Internship" />
          <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" />
          <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Software Development</option><option>Marketing</option><option>Sales & Communication</option><option>Administration</option>
          </select>
          <select className="input" value={form.scheduleType} onChange={e => setForm({ ...form, scheduleType: e.target.value })}>
            <option value="INTERNSHIP">Internship</option><option value="PART_TIME">Part time</option><option value="FULL_TIME">Full time</option>
          </select>
          <Input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Salary (RWF)" />
          <select className="input" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
            <option value="">No linked course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Required skills, comma separated" />
          <Button onClick={add} disabled={saving}>
            {saving ? 'Creating…' : 'Create job'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : jobs.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-black text-neutral-900 dark:text-white">No jobs yet</p>
          <p className="mt-1 text-sm text-neutral-500">Create your first job above.</p>
        </div>
      ) : (
        jobs.map(j => (
          <div className="card" key={j.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {j.category && <Badge>{j.category}</Badge>}
                  <Badge>{j.scheduleType}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-black">{j.title}</h2>
                <p className="text-sm text-neutral-500">{j.location}{j.salary ? ` · RWF ${j.salary.toLocaleString()}` : ''}</p>
                {j.requiredSkills && j.requiredSkills.length > 0 && (
                  <p className="mt-2 text-sm"><b>Skills:</b> {j.requiredSkills.join(', ')}</p>
                )}
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"><b>Rule:</b> If the applicant does not match these requirements, reject and send email feedback.</p>
              </div>
              <button
                disabled={deleting === j.id}
                onClick={() => remove(j.id)}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-bold text-white disabled:bg-neutral-400"
              >
                {deleting === j.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
