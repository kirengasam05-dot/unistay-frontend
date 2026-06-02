import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import StudentNavbar from './StudentNavbar';
import { useAuth } from '../../../features/auth/context/AuthContext';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden" aria-label="Open sidebar">
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 sm:text-sm">Logged in as {user.role}</p>
                <h1 className="text-lg font-black text-neutral-900 dark:text-white sm:text-2xl">{user.fullName || user.email}</h1>
              </div>
            </div>
            <a className="btn-white text-sm" href="/">Back to website</a>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
