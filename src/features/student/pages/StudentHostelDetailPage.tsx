import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHousingDetailQuery } from "../../housing/hooks/useHousingQueries";
import { useAuth } from "../../auth/hooks/useAuth";
import type { HotelCategory } from "../../../shared/types/api";

const CATEGORY_LABELS: Record<HotelCategory, string> = {
  Budget: "Budget",
  Standard: "Standard",
  VIP: "VIP",
};

export default function StudentHostelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hostel, isLoading, isError } = useHousingDetailQuery(id ?? "");

  const category = useMemo<HotelCategory>(() => {
    if (!hostel) return "Budget";
    return hostel.category ?? ((hostel.price ?? 0) >= 80000 ? "VIP" : (hostel.price ?? 0) >= 35000 ? "Standard" : "Budget");
  }, [hostel]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="h-6 mb-4 bg-slate-200 rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (isError || !hostel) {
    return <div className="p-6 bg-white rounded-lg shadow-sm">Unable to load hostel details.</div>;
  }

  const availableBeds = hostel.availableBeds ?? Math.max(0, hostel.bedrooms ?? 1);
  const isFullyOccupied = availableBeds <= 0 || hostel.availability === false;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="text-sm text-slate-600">{hostel.location}</span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">{hostel.name ?? hostel.title}</h1>
            <p className="max-w-2xl text-slate-600">{hostel.description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-right">
            <div className="text-sm text-slate-500">Per month</div>
            <div className="mt-2 text-4xl font-semibold text-slate-900">{(hostel.price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div>Bedrooms: {hostel.bedrooms ?? "N/A"}</div>
              <div>Total Bed Capacity: {hostel.capacity ?? (hostel.bedrooms ? hostel.bedrooms * 2 : 2)}</div>
              <div>Beds Available: {availableBeds}</div>
              <div>Category: {category}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">What's included</h2>
            <div className="mt-4 grid gap-3 text-slate-600">
              <div>Free Wi-Fi</div>
              <div>Communal kitchen</div>
              <div>Laundry access</div>
              <div>24/7 security</div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Host details</h2>
            <div className="mt-4 text-slate-600">
              <div className="font-medium text-slate-900">{hostel.host?.fullName ?? "Host"}</div>
              <div>{hostel.host?.email ?? "No email available"}</div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">Application</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{isFullyOccupied ? "Waitlist only" : "Apply now"}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isFullyOccupied
                ? "This hostel is fully occupied. You may still join the waitlist and we will notify you if a room opens up."
                : "Complete your application to reserve your spot. Payment will be requested once the application is approved."}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate(`/student/hostels/${id}/apply`)}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {isFullyOccupied ? "Join waitlist" : "Apply for accommodation"}
              </button>
              <button
                onClick={() => navigate("/student/hostels")}
                className="inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back to hostels
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">Need help?</div>
            <div className="mt-3 text-slate-600">Reach out to our student support team for assistance with hostel applications and payment options.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
