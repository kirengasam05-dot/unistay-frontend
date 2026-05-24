import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { users } from "../../../data/mockData";
import { saveUser, saveToken } from "../../../lib/authStorage";
import { useTheme } from "../../../lib/themeContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const user = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
    saveUser(user);
    saveToken("demo-token");
    navigate("/dashboard");
  };

  const isDark = theme === "dark";

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden transition-colors duration-300 ${isDark ? "" : "bg-neutral-50"}`}>

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
        {/* brand */}
        <Link
          to="/"
          className={`mb-8 text-3xl font-black tracking-tight transition ${isDark ? "text-white" : "text-neutral-900"}`}
        >
          UniStay+
        </Link>

        {/* card */}
        <form
          onSubmit={submit}
          className={`w-full rounded-3xl p-8 shadow-2xl transition-all ${
            isDark
              ? "border border-white/10 bg-white/[0.07] backdrop-blur-2xl"
              : "border border-neutral-200 bg-white"
          }`}
        >
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-neutral-900"}`}>
            Welcome back
          </h2>
          <p className={`mt-1 text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Sign in to continue to your dashboard
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
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/10 text-white placeholder-neutral-500 focus:border-white/30 focus:bg-white/15"
                    : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/10 text-white placeholder-neutral-500 focus:border-white/30 focus:bg-white/15"
                      : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white"
                  }`}
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
              Log in
            </button>
          </div>

          <div className={`mt-6 border-t pt-5 text-center text-sm ${isDark ? "border-white/10 text-neutral-400" : "border-neutral-100 text-neutral-500"}`}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`font-bold transition ${isDark ? "text-white hover:text-neutral-200" : "text-neutral-900 hover:underline"}`}
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
