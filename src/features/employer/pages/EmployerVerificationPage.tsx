import { CheckCircle2, FileCheck2, Mail, ShieldCheck, Building2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function EmployerVerificationPage() {
  const { user } = useAuth();

  const checklist = [
    { label: "Account created", done: true, hint: "Your employer account is active." },
    { label: "Email on file", done: !!user?.email, hint: user?.email || "Add an email to your profile." },
    { label: "Company / location set", done: !!user?.location, hint: user?.location || "Add your company location in Profile." },
    { label: "Admin review", done: false, hint: "Our team verifies employers before jobs go live." },
  ];

  const completed = checklist.filter((c) => c.done).length;
  const pct = Math.round((completed / checklist.length) * 100);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl"><ShieldCheck size={24} /> Employer Verification</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Verified employers build trust with students and get priority placement for their job posts.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <p className="font-black text-neutral-900 dark:text-white">Verification progress</p>
          <span className="text-sm font-black text-neutral-900 dark:text-white">{pct}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-6 space-y-3">
          {checklist.map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <CheckCircle2 size={20} className={`mt-0.5 shrink-0 ${c.done ? "text-emerald-500" : "text-neutral-300 dark:text-neutral-600"}`} />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">{c.label}</p>
                <p className="text-sm text-neutral-500">{c.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {([["Trusted badge", Building2, "Show students you're a verified employer."], ["Faster approvals", FileCheck2, "Verified posts skip extra moderation."], ["Direct contact", Mail, "Reach matched candidates by email."]] as const).map(([title, Icon, body]) => (
          <div key={title} className="card">
            <Icon size={22} className="text-neutral-700 dark:text-neutral-300" />
            <p className="mt-3 font-black text-neutral-900 dark:text-white">{title}</p>
            <p className="mt-1 text-sm text-neutral-500">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
