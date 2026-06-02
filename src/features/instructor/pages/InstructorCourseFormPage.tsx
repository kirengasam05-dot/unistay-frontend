import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../courses/coursesApi';
import type { CreateCoursePayload } from '../../courses/coursesApi';
import { skillsApi } from '../../skills/skillsApi';
import type { Skill } from '../../skills/skillsApi';

const CATEGORIES = ['Digital Skills', 'Communication', 'Finance', 'Marketing', 'Software Development', 'Administration', 'Other'];
const BLANK: CreateCoursePayload = { title: '', description: '', category: 'Digital Skills', thumbnail: '', skillIds: [] };

export default function InstructorCourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateCoursePayload>(BLANK);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    skillsApi.getAll().then(setSkills).catch(() => setSkills([]));
    if (!id) return;
    coursesApi.getOne(id).then((course) => {
      setForm({ title: course.title, description: course.description || '', category: course.category || 'Digital Skills', thumbnail: course.thumbnail || '', skillIds: course.skills?.map(({ skill }) => skill.id) || [] });
      setThumbnailPreview(course.thumbnail || '');
    }).catch(() => toast.error('Could not load course')).finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof CreateCoursePayload, value: string | string[]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSkill(skillId: string) {
    const current = form.skillIds || [];
    set('skillIds', current.includes(skillId) ? current.filter((value) => value !== skillId) : [...current, skillId]);
  }

  function selectThumbnail(file: File | null) {
    setThumbnailFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  async function save() {
    if (form.title.trim().length < 3) return toast.error('Course title must be at least 3 characters.');
    setSaving(true);
    try {
      const payload: CreateCoursePayload = { title: form.title.trim(), description: form.description?.trim() || undefined, category: form.category || undefined, thumbnail: thumbnailFile ? await coursesApi.uploadThumbnail(thumbnailFile) : form.thumbnail || undefined, skillIds: form.skillIds || [] };
      if (id) await coursesApi.update(id, payload);
      else await coursesApi.create(payload);
      toast.success(id ? 'Course updated' : 'Course created');
      navigate('/instructor/courses');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save course');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card grid min-h-64 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500"><ArrowLeft size={16} /> Back to courses</Link>
      <section className="card">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Course builder</p>
        <h1 className="mt-2 text-3xl font-black">{id ? 'Update course' : 'Add a new course'}</h1>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold sm:col-span-2">Course title<input className="input mt-2" value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="Course title" /></label>
          <label className="text-sm font-bold">Category<select className="input mt-2" value={form.category} onChange={(event) => set('category', event.target.value)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-bold">Thumbnail image <span className="font-normal text-neutral-400">(optional)</span><input className="input mt-2" type="file" accept="image/*" onChange={(event) => selectThumbnail(event.target.files?.[0] || null)} />{thumbnailPreview && <img src={thumbnailPreview} alt="Course thumbnail preview" className="mt-3 h-32 w-full rounded-xl object-cover" />}</label>
          <label className="text-sm font-bold sm:col-span-2">Description<textarea className="input mt-2 resize-none" rows={4} value={form.description} onChange={(event) => set('description', event.target.value)} placeholder="What will students learn?" /></label>
          {skills.length > 0 && <div className="sm:col-span-2"><p className="text-sm font-bold">Linked skills <span className="font-normal text-neutral-400">(optional)</span></p><div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => { const selected = form.skillIds?.includes(skill.id); return <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)} className={`rounded-full px-3 py-2 text-xs font-bold ${selected ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}>{skill.name}</button>; })}</div></div>}
        </div>
        <div className="mt-7 flex justify-end"><button onClick={save} disabled={saving} className="btn-black rounded-xl disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{saving ? 'Saving...' : 'Save course'}</button></div>
      </section>
    </div>
  );
}
