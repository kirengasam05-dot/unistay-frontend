import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Clock3, Home, Loader2, RefreshCcw, Users } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { usersApi } from "../../users/usersApi";
import type { Housing, User } from "../../../types/api";

const ROLES = ["STUDENT", "HOST", "EMPLOYER", "ADMIN"] as const;
const roleColor: Record<string, string> = {
  STUDENT: "bg-blue-500", HOST: "bg-emerald-500", EMPLOYER: "bg-violet-500", ADMIN: "bg-rose-500",
};

export default function AdminAnalyticsPage() {
  const [listings, setListings] = useState<Housing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState(false);

  async function load() {
    setLoading(true);
    setUsersError(false);
    try {
      setListings(await housingApi.getAll());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load listings");
    }
    try {
      setUsers(await usersApi.list());
    } catch {
      // /users is admin-only; show a hint rather than failing the whole page.
      setUsersError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const housingStats = useMemo(() => ({
    total: listings.length,
    verified: listings.filter((l) => l.verificationStatus === "VERIFIED").length,
    pending: listings.filter((l) => l.verificationStatus === "PENDING").length,
    available: listings.filter((l) => l.availability).length,
  }), [listings]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => { if (u.role) counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [users]);

  const maxRole = Math.max(1, ...ROLES.map((r) => roleCounts[r] || 0));

  const cards = [
    { label: "Total listings", value: housingStats.total, icon: Building2 },
    { label: "Verified", value: housingStats.verified, icon: CheckCircle2 },
    { label: "Pending review", value: housingStats.pending, icon: Clock3 },
    { label: "Available now", value: housingStats.available, icon: Home },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Analytics</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Live platform metrics from the backend.</p>
          </div>
          <button onClick={load} className="btn-white rounded-xl flex items-center gap-2"><RefreshCcw size={15} /> Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="card grid min-h-60 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">{value}</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black"><Icon size={20} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="flex items-center gap-2 font-black text-neutral-900 dark:text-white"><Users size={18} /> Users by role</h2>
            {usersError ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                User data requires admin privileges on the backend. Sign in with an admin account to view role distribution.
              </p>
            ) : users.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">No users found.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {ROLES.map((role) => {
                  const count = roleCounts[role] || 0;
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{role}</span>
                        <span className="font-black text-neutral-900 dark:text-white">{count}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div className={`h-2.5 rounded-full ${roleColor[role]}`} style={{ width: `${(count / maxRole) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="pt-2 text-sm font-bold text-neutral-500">Total users: {users.length}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
