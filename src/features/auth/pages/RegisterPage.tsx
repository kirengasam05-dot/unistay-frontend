import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { saveUser, saveToken } from "../../../lib/authStorage";
import type { AuthUser } from "../../../lib/authStorage";
import { useTheme } from "../../../lib/themeContext";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<"STUDENT" | "HOST">("STUDENT");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      location,
      role,
    };
    saveUser(newUser);
    saveToken("demo-token");
    navigate("/dashboard");
  };

  const inputClass = isDark
    ? "w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:bg-white/15"
    : "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:bg-white";

  const labelClass = `text-xs font-semibold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-neutral-500"}`;

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden py-12 transition-colors duration-300 ${isDark ? "" : "bg-neutral-50"}`}>

      {/* light mode background */}
      {!isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-neutral-100" />
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-neutral-200 opacity-60 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-neutral-300 opacity-40 blur-3xl" />
        </>
      )}

      {/* dark mode background */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.04] blur-3xl" />
          <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-neutral-600 opacity-20 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      )}

      {/* theme toggle */}
      <button
        onClick={toggle}
        className={`absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition ${
          isDark
            ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
        }`}
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <Link
          to="/"
          className={`mb-8 text-3xl font-black tracking-tight transition ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          UniStay+
        </Link>

        <form
          onSubmit={submit}
          className={`w-full rounded-3xl p-8 shadow-2xl transition-all ${
            isDark
              ? "border border-white/10 bg-white/[0.07] backdrop-blur-2xl"
              : "border border-neutral-200 bg-white"
          }`}
        >
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-neutral-900"}`}>
            Create an account
          </h2>
          <p className={`mt-1 text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Open to students and hosts only
          </p>

          {error && (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
              isDark
                ? "border border-red-400/20 bg-red-500/10 text-red-400"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}>
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Email address</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 ..." className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>I am a</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "HOST")}
                className={inputClass}
              >
                <option value="STUDENT" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white">Student</option>
                <option value="HOST" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white">Host</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold transition ${
                    isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`mt-2 w-full rounded-xl py-3.5 text-sm font-black transition active:scale-[0.98] ${
                isDark
                  ? "bg-white text-neutral-900 hover:bg-neutral-100"
                  : "bg-neutral-900 text-white hover:bg-neutral-700"
              }`}
            >
              Create account
            </button>
          </div>

          <div className={`mt-6 border-t pt-5 text-center text-sm ${isDark ? "border-white/10 text-neutral-400" : "border-neutral-100 text-neutral-500"}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-bold transition ${isDark ? "text-white hover:text-neutral-200" : "text-neutral-900 hover:underline"}`}
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
