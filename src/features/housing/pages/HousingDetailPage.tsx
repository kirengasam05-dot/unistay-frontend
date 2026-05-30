import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, CalendarDays, CheckCircle2, Loader2, MapPin, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { housingApi } from "../housingApi";
import { bookingsApi } from "../../bookings/bookingsApi";
import { useAuth } from "../../../context/AuthContext";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import type { Housing } from "../../../types/api";

const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

function todayPlus(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export default function HousingDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const confirm = useConfirm();

  const [housing, setHousing] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [checkIn, setCheckIn] = useState(todayPlus(1));
  const [checkOut, setCheckOut] = useState(todayPlus(31));
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setHousing(await housingApi.getOne(id));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load this listing");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => {
    const list = housing?.images?.length ? housing.images : housing?.image ? [housing.image] : [];
    return list.length ? list : [FALLBACK_IMG];
  }, [housing]);

  const canBook = !!housing && housing.verificationStatus === "VERIFIED" && housing.availability;

  async function requestBooking() {
    if (!housing) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to book.");
      navigate("/login", { state: { from: `/housing/${id}` } });
      return;
    }
    if (user?.role !== "STUDENT") {
      toast.error("Only students can book housing.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    const ok = await confirm({
      title: "Send booking request?",
      description: `We'll request "${housing.title}" from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}. You'll only pay after the host confirms.`,
      confirmText: "Send request",
    });
    if (!ok) return;
    try {
      setBooking(true);
      await bookingsApi.create({
        housingId: housing.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });
      toast.success("Booking request sent. Track it in your dashboard.");
      navigate("/student/booking");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not request booking");
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;
  }

  if (!housing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Listing not found</h1>
        <p className="mt-2 text-neutral-500">It may have been removed or is no longer available.</p>
        <Link to="/housing" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-black text-white dark:bg-white dark:text-black"><ArrowLeft size={16} /> Back to housing</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <Link to="/housing" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><ArrowLeft size={16} /> Back to housing</Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery + details */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <img src={images[active]} alt={housing.title} className="h-[360px] w-full object-cover" />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((src, i) => (
                  <button key={src + i} onClick={() => setActive(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? "border-black dark:border-white" : "border-transparent"}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${housing.availability ? "bg-emerald-600" : "bg-red-600"}`}>{housing.availability ? "Available" : "Booked"}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${housing.verificationStatus === "VERIFIED" ? "bg-black dark:bg-white dark:text-black" : "bg-neutral-500"}`}>{housing.verificationStatus}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{housing.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-neutral-500 dark:text-neutral-400"><MapPin size={16} />{housing.location}</p>
            {typeof housing.bedrooms === "number" && (
              <p className="mt-1 flex items-center gap-2 text-neutral-500 dark:text-neutral-400"><BedDouble size={16} />{housing.bedrooms} bedroom{housing.bedrooms === 1 ? "" : "s"}</p>
            )}
            <p className="mt-5 leading-7 text-neutral-700 dark:text-neutral-300">{housing.description || "Verified student accommodation."}</p>

            {housing.amenities && housing.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-black uppercase tracking-wide text-neutral-500">Amenities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {housing.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"><CheckCircle2 size={14} className="text-emerald-500" />{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Monthly price</p>
            <p className="mt-1 text-4xl font-black text-neutral-900 dark:text-white">{money(housing.price)}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-500">Check-in</label>
                <div className="relative">
                  <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="date" value={checkIn} min={todayPlus(0)} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-500">Check-out</label>
                <div className="relative">
                  <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
                </div>
              </div>
            </div>

            <button
              disabled={!canBook || booking}
              onClick={requestBooking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:bg-white dark:text-black dark:disabled:bg-neutral-700"
            >
              {booking ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : canBook ? "Request booking" : housing.availability ? "Awaiting verification" : "Currently booked"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-500" />
              You only pay after the host confirms availability. Payment proof is tracked securely in your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
