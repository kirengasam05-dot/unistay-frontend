import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../auth/hooks/useAuth";
import { useHousingDetailQuery } from "../../housing/hooks/useHousingQueries";
import { bookingsApi } from "../../bookings/bookingsApi";

export default function StudentHostelApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hostel, isLoading, isError } = useHousingDetailQuery(id ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomInfo, setRoomInfo] = useState<any | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rooms = useMemo(() => hostel?.rooms || [], [hostel?.rooms]);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || rooms[0];

  useEffect(() => {
    if (!hostel) return;
    setSelectedRoomId((current) => current || hostel.firstRoomId || hostel.rooms?.[0]?.id || "");
  }, [hostel]);

  useEffect(() => {
    if (!selectedRoom?.id) return;
    bookingsApi.getApplicationData(selectedRoom.id)
      .then((data) => {
        if (data?.student) {
          setFullName(data.student.fullName ?? "");
          setEmail(data.student.email ?? "");
          setPhone(data.student.phone ?? "");
        }
        setRoomInfo(data?.room ?? null);
        setPrefillError(null);
      })
      .catch((err: any) => {
        const message = err?.response?.data?.message || (err instanceof Error ? err.message : "Could not load room details");
        if (/verified|room/i.test(message)) setPrefillError(message);
      });
  }, [selectedRoom?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accepted) return toast.error("Please accept the application terms before submitting.");
    if (!selectedRoom?.id) return toast.error("Choose the bed category before submitting.");
    if (prefillError) return toast.error(prefillError);

    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({
        roomId: selectedRoom.id,
        fullName,
        email,
        phone,
      });
      toast.success("Application submitted. Please wait for host approval.");
      navigate(`/student/booking/${booking.id}/confirmation`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <div className="rounded-lg bg-white p-6 shadow-sm">Loading application form...</div>;
  if (isError || !hostel) return <div className="rounded-lg bg-white p-6 shadow-sm">Hostel not found.</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Apply for one bed</h1>
            <p className="mt-2 text-slate-600">
              Choose the room category you want. Your application reserves one bed only after host approval and payment.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
            Selected price: <strong>{(selectedRoom?.price ?? hostel.price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</strong>
          </div>
        </div>
      </div>

      {prefillError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <div className="font-bold">Application blocked</div>
          <div className="mt-1 text-sm">{prefillError}</div>
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
            <h3 className="text-lg font-semibold text-slate-900">Bed category</h3>
            <p className="mt-1 text-sm text-slate-500">
              You are applying for one bed in the selected room category. A category can receive more applications than available beds.
            </p>
            <div className="mt-4 grid gap-3">
              {rooms.length === 0 ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  This hostel does not have beds available for applications yet.
                </div>
              ) : rooms.map((room) => (
                <label key={room.id} className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${selectedRoom?.id === room.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                  <span>
                    <span className="block font-semibold text-slate-900">{room.category || room.name || "Bed category"}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Apply for 1 bed - {room.availableBeds ?? 0} beds available of {room.capacity ?? "N/A"}
                      {room.roomNumberStart && room.roomNumberEnd ? ` - rooms ${room.roomNumberStart} to ${room.roomNumberEnd}` : ""}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-slate-600">{(room.price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} / month</span>
                  </span>
                  <input type="radio" name="roomId" checked={selectedRoom?.id === room.id} onChange={() => setSelectedRoomId(room.id)} />
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-slate-900" />
            <span className="text-sm text-slate-700">I agree to the hostel application policies and 24-hour payment deadline after approval.</span>
          </label>

          <button type="submit" disabled={submitting || !rooms.length} className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Submitting application..." : "Submit application"}
          </button>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Hostel summary</h2>
            <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-600">
              <div className="font-semibold text-slate-900">{hostel.name ?? hostel.title}</div>
              <div>Location: {hostel.location}</div>
              <div>Room categories: {rooms.length}</div>
              {roomInfo && (
                <div className="mt-2 text-slate-700">
                  Selected bed category: {roomInfo.category ?? roomInfo.name ?? roomInfo.id} - {roomInfo.availableBeds ?? 0} beds open
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
            <strong className="block text-slate-900">What happens next?</strong>
            The host reviews your one-bed application. Once approved, you have 24 hours to pay. If payment expires, your application is rejected and the next student in line can be approved.
          </div>
        </aside>
      </form>
    </div>
  );
}
