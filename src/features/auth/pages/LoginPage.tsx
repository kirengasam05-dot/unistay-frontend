import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { users } from "../../../data/mockData";
import { saveUser, saveToken } from "../../../lib/authStorage";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

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
      setError("Invalid email or password. Please try again.");
      return;
    }

    saveUser(user);
    saveToken("demo-token");
    navigate("/dashboard");
  };

  return (
    <section className="min-h-[85vh] bg-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-neutral-500">
            UniStay+ access
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight text-black">
            Continue to your role-based dashboard.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600">
            Login to manage housing, job opportunities, learning courses,
            applications, exams, certificates, and platform administration
            based on your assigned role.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Student housing", "Job applications", "Skills learning", "Role dashboard"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                >
                  <p className="font-bold text-black">{item}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Secure access after authentication.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/60"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">
            Secure login
          </p>

          <h2 className="mt-3 text-3xl font-black text-black">
            Login to UniStay+
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Enter your account details to access your dashboard.
          </p>

          {error && (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              required
            />

            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500 hover:text-black"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Button className="w-full">Login</Button>
          </div>

          <p className="mt-5 text-center text-sm text-neutral-600">
            No account?{" "}
            <Link className="font-bold text-black underline" to="/register">
              Create student or host account
            </Link>
          </p>

          <p className="mt-5 text-center text-xs text-neutral-400">
            Admin and employer accounts are created by platform administration.
          </p>
        </form>
      </div>
    </section>
  );
}