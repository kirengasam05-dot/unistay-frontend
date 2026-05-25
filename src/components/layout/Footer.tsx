export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-10 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">UniStay+</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Student housing, jobs, skills, and smart recommendations.</p>
        </div>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">© 2026 UniStay+. Built for students.</p>
      </div>
    </footer>
  );
}
