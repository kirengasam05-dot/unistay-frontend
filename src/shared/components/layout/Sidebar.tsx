import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, Building2, CheckCircle2, GraduationCap, Home, Inbox, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import type { Role } from '../../types';
import BrandLogo from '../BrandLogo';

const links: Record<Role, { label: string; to: string; icon: any }[]> = {
  STUDENT: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Find Hotels', to: '/student/hostels', icon: Building2 },
    { label: 'My Accommodation', to: '/student/accommodation', icon: CheckCircle2 },
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
    { label: 'My Hostel Listings', to: '/host/listings', icon: Building2 },
    { label: 'Bookings & Availability', to: '/host/bookings', icon: CheckCircle2 },
    { label: 'Browse Jobs', to: '/host/jobs', icon: Briefcase },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Verification', to: '/host/verification', icon: ShieldCheck },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  EMPLOYER: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Create Jobs', to: '/employer/jobs', icon: Briefcase },
    { label: 'Review Applications', to: '/employer/applications', icon: Users },
    { label: 'Verification', to: '/employer/verification', icon: ShieldCheck },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  INSTRUCTOR: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Courses', to: '/instructor/courses', icon: BookOpen },
    { label: 'Skills', to: '/instructor/skills', icon: GraduationCap },
    { label: 'Learning Studio', to: '/instructor/content', icon: CheckCircle2 },
    { label: 'Emails', to: '/emails', icon: Inbox },
    { label: 'Profile', to: '/profile', icon: UserCog },
  ],
  ADMIN: [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Users & Roles', to: '/admin/users', icon: Users },
    { label: 'Moderation', to: '/admin/moderation', icon: ShieldCheck },
    { label: 'Jobs', to: '/admin/jobs', icon: Briefcase },
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

  const sidebarContent = (
    <div className="flex h-full flex-col p-5">

      {/* ── Logo ── */}
      <div className="flex items-center justify-between pb-4">
        <BrandLogo />
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Nav links ── */}
      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
        {links[role].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white lg:block dark:border-neutral-800 dark:bg-neutral-950">
        {sidebarContent}
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
        {sidebarContent}
      </aside>
    </>
  );
}
