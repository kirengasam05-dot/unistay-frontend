import { Link } from 'react-router-dom';
import { BookOpen, Briefcase, Building2, ShieldCheck, UserPlus } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Register your account', description: 'Sign up as a Student or Host. Employer and Admin accounts are created internally by platform administrators.', tag: 'Getting started' },
  { icon: Building2, title: 'Find & book verified housing', description: 'Students browse verified listings, send booking requests, and wait for host confirmation. Payment only processes after the host approves.', tag: 'Housing' },
  { icon: Briefcase, title: 'Apply for jobs & internships', description: 'Employers publish opportunities with skill requirements. Students apply and employers review compatibility based on course certificates.', tag: 'Jobs' },
  { icon: BookOpen, title: 'Study, take exams & earn certificates', description: 'Employers upload courses, videos, materials and exams. Students complete them to earn certificates that boost their job match score.', tag: 'Skills' },
  { icon: ShieldCheck, title: 'Admin manages the platform', description: 'Admins oversee users, roles, verifications, learning content, analytics and moderation to keep the platform safe and effective.', tag: 'Administration' },
];

export default function ProcessPage() {
  return (
    <div className="dark:bg-neutral-950">
      <section className="page-hero text-center">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Everything in five simple steps.</h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">UniStay+ connects students, hosts, employers and admins in one seamless ecosystem.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-black">Get started</Link>
            <Link to="/" className="btn rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">Back to home</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-neutral-200 dark:bg-neutral-800 sm:left-8" />
          <div className="space-y-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex gap-6 sm:gap-8">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:h-16 sm:w-16">
                    <Icon size={20} className="text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="eyebrow">Step {i + 1}</span>
                      <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{step.tag}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-black text-neutral-900 dark:text-white sm:text-2xl">{step.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 px-4 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Ready to get started?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">Create your account in seconds and access housing, jobs and skills all in one place.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-black">Create account</Link>
          <Link to="/housing" className="btn-white">Browse housing</Link>
        </div>
      </section>
    </div>
  );
}
