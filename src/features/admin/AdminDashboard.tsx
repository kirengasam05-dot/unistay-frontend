import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Users, Award } from 'lucide-react';

const stats = [
  { label: 'Total users',         value: '4',  icon: Users,      color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { label: 'Courses published',   value: '3',  icon: BookOpen,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  { label: 'Pending moderation',  value: '2',  icon: ShieldCheck,color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { label: 'Certificates issued', value: '12', icon: Award,      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
];

const actions = [
  { label: 'Users & Roles',   desc: 'Create users and assign roles',       to: '/admin/users',      color: 'border-blue-200 dark:border-blue-800/60',   icon: Users },
  { label: 'Course Builder',  desc: 'Build and publish learning materials', to: '/admin/learning',   color: 'border-violet-200 dark:border-violet-800/60', icon: BookOpen },
  { label: 'Moderation',      desc: 'Review reported content',             to: '/admin/moderation', color: 'border-amber-200 dark:border-amber-800/60',  icon: ShieldCheck },
  { label: 'Analytics',       desc: 'Platform usage and insights',         to: '/admin/analytics',  color: 'border-emerald-200 dark:border-emerald-800/60', icon: Award },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800/60" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neutral-200/50 dark:bg-white/5" />
        <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-neutral-200/30 dark:bg-white/[0.03]" />
        <div className="relative">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl leading-tight">
            Control users, roles,<br className="hidden sm:block" /> content & moderation.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
            Create employer and admin users, assign roles, moderate content and build learning materials.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-black rounded-xl" to="/admin/users">Manage users</Link>
            <Link className="btn-white rounded-xl" to="/admin/learning">Build course</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
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

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Quick access</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(a => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className={`card flex items-center gap-4 !p-5 border-2 transition hover:shadow-md hover:-translate-y-0.5 ${a.color}`}
              >
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
