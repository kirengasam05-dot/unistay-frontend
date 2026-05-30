import { useEffect, useMemo, useState } from 'react';
import { Loader2, Power, RefreshCcw, Search, Trash2, UserCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../../users/usersApi';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import type { User, UserRole } from '../../../types/api';

const ROLES: UserRole[] = ['STUDENT', 'HOST', 'EMPLOYER', 'ADMIN'];

const roleMeta: Record<UserRole, { label: string; badge: string; avatar: string }> = {
  STUDENT:  { label: 'Student',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',         avatar: 'bg-blue-600'    },
  HOST:     { label: 'Host',     badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', avatar: 'bg-emerald-600' },
  EMPLOYER: { label: 'Employer', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',   avatar: 'bg-violet-600'  },
  ADMIN:    { label: 'Admin',    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',           avatar: 'bg-rose-600'    },
};

const isActive = (u: User) => u.active ?? u.isActive ?? true;
const initialsOf = (u: User) => (u.fullName || u.email || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function AdminUsersPage() {
  const confirm = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserRole | 'ALL'>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () =>
      users.filter((u) => {
        const matchRole = filter === 'ALL' || u.role === filter;
        const matchSearch = `${u.fullName} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
      }),
    [users, search, filter]
  );

  async function changeRole(u: User, role: UserRole) {
    if (role === u.role) return;
    const ok = await confirm({
      title: 'Change user role?',
      description: `${u.fullName || u.email} will be changed from ${u.role} to ${role}. Their access across the platform will change immediately.`,
      confirmText: `Make ${roleMeta[role].label}`,
    });
    if (!ok) return;
    try {
      setBusyId(u.id);
      const updated = await usersApi.setRole(u.id, role);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated, role } : x)));
      toast.success(`Role updated to ${roleMeta[role].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change role');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u: User) {
    const active = isActive(u);
    const ok = await confirm({
      title: active ? 'Deactivate this user?' : 'Reactivate this user?',
      description: active
        ? `${u.fullName || u.email} will lose access until reactivated.`
        : `${u.fullName || u.email} will regain access to the platform.`,
      confirmText: active ? 'Deactivate' : 'Reactivate',
      variant: active ? 'destructive' : 'default',
    });
    if (!ok) return;
    try {
      setBusyId(u.id);
      const updated = await usersApi.toggleActive(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated, active: !active, isActive: !active } : x)));
      toast.success(active ? 'User deactivated' : 'User reactivated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update user');
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(u: User) {
    const ok = await confirm({
      title: 'Delete this user?',
      description: `${u.fullName || u.email} will be permanently removed from the platform. This cannot be undone.`,
      confirmText: 'Delete user',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      setBusyId(u.id);
      await usersApi.remove(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete user');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Users &amp; Roles</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Manage platform members — assign roles, deactivate or remove accounts.</p>
          </div>
          <button onClick={load} className="btn-white shrink-0 rounded-xl flex items-center gap-2"><RefreshCcw size={15} /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(filter === r ? 'ALL' : r)}
            className={`rounded-2xl border p-4 text-left transition-all ${filter === r ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'border-neutral-200 bg-white shadow-card hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'}`}
          >
            <p className={`text-xs font-bold uppercase tracking-wide ${filter === r ? 'opacity-70' : 'text-neutral-500 dark:text-neutral-400'}`}>{roleMeta[r].label}s</p>
            <p className={`mt-1 text-3xl font-black ${filter === r ? '' : 'text-neutral-900 dark:text-white'}`}>{users.filter((u) => u.role === r).length}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or role…" className="input pl-10" />
        </div>
        {filter !== 'ALL' && (
          <button onClick={() => setFilter('ALL')} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <X size={13} /> Clear filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="card grid min-h-60 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : error ? (
        <div className="card py-12 text-center">
          <UserCircle2 size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="mt-4 font-black text-neutral-900 dark:text-white">Couldn't load users</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{error} — an admin account is required to manage users.</p>
          <button onClick={load} className="btn-black mt-5 rounded-xl">Try again</button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="card py-12 text-center">
              <UserCircle2 size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
              <p className="mt-4 font-black text-neutral-900 dark:text-white">No users found</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try adjusting your search or filter.</p>
            </div>
          )}
          {visible.map((u) => {
            const meta = roleMeta[u.role || 'STUDENT'];
            const active = isActive(u);
            const busy = busyId === u.id;
            return (
              <div key={u.id} className={`card !p-4 ${active ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${meta.avatar}`}>{initialsOf(u)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-neutral-900 dark:text-white truncate">{u.fullName || '—'}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{u.email}</p>
                  </div>
                  {!active && <span className="shrink-0 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">Inactive</span>}
                  <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:inline-block ${meta.badge}`}>{meta.label}</span>
                  <select
                    value={u.role || 'STUDENT'}
                    disabled={busy}
                    onChange={(e) => changeRole(u, e.target.value as UserRole)}
                    className="shrink-0 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 outline-none transition hover:border-neutral-400 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{roleMeta[r].label}</option>)}
                  </select>
                  <button
                    disabled={busy}
                    onClick={() => toggleActive(u)}
                    title={active ? 'Deactivate' : 'Reactivate'}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'}`}
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => removeUser(u)}
                    title="Delete user"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && !error && (
        <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center pb-2">{users.length} total users · {visible.length} shown</p>
      )}
    </div>
  );
}
