import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../features/auth/context/AuthContext';
import BrandLogo from '../../../shared/components/BrandLogo';
import { registerSchema, type RegisterFormValues } from '../schemas';

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', location: '', role: 'STUDENT', password: '' },
  });
  const label = 'block text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5';

  const submit = handleSubmit(async (values) => {
    try {
      await createAccount({
        ...values,
        phone: values.phone || undefined,
        location: values.location || undefined,
      });
      toast.success('Account created. Welcome to UniStay+!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create your account.');
    }
  });

  return (
    <div className="auth-page">
      <div className="w-full max-w-2xl">
        <Link to="/" className="mb-8 flex justify-center"><BrandLogo /></Link>
        <div className="auth-card">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign up as a student, host, employer, or instructor.</p>
          <form onSubmit={submit} className="mt-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label}>Full name</label><input {...register('fullName')} placeholder="Your full name" className="auth-input" />{errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}</div>
              <div><label className={label}>Email address</label><input {...register('email')} type="email" placeholder="you@example.com" className="auth-input" />{errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}</div>
              <div><label className={label}>Phone number</label><input {...register('phone')} placeholder="+250 7XX XXX XXX" className="auth-input" /></div>
              <div><label className={label}>Location</label><input {...register('location')} placeholder="City, Country" className="auth-input" /></div>
              <div><label className={label}>I am a</label><select {...register('role')} className="auth-input"><option value="STUDENT">Student</option><option value="HOST">Host</option><option value="EMPLOYER">Employer</option><option value="INSTRUCTOR">Instructor</option></select></div>
              <div><label className={label}>Password</label><div className="relative"><input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="********" className="auth-input pr-12" /><button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}</div>
            </div>
            <button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-black text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">{isSubmitting && <Loader2 size={16} className="animate-spin" />}{isSubmitting ? 'Creating account...' : 'Create account'}</button>
          </form>
          <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">Already have an account?{' '}<Link to="/login" className="font-bold text-neutral-900 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
