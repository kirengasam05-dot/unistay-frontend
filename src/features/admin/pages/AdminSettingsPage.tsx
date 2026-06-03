import { useState } from "react";
import { toast } from "react-hot-toast";
import { Settings, Shield, Clock, FileText, ClipboardList } from "lucide-react";

export default function AdminSettingsPage() {
  const [appWindowOpen, setAppWindowOpen] = useState(true);
  const [rules, setRules] = useState({
    maxWaitlistSize: 50,
    priorityPolicy: "first_come", // first_come, final_year, financial_need
    webhookRetryLimit: 3,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings successfully updated!");
  };

  const auditLogs = [
    { id: 1, action: "USER_ROLE_CHANGE", user: "Admin Manager", details: "Changed Aline Student role to STUDENT", time: "2026-06-03 11:20" },
    { id: 2, action: "HOSTEL_VERIFICATION", user: "Admin Manager", details: "Verified Kacyiru Student Residence", time: "2026-06-03 10:45" },
    { id: 3, action: "REFUND_APPROVED", user: "Admin Manager", details: "Refund approved for Booking b-17849204", time: "2026-06-03 09:12" },
    { id: 4, action: "WAITLIST_PROMOTION", user: "System Webhook", details: "Promoted student Claude to CONFIRMED for Kacyiru Room 4", time: "2026-06-03 08:30" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">System Configuration</h1>
        <p className="mt-2 text-slate-600">Configure waiting list metrics, verify webhook logs, set deadlines, and inspect active logs.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Rules and configurations */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings size={20} className="text-indigo-600" />
              <span>Waiting List & Allocation Rules</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Max Waitlist Size per Hostel
                <input
                  type="number"
                  value={rules.maxWaitlistSize}
                  onChange={(e) => setRules((prev) => ({ ...prev, maxWaitlistSize: Number(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Waitlist Allocation Priority
                <select
                  value={rules.priorityPolicy}
                  onChange={(e) => setRules((prev) => ({ ...prev, priorityPolicy: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="first_come">First Come, First Served</option>
                  <option value="final_year">Final Year Priority</option>
                  <option value="financial_need">Financial Needs Merit Basis</option>
                </select>
              </label>
            </div>
          </div>

          {/* Accommodation policies & periods */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              <span>Application Periods</span>
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Hostel Registration Window</span>
                <span className="text-xs text-slate-500">Allow incoming students to apply for hostel rooms online.</span>
              </div>
              <button
                type="button"
                onClick={() => setAppWindowOpen(!appWindowOpen)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  appWindowOpen ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {appWindowOpen ? "ACTIVE / OPEN" : "CLOSED"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-700 text-white py-3 rounded-3xl text-sm font-semibold transition"
          >
            Save Configurations
          </button>
        </form>

        {/* System Audit logs */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 self-start">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList size={20} className="text-indigo-600" />
            <span>Audit Trail Logs</span>
          </h2>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="text-xs space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-400 font-mono">{log.time}</span>
                </div>
                <p className="text-slate-600 leading-normal">{log.details}</p>
                <div className="text-[10px] text-slate-400">Triggered by: {log.user}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
