import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { getUser } from '../../lib/authStorage';

export default function DashboardLayout() {
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar role={user.role} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {user.role}
              </p>
              <h1 className="text-lg font-black text-neutral-900 dark:text-white sm:text-2xl">{user.fullName}</h1>
            </div>
          </div>
          <a className="btn-white text-sm" href="/">Back to website</a>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
