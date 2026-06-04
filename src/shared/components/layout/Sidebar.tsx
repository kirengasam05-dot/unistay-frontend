import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, Building2, CheckCircle2, ChevronDown, GraduationCap, Home, Inbox, LogOut, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useConfirm } from '../ui/ConfirmDialog';
import type { Role } from '../../types';

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
    { label: 'Applications & Availability', to: '/host/bookings', icon: CheckCircle2 },
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
  const navigate = useNavigate();
  const { user, logout: signOut } = useAuth();
  const confirm = useConfirm();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logout = async () => {
    setDropdownOpen(false);
    onClose?.();
    const ok = await confirm({
      title: 'Log out?',
      description: "You'll need to sign in again to access your dashboard.",
      confirmText: 'Log out',
    });
    if (!ok) return;
    signOut();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.fullName || user?.email || 'Account';
  const displayRole = role.charAt(0) + role.slice(1).toLowerCase();

  const sidebarContent = (
    <div className="flex h-full flex-col p-5">

      {/* ── User card with dropdown ── */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {/* Avatar */}
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-900 text-sm font-black text-white dark:bg-white dark:text-neutral-900">
              {initials}
            </div>
            {/* Name + role */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-neutral-900 dark:text-white">{displayName}</p>
              <p className="text-xs font-semibold text-neutral-400">{displayRole}</p>
            </div>
            <ChevronDown
              size={15}
              className={`shrink-0 text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
              <Link
                to="/profile"
                onClick={() => { setDropdownOpen(false); onClose?.(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <UserCog size={15} />
                Profile
              </Link>
              <div className="mx-3 border-t border-neutral-100 dark:border-neutral-800" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile close button */}
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
