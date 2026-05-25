import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, Building2, CheckCircle2, GraduationCap, Home, Inbox, LogOut, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import { logoutUser } from '../../lib/authStorage';
import type { Role } from '../../types';

const links: Record<Role, { label: string; to: string; icon: any }[]> = {
  STUDENT: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Book Housing', to: '/student/booking', icon: Building2 },
    { label: 'Search Jobs', to: '/student/jobs', icon: Briefcase },
    { label: 'Courses & Skills', to: '/student/learning', icon: BookOpen },
    { label: 'Assignments & Exams', to: '/student/assignments', icon: GraduationCap },
    { label: 'Certificates', to: '/student/certificates', icon: CheckCircle2 },
    { label: 'Recommendations', to: '/student/recommendations', icon: BarChart3 },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  HOST: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'My Listings', to: '/host/listings', icon: Building2 },
    { label: 'Bookings', to: '/host/bookings', icon: CheckCircle2 },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Verification', to: '/host/verification', icon: ShieldCheck },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  EMPLOYER: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Create Jobs', to: '/employer/jobs', icon: Briefcase },
    { label: 'Applications', to: '/employer/applications', icon: Users },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Verification', to: '/employer/verification', icon: ShieldCheck },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  ADMIN: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Users & Roles', to: '/admin/users', icon: Users },
    { label: 'Course Builder', to: '/admin/learning', icon: BookOpen },
    { label: 'Moderation', to: '/admin/moderation', icon: ShieldCheck },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
};

interface SidebarProps {
  role: Role;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, mobileOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const logout = () => { logoutUser(); navigate('/login'); };

  const content = (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/"
          onClick={onClose}
          className="flex flex-1 items-center gap-3 rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
        >
          <div>
            <p className="text-lg font-black text-neutral-900 dark:text-white">UniStay+</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{role.toLowerCase()} workspace</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
        {links[role].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-950/30"
      >
        <LogOut size={17} /> Logout
      </button>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 lg:block">
        {content}
      </aside>

      {/* mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-neutral-200 bg-white transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
}
