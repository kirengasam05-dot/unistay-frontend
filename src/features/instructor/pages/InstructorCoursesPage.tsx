import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../courses/coursesApi';
import type { Course } from '../../courses/coursesApi';
import { useConfirm } from '../../../shared/components/ui/ConfirmDialog';

export default function InstructorCoursesPage() {
  const confirm = useConfirm();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    coursesApi.getAll().then(setCourses).catch(() => toast.error('Could not load courses')).finally(() => setLoading(false));
  }, []);

  async function publish(course: Course) {
    setWorkingId(course.id);
    try {
      const updated = await coursesApi.publish(course.id);
      setCourses((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success('Course published');
    } catch {
      toast.error('Could not publish course');
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(course: Course) {
    const ok = await confirm({ title: `Delete "${course.title}"?`, description: 'This removes the course, its materials, and its exams.', confirmText: 'Delete course', variant: 'destructive' });
    if (!ok) return;
    setWorkingId(course.id);
    try {
      await coursesApi.remove(course.id);
      setCourses((items) => items.filter((item) => item.id !== course.id));
      toast.success('Course deleted');
    } catch {
      toast.error('Could not delete course');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-slate-950 p-7 text-white">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Course management</p><h1 className="mt-2 text-3xl font-black">Your courses</h1><p className="mt-2 text-sm text-slate-300">Create courses here, then add lessons and exams from the learning studio.</p></div>
        <Link to="/instructor/courses/new" className="btn-white rounded-xl"><Plus size={16} /> Add course</Link>
      </section>

      <section className="card overflow-hidden p-0">
        {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div> : courses.length === 0 ? <div className="py-16 text-center"><BookOpen className="mx-auto text-neutral-300" size={34} /><p className="mt-3 font-black">No courses yet</p><Link to="/instructor/courses/new" className="btn-black mt-4 rounded-xl"><Plus size={15} /> Create your first course</Link></div> : <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50"><tr><th className="px-5 py-4">Course</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Content</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {courses.map((course) => <tr key={course.id} className="align-middle">
                <td className="px-5 py-4"><div className="flex min-w-64 items-center gap-3">{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <div className="grid h-12 w-16 place-items-center rounded-lg bg-neutral-100 dark:bg-neutral-800"><BookOpen size={18} /></div>}<div><p className="font-black">{course.title}</p><p className="mt-1 max-w-xs truncate text-xs text-neutral-500">{course.description || 'No description'}</p></div></div></td>
                <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{course.category || 'Uncategorized'}</td>
                <td className="px-5 py-4 text-xs text-neutral-500">{course.materials?.length || 0} materials<br />{course.assignments?.length || 0} exams</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>{course.isPublished ? 'Published' : 'Draft'}</span></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/instructor/courses/${course.id}/edit`} className="btn-white rounded-lg px-3 py-2 text-xs"><Pencil size={14} /> Edit</Link>{!course.isPublished && <button onClick={() => publish(course)} disabled={workingId === course.id} className="btn-black rounded-lg px-3 py-2 text-xs">Publish</button>}<button onClick={() => remove(course)} disabled={workingId === course.id} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={15} /></button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </section>
    </div>
  );
}
