import { useState } from 'react';
import { Plus, Search, Trash2, UserCircle2, X } from 'lucide-react';
import { users as initial } from '../../../data/mockData';
import type { Role } from '../../../types';

type User = typeof initial[number];

const ROLES: Role[] = ['STUDENT', 'HOST', 'EMPLOYER', 'ADMIN'];

const roleMeta: Record<Role, { label: string; badge: string; avatar: string }> = {
  STUDENT:  { label: 'Student',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',     avatar: 'bg-blue-600'   },
  HOST:     { label: 'Host',     badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', avatar: 'bg-emerald-600' },
  EMPLOYER: { label: 'Employer', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400', avatar: 'bg-violet-600' },
  ADMIN:    { label: 'Admin',    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',     avatar: 'bg-rose-600'   },
};

const BLANK = { fullName: '', email: '', role: 'STUDENT' as Role };

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>(initial);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Role | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [errors, setErrors]   = useState<Partial<typeof BLANK>>({});

  const visible = users.filter(u => {
    const matchRole   = filter === 'ALL' || u.role === filter;
    const matchSearch = (u.fullName + u.email + u.role).toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  function counts(role: Role) {
    return users.filter(u => u.role === role).length;
  }

  function validate() {
    const e: Partial<typeof BLANK> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    return e;
  }

  function createUser() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: '',
      password: 'password123',
      role: form.role,
      location: 'Kigali',
      skillsProfile: '',
    };
    setUsers([newUser, ...users]);
    setForm(BLANK);
    setErrors({});
    setShowForm(false);
  }

  function changeRole(id: string, role: Role) {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  }

  function remove(id: string) {
    setUsers(users.filter(u => u.id !== id));
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Users & Roles</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Create users, assign roles and manage who has access to each part of the platform.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(BLANK); setErrors({}); }}
            className="btn-black shrink-0 rounded-xl flex items-center gap-2"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'Create user'}
          </button>
        </div>

        {/* Create user form */}
        {showForm && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h2 className="mb-4 font-black text-neutral-900 dark:text-white">New user</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Full name *</label>
                <input
                  value={form.fullName}
                  onChange={e => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: undefined }); }}
                  placeholder="e.g. Alice Uwase"
                  className="input"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                  placeholder="user@example.com"
                  className="input"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as Role })}
                  className="input"
                >
                  {ROLES.map(r => <option key={r} value={r}>{roleMeta[r].label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={createUser} className="btn-black rounded-xl flex items-center gap-2">
                <Plus size={15} /> Create user
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ROLES.map(r => (
          <button
            key={r}
            onClick={() => setFilter(filter === r ? 'ALL' : r)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              filter === r
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                : 'border-neutral-200 bg-white shadow-card hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
            }`}
          >
            <p className={`text-xs font-bold uppercase tracking-wide ${filter === r ? 'opacity-70' : 'text-neutral-500 dark:text-neutral-400'}`}>
              {roleMeta[r].label}s
            </p>
            <p className={`mt-1 text-3xl font-black ${filter === r ? '' : 'text-neutral-900 dark:text-white'}`}>
              {counts(r)}
            </p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or role…"
            className="input pl-10"
          />
        </div>
        {filter !== 'ALL' && (
          <button
            onClick={() => setFilter('ALL')}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X size={13} /> Clear filter
          </button>
        )}
      </div>

      {/* User list */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="card py-12 text-center">
            <UserCircle2 size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="mt-4 font-black text-neutral-900 dark:text-white">No users found</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try adjusting your search or filter.</p>
          </div>
        )}

        {visible.map(u => {
          const initials = u.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          const meta     = roleMeta[u.role];
          return (
            <div key={u.id} className="card !p-4">
              <div className="flex flex-wrap items-center gap-4">

                {/* Avatar */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${meta.avatar}`}>
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-neutral-900 dark:text-white truncate">{u.fullName}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{u.email}</p>
                </div>

                {/* Role badge */}
                <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:inline-block ${meta.badge}`}>
                  {meta.label}
                </span>

                {/* Role selector */}
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value as Role)}
                  className="shrink-0 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 outline-none transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                >
                  {ROLES.map(r => <option key={r} value={r}>{roleMeta[r].label}</option>)}
                </select>

                {/* Delete */}
                <button
                  onClick={() => remove(u.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center pb-2">
        {users.length} total user{users.length !== 1 ? 's' : ''} · {visible.length} shown
      </p>
    </div>
  );
}
