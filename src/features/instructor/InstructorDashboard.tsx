import { Link } from 'react-router-dom';
import { BookOpen, FileQuestion, GraduationCap, Library } from 'lucide-react';

const actions = [
  { to: '/instructor/courses', label: 'Courses', text: 'Create, link skills, and publish courses.', icon: BookOpen },
  { to: '/instructor/skills', label: 'Skills', text: 'Maintain the skills students can earn.', icon: GraduationCap },
  { to: '/instructor/content', label: 'Learning studio', text: 'Add lessons, exams, questions, and answers.', icon: FileQuestion },
];

export default function InstructorDashboard() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Instructor workspace</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">Build learning paths that lead to real opportunities.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Publish courses, organize materials, and prepare exams that award verified skills to students.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(({ to, label, text, icon: Icon }) => (
          <Link key={to} to={to} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><Icon size={22} /></span>
            <h2 className="mt-5 text-xl font-black text-neutral-900 dark:text-white">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{text}</p>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        <Library className="shrink-0 text-amber-600" size={20} />
        Students see published courses in a focused learning catalog with course-specific navigation.
      </div>
    </div>
  );
}
