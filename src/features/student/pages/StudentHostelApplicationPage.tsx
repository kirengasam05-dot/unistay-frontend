import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useHousingDetailQuery } from "../../housing/hooks/useHousingQueries";
import { bookingsApi } from "../../bookings/bookingsApi";
import { toast } from "react-hot-toast";

export default function StudentHostelApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hostel, isLoading, isError } = useHousingDetailQuery(id ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [roomInfo, setRoomInfo] = useState<any | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [checkOut, setCheckOut] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    return nextMonth.toISOString().slice(0, 10);
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Loading application form…</div>;
  }

  if (isError || !hostel) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Hostel not found.</div>;
  }

  useEffect(() => {
    // fetch application-data for the first room when the form mounts
    (async () => {
      try {
        const firstRoomId = hostel.firstRoomId ?? hostel.rooms?.[0]?.id;
        if (!firstRoomId) {
          setPrefillError("This hostel does not have a room available for applications yet.");
          return;
        }
        const data = await bookingsApi.getApplicationData(firstRoomId);
        // backend returns student, hostel and room info — autofill fields when provided
        if (data?.student) {
          setFullName(data.student.fullName ?? fullName);
          setEmail(data.student.email ?? email);
          setPhone(data.student.phone ?? phone);
        }
        if (data?.room) setRoomInfo(data.room);
      } catch (err: any) {
        const msg = err?.response?.data?.message || (err instanceof Error ? err.message : String(err));
        // If hostel is not verified, backend will return a helpful message — show it and disable form
        if (msg && /verified/i.test(msg)) {
          setPrefillError(msg);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostel]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accepted) {
      toast.error("Please accept the terms before submitting your application.");
      return;
    }

    setSubmitting(true);

    try {
      if (prefillError) {
        setSubmitting(false);
        return;
      }
      const firstRoomId = hostel.firstRoomId ?? hostel.rooms?.[0]?.id;
      if (!firstRoomId) {
        toast.error("This hostel does not have a room available for applications.");
        setSubmitting(false);
        return;
      }
      const booking = await bookingsApi.create({
        roomId: firstRoomId,
        checkIn,
        checkOut,
        fullName,
        email,
        phone,
      });

      toast.success("Application submitted successfully.");
      navigate(`/student/booking/${booking.id}/confirmation`);
    } catch (error) {
      toast.error("Unable to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Apply for accommodation</h1>
            <p className="mt-2 text-slate-600">Complete your application for {hostel.name ?? hostel.title} and continue to secure your stay.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
            Monthly price: <strong>{(hostel.price ?? hostel.rooms?.[0]?.price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</strong>
          </div>
        </div>
      </div>

      {prefillError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <div className="font-bold">Application blocked</div>
          <div className="mt-1 text-sm">{prefillError}</div>
          <div className="mt-2 text-sm">If you believe this is an error contact student services or the hostel owner for verification.</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Your details</h2>
            <p className="mt-2 text-sm text-slate-600">Use your student details to start your application.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Full name
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Email address
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" />
            </label>
            <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
              Phone number
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" />
            </label>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Stay period</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Check-in
                <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Check-out
                <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900" />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-slate-900" />
            <span className="text-sm text-slate-700">I agree to the accommodation application policies and payment terms.</span>
          </label>

          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Submitting application…" : "Submit application"}
          </button>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Hostel summary</h2>
            <div className="mt-4 text-slate-600">
              <div className="mb-3 text-sm">{hostel.name ?? hostel.title}</div>
              <div className="grid gap-2 text-sm leading-6">
                    <div>Location: {hostel.location}</div>
                <div>Price: {(hostel.price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} / month</div>
                    <div>Rooms: {hostel.bedrooms ?? "N/A"}</div>
                    {roomInfo && (
                      <div className="mt-2 text-sm text-slate-700">Room: {roomInfo.name ?? roomInfo.id} — {roomInfo.category ?? ""} — {roomInfo.price ? (roomInfo.price).toLocaleString() : ""}</div>
                    )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
            <strong className="block text-slate-900">Need help?</strong>
            Our team can support your application, payment timeline, and move-in plan.
          </div>
        </aside>
      </form>
    </div>
  );
}
