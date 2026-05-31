import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../courses/coursesApi';
import { skillsApi } from '../../skills/skillsApi';
import type { Course, CreateCoursePayload } from '../../courses/coursesApi';
import type { Skill } from '../../skills/skillsApi';
import { useConfirm } from '../../../components/ui/ConfirmDialog';

const CATEGORIES = ['Digital Skills', 'Communication', 'Finance', 'Marketing', 'Software Development', 'Administration', 'Other'];

const BLANK: CreateCoursePayload = { title: '', description: '', category: 'Digital Skills', thumbnail: '', skillIds: [] };

export default function AdminLearningPage() {
  const confirm = useConfirm();
  const [courses, setCourses]   = useState<Course[]>([]);
  const [skills, setSkills]     = useState<Skill[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<CreateCoursePayload>(BLANK);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<Partial<Record<keyof CreateCoursePayload, string>>>({});
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      coursesApi.getAll().catch(() => [] as Course[]),
      skillsApi.getAll().catch(() => [] as Skill[]),
    ]).then(([c, s]) => { setCourses(c); setSkills(s); }).finally(() => setLoading(false));
  }, []);

  function set(key: keyof CreateCoursePayload, value: string | string[]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function toggleSkill(skillId: string) {
    const current = form.skillIds ?? [];
    set('skillIds', current.includes(skillId) ? current.filter(id => id !== skillId) : [...current, skillId]);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof CreateCoursePayload, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (Object.keys(e).length) { setErrors(e); return false; }
    return true;
  }

  async function create() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: CreateCoursePayload = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        category: form.category || undefined,
        thumbnail: form.thumbnail?.trim() || undefined,
        skillIds: form.skillIds?.length ? form.skillIds : undefined,
      };
      const newCourse = await coursesApi.create(payload);
      setCourses(prev => [newCourse, ...prev]);
      setForm(BLANK);
      setShowForm(false);
      toast.success('Course created successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(course: Course) {
    setPublishingId(course.id);
    try {
      const updated = await coursesApi.publish(course.id);
      setCourses(prev => prev.map(c => c.id === course.id ? updated : c));
      toast.success(updated.isPublished ? 'Course published' : 'Course unpublished');
    } catch {
      toast.error('Failed to update publish status');
    } finally {
      setPublishingId(null);
    }
  }

  async function remove(course: Course) {
    const ok = await confirm({
      title: `Delete "${course.title}"?`,
      description: 'This course and all its materials will be permanently removed.',
      confirmText: 'Delete course',
      variant: 'destructive',
    });
    if (!ok) return;
    setDeletingId(course.id);
    try {
      await coursesApi.remove(course.id);
      setCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass = 'input w-full';
  const labelClass = 'block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5';

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Course Builder</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Create and publish courses with materials, exams and assignments for students.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setForm(BLANK); setErrors({}); }}
            className="btn-black shrink-0 rounded-xl flex items-center gap-2"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'New course'}
          </button>
        </div>

        {/* create form */}
        {showForm && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h2 className="mb-5 font-black text-neutral-900 dark:text-white">New course</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* title */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Course title *</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && create()}
                  placeholder="e.g. React Fundamentals for Student Jobs"
                  className={inputClass}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* category */}
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* thumbnail */}
              <div>
                <label className={labelClass}>Thumbnail URL <span className="font-normal text-neutral-400">(optional)</span></label>
                <input
                  value={form.thumbnail}
                  onChange={e => set('thumbnail', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
              </div>

              {/* description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Description <span className="font-normal text-neutral-400">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="What will students learn in this course?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* skills */}
              {skills.length > 0 && (
                <div className="sm:col-span-2">
                  <label className={labelClass}>Linked skills <span className="font-normal text-neutral-400">(optional)</span></label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {skills.map(skill => {
                      const selected = (form.skillIds ?? []).includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                            selected
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                              : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                  {(form.skillIds?.length ?? 0) > 0 && (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {form.skillIds?.length} skill{(form.skillIds?.length ?? 0) > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={create}
                disabled={saving}
                className="btn-black rounded-xl flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {saving ? 'Creating…' : 'Create course'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total courses', value: courses.length },
          { label: 'Published', value: courses.filter(c => c.isPublished).length },
          { label: 'Drafts', value: courses.filter(c => !c.isPublished).length },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className="mt-1 text-3xl font-black text-neutral-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* course list */}
      {loading ? (
        <div className="card grid place-items-center py-16">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      ) : courses.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <BookOpen size={24} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="font-black text-neutral-900 dark:text-white">No courses yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Click "New course" above to create your first course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(c => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white">{c.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      c.isPublished
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{c.description}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {c.category && <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-semibold dark:bg-neutral-800">{c.category}</span>}
                    {c.materials && c.materials.length > 0 && <span>{c.materials.length} material{c.materials.length !== 1 ? 's' : ''}</span>}
                    {c.skills && c.skills.length > 0 && <span>{c.skills.length} skill{c.skills.length !== 1 ? 's' : ''}</span>}
                    {c.assignments && c.assignments.length > 0 && <span>{c.assignments.length} assignment{c.assignments.length !== 1 ? 's' : ''}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    disabled={publishingId === c.id}
                    onClick={() => togglePublish(c)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60 ${
                      c.isPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-neutral-700 hover:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-500'
                    }`}
                  >
                    {publishingId === c.id && <Loader2 size={13} className="animate-spin" />}
                    {c.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    disabled={deletingId === c.id}
                    onClick={() => remove(c)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Delete
                  </button>
                </div>
              </div>

              {/* thumbnail preview */}
              {c.thumbnail && (
                <div className="mt-4">
                  <img src={c.thumbnail} alt={c.title} className="h-32 w-full rounded-xl object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
