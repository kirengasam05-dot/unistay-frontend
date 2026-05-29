import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Users, Award } from 'lucide-react';
import { housingApi } from '../housing/housingApi';
import { usersApi } from '../users/usersApi';
import { coursesApi } from '../courses/coursesApi';
import { extractList } from '../../types/api';

const actions = [
  { label: 'Users & Roles',  desc: 'Create users and assign roles',        to: '/admin/users',      color: 'border-blue-200 dark:border-blue-800/60',     icon: Users      },
  { label: 'Course Builder', desc: 'Build and publish learning materials',  to: '/admin/learning',   color: 'border-violet-200 dark:border-violet-800/60', icon: BookOpen   },
  { label: 'Moderation',     desc: 'Review and verify housing listings',    to: '/admin/moderation', color: 'border-amber-200 dark:border-amber-800/60',   icon: ShieldCheck },
  { label: 'Analytics',      desc: 'Platform usage and insights',           to: '/admin/analytics',  color: 'border-emerald-200 dark:border-emerald-800/60', icon: Award    },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<{ users: string; courses: string; pending: string; listings: string }>({
    users: '…', courses: '…', pending: '…', listings: '…',
  });

  useEffect(() => {
    housingApi.getAll()
      .then((list) => setCounts((c) => ({ ...c, listings: String(list.length), pending: String(list.filter((h) => h.verificationStatus === 'PENDING').length) })))
      .catch(() => setCounts((c) => ({ ...c, listings: '0', pending: '0' })));
    usersApi.list()
      .then((list) => setCounts((c) => ({ ...c, users: String(list.length) })))
      .catch(() => setCounts((c) => ({ ...c, users: '—' })));
    coursesApi.list()
      .then((res) => setCounts((c) => ({ ...c, courses: String(extractList(res.data).length) })))
      .catch(() => setCounts((c) => ({ ...c, courses: '0' })));
  }, []);

  const stats = [
    { label: 'Total users',        value: counts.users,    icon: Users,       color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/30'     },
    { label: 'Courses published',  value: counts.courses,  icon: BookOpen,    color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { label: 'Pending moderation', value: counts.pending,  icon: ShieldCheck, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30'   },
    { label: 'Total listings',     value: counts.listings, icon: Award,       color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800/60" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neutral-200/50 dark:bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl leading-tight">
            Control users, roles,<br className="hidden sm:block" /> content &amp; moderation.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
            Manage members and roles, moderate &amp; verify housing, and build learning materials.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-black rounded-xl" to="/admin/users">Manage users</Link>
            <Link className="btn-white rounded-xl" to="/admin/moderation">Moderate housing</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{s.label}</p>
                <p className={`mt-0.5 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Quick access</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to} className={`card flex items-center gap-4 !p-5 border-2 transition hover:shadow-md hover:-translate-y-0.5 ${a.color}`}>
                <Icon size={20} className="shrink-0 text-neutral-700 dark:text-neutral-300" />
                <div>
                  <p className="font-black text-neutral-900 dark:text-white">{a.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
