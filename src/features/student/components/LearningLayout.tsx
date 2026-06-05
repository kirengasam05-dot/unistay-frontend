import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap, Star } from 'lucide-react';

const links = [
  { label: 'Courses', to: '/student/learning', icon: BookOpen },
  { label: 'Exams', to: '/student/assignments', icon: GraduationCap },
  { label: 'Certificates', to: '/student/certificates', icon: Star },
];

export default function LearningLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-white px-4 py-4 dark:bg-neutral-900 lg:sticky lg:top-[82px] lg:h-[calc(100vh-82px)] lg:border-r lg:border-neutral-200 lg:px-5 lg:py-6 dark:lg:border-neutral-800">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">My learning</p>
        <nav className="mt-3 flex gap-1 overflow-x-auto lg:block lg:space-y-1">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/student/learning'} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 p-4 sm:p-6">{children ?? <Outlet />}</div>
    </div>
  );
}
