import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 dark:bg-transparent">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:hidden" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <Compass size={30} />
        </div>
        <p className="mt-8 text-7xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-8xl">404</p>
        <h1 className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-3 text-sm font-black text-neutral-700 transition hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-black text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Home size={16} /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
