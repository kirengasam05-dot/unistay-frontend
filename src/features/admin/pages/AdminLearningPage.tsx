import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../courses/coursesApi';
import type { Course } from '../../courses/coursesApi';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function AdminLearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  useEffect(() => {
    coursesApi.getAll()
      .then(setCourses)
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  async function add() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const newCourse = await coursesApi.create({ title: title.trim(), category: 'Digital Skills' });
      setCourses(prev => [newCourse, ...prev]);
      setTitle('');
      toast.success('Course created');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, current: boolean | undefined) {
    setPublishingId(id);
    try {
      const updated = await coursesApi.publish(id);
      setCourses(prev => prev.map(c => c.id === id ? updated : c));
      toast.success(updated.isPublished ? 'Course published' : 'Course unpublished');
    } catch {
      toast.error('Failed to update publish status');
    } finally {
      setPublishingId(null);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await coursesApi.remove(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-black">Course, Video, Exam & Assignment Builder</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Admin controls learning content: create courses, upload video/PDF/article materials, set assignments, exams, and passing scores.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" />
          <Button onClick={add} disabled={saving}>{saving ? 'Creating…' : 'Create course'}</Button>
        </div>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
      ) : courses.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-black text-neutral-900 dark:text-white">No courses yet</p>
          <p className="mt-1 text-sm text-neutral-500">Create your first course above.</p>
        </div>
      ) : (
        courses.map(c => (
          <div className="card" key={c.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{c.title}</h2>
                <p className="text-sm text-neutral-500">
                  {c.category}{c.materials ? ` · ${c.materials} materials` : ''}{c.exam ? ` · Exam: ${c.exam}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-2xl bg-black px-4 py-2 font-bold text-white">Upload video</button>
                <button className="rounded-2xl bg-black px-4 py-2 font-bold text-white">Set exam</button>
                <button className="rounded-2xl bg-black px-4 py-2 font-bold text-white">Add assignment</button>
                <button
                  disabled={publishingId === c.id}
                  onClick={() => togglePublish(c.id, c.isPublished)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-bold text-white disabled:opacity-60 ${c.isPublished ? 'bg-green-600' : 'bg-neutral-700'}`}
                >
                  {publishingId === c.id && <Loader2 size={14} className="animate-spin" />}
                  {c.isPublished ? 'Published' : 'Publish'}
                </button>
                <button
                  disabled={deletingId === c.id}
                  onClick={() => remove(c.id)}
                  className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-60"
                >
                  {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
