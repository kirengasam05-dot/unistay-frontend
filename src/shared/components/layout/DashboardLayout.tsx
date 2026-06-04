import { useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Menu, Moon, Sun, UserCog } from 'lucide-react';
import Sidebar from './Sidebar';
import StudentNavbar from './StudentNavbar';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useConfirm } from '../ui/ConfirmDialog';
import { useTheme } from '../../lib/themeContext';

export default function DashboardLayout() {
  const { user, loading, logout: signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  async function handleLogout() {
    setDropdownOpen(false);
    const ok = await confirm({
      title: 'Log out?',
      description: "You'll need to sign in again to access your dashboard.",
      confirmText: 'Log out',
    });
    if (!ok) return;
    signOut();
    navigate('/login');
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';
  const location = useLocation();
  const learningRoute = location.pathname.startsWith('/student/learning')
    || location.pathname.startsWith('/student/assignments')
    || location.pathname === '/student/certificates';

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'STUDENT') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <StudentNavbar />
        <main className={learningRoute
          ? 'w-full pt-[128px] md:pt-[82px]'
          : `mx-auto w-full max-w-7xl px-4 sm:px-6 ${location.pathname === '/dashboard' ? 'pb-8 pt-0' : 'pb-8 pt-32 md:pt-28'}`
        }>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar role={user.role} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Top navbar ── */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950 md:px-8">
          {/* Left: mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="hidden lg:block" />

          {/* Right: theme toggle + profile dropdown */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-black text-white transition hover:opacity-80 dark:bg-white dark:text-neutral-900"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName || user.email} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>

            {dropdownOpen && (
              <>
                {/* backdrop to close on outside click */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                    <p className="truncate text-sm font-black text-neutral-900 dark:text-white">
                      {user?.fullName ?? 'Account'}
                    </p>
                    <p className="truncate text-xs text-neutral-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <UserCog size={15} />
                    Profile
                  </Link>
                  <div className="mx-3 border-t border-neutral-100 dark:border-neutral-800" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
