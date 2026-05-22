import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { users } from "../../../data/mockData";
import { saveUser, saveToken } from "../../../lib/authStorage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />

      {/* decorative glow orbs */}
      <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.03] blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-white opacity-[0.04] blur-3xl" />
      <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-neutral-600 opacity-20 blur-[80px]" />

      {/* subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* brand */}
        <Link
          to="/"
          className="mb-8 text-3xl font-black tracking-tight text-white"
        >
          UniStay+
        </Link>

        {/* card */}
        <form
          onSubmit={submit}
          className="w-full rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-2xl"
        >
          <h2 className="text-2xl font-black text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Sign in to continue to your dashboard
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:bg-white/15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500 transition hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-white py-3.5 text-sm font-black text-neutral-900 transition hover:bg-neutral-100 active:scale-[0.98]"
            >
              Log in
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-neutral-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-white transition hover:text-neutral-200"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
