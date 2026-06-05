import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { useHousingDetailQuery } from "../../housing/hooks/useHousingQueries";
import type { HotelCategory, Housing } from "../../../shared/types/api";
import { hostelHasOpenBeds, hostelName } from "../../../shared/types/api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";
const money = (v?: number | null) => `RWF ${Number(v || 0).toLocaleString()}`;

const CATEGORY_LABELS: Record<HotelCategory, string> = {
  Budget: "Budget",
  Standard: "Standard",
  VIP: "VIP",
};

function getImages(hostel?: Housing) {
  const images = hostel?.images?.filter(Boolean) ?? [];
  if (images.length > 0) return images;
  if (hostel?.image) return [hostel.image];
  return [FALLBACK_IMG];
}

export default function StudentHostelDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { data: hostel, isLoading, isError } = useHousingDetailQuery(id);

  const images = useMemo(() => getImages(hostel), [hostel]);
  const category = useMemo<HotelCategory>(() => {
    if (!hostel) return "Budget";
    return hostel.category ?? ((hostel.price ?? 0) >= 80000 ? "VIP" : (hostel.price ?? 0) >= 35000 ? "Standard" : "Budget");
  }, [hostel]);

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  if (isError || !hostel) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Unable to load hostel details</h1>
        <button onClick={() => navigate("/student/hostels")} className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
          Back to hostels
        </button>
      </div>
    );
  }

  const selectedRoom = hostel.rooms?.[0];
  const availableBeds = selectedRoom?.availableBeds ?? hostel.availableBeds ?? 0;
  const capacity = selectedRoom?.capacity ?? hostel.capacity ?? 0;
  const roomRange = selectedRoom?.roomNumberStart && selectedRoom?.roomNumberEnd ? `${selectedRoom.roomNumberStart} - ${selectedRoom.roomNumberEnd}` : "Assigned after payment";
  const effectivePrice = hostel.price ?? selectedRoom?.price;
  const isAvailable = hostelHasOpenBeds(hostel);
  const isFullyOccupied = !isAvailable;
  const amenities = hostel.amenities?.length ? hostel.amenities : ["Free Wi-Fi", "Communal kitchen", "Laundry access", "24/7 security"];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <button
        onClick={() => navigate("/student/hostels")}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Back to hostels
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src={images[active] ?? FALLBACK_IMG} alt={hostelName(hostel)} className="h-[360px] w-full object-cover" />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    onClick={() => setActive(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${index === active ? "border-slate-950" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${isAvailable ? "bg-emerald-600" : "bg-red-600"}`}>
                {isAvailable ? "Available" : "Occupied all"}
              </span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{CATEGORY_LABELS[category]}</span>
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{hostel.verificationStatus}</span>
            </div>

            <h1 className="mt-4 text-3xl font-black text-slate-950">{hostelName(hostel)}</h1>
            <p className="mt-2 flex items-center gap-2 text-slate-500"><MapPin size={16} /> {hostel.location}</p>
            <p className="mt-5 leading-7 text-slate-700">
              {hostel.description || "Verified student accommodation with host-managed applications and secure payment after approval."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Bed category</div>
                <div className="mt-1 text-lg font-black text-slate-950">{selectedRoom?.category ?? selectedRoom?.name ?? CATEGORY_LABELS[category]}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Beds/room</div>
                <div className="mt-1 text-lg font-black text-slate-950">{capacity}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Beds Available</div>
                <div className="mt-1 text-lg font-black text-slate-950">{availableBeds}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Room range</div>
                <div className="mt-1 text-lg font-black text-slate-950">{roomRange}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">What's included</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Host details</h2>
            <div className="mt-4 text-slate-600">
              <div className="font-bold text-slate-950">{hostel.host?.fullName ?? "Host"}</div>
              <div>{hostel.host?.email ?? "No email available"}</div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Monthly price</p>
            <p className="mt-1 text-4xl font-black text-slate-950">{effectivePrice != null ? money(effectivePrice) : "Contact host"}</p>
            {selectedRoom && (
              <p className="mt-3 text-sm text-slate-600">
                Bed category: <span className="font-semibold text-slate-950">{selectedRoom.category ?? selectedRoom.name ?? selectedRoom.id}</span>
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {isFullyOccupied
                ? "All beds are currently occupied. You can still submit an application and wait for the next available slot."
                : "Submit your application for one bed. The host approves students according to available beds and application order."}
            </div>

            <button
              onClick={() => navigate(`/student/hostels/${id}/apply`)}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-slate-800"
            >
              {isFullyOccupied ? "Join waiting applications" : "Apply for one bed"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              You only pay after the host approves your application. Payment is tracked securely in your dashboard.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
