import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, Loader2, ShieldCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../../housing/housingApi";
import { useAuth } from "../../../context/AuthContext";
import type { Housing } from "../../../types/api";

export default function HostVerificationPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await housingApi.getMyListings());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load verification status");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => ({
    verified: items.filter((i) => i.verificationStatus === "VERIFIED").length,
    pending: items.filter((i) => i.verificationStatus === "PENDING").length,
    rejected: items.filter((i) => i.verificationStatus === "REJECTED").length,
  }), [items]);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl"><ShieldCheck size={24} /> Verification</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Our admins verify each listing before students can book it. Track the status of your properties here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {([["Verified", stats.verified, "text-emerald-600", CheckCircle2], ["Pending", stats.pending, "text-amber-600", Clock3], ["Rejected", stats.rejected, "text-red-600", XCircle]] as const).map(([label, value, color, Icon]) => (
          <div key={label} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-500">{label}</p>
              <p className={`mt-1 text-3xl font-black ${color}`}>{value}</p>
            </div>
            <Icon className={color} size={28} />
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-black text-neutral-900 dark:text-white">How verification works</h2>
        <ol className="mt-4 space-y-3">
          {[
            "Create a listing with clear photos, accurate location and price.",
            "Our moderation team reviews it for safety and completeness.",
            "Once verified, students can find and book your property.",
            "Rejected listings can be edited and resubmitted for review.",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-xs font-black text-white dark:bg-white dark:text-black">{i + 1}</span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{step}</span>
            </li>
          ))}
        </ol>
        {user && (
          <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400">
            Signed in as <span className="font-bold text-neutral-900 dark:text-white">{user.fullName || user.email}</span> — Host account.
          </p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-neutral-900 dark:text-white">Your listings</h2>
          <Link to="/host/listings" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Manage listings</Link>
        </div>
        {loading ? (
          <div className="mt-4 grid min-h-32 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No listings yet. <Link to="/host/listings/new" className="font-bold underline">Add one</Link> to start the verification process.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-neutral-900 dark:text-white">{h.title}</p>
                  <p className="truncate text-sm text-neutral-500">{h.location}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${h.verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : h.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{h.verificationStatus}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
