import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Briefcase, Building2, CalendarCheck, ChevronDown, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useConfirm } from '../ui/ConfirmDialog';
import BrandLogo from '../BrandLogo';

const links = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/student/hostels', label: 'Hostels', icon: Building2 },
  { to: '/student/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/student/learning', label: 'Learning', icon: BookOpen },
  { to: '/student/booking', label: 'Bookings', icon: CalendarCheck },
];

export default function StudentNavbar() {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const overHero = location.pathname === '/dashboard' && !scrolled;
  const text = overHero ? 'text-white' : 'text-slate-900 dark:text-white';
  const muted = overHero ? 'text-white/75 hover:text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white';

  async function signOut() {
    setMenuOpen(false);
    if (!await confirm({ title: 'Log out?', description: "You'll need to sign in again to access your dashboard.", confirmText: 'Log out' })) return;
    logout();
    navigate('/login');
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${overHero ? 'border-transparent bg-transparent' : 'border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95'}`}>
      <nav className="mx-auto flex h-[82px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <NavLink to="/dashboard"><BrandLogo lightText={overHero} iconTile={overHero} /></NavLink>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? text : muted}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/student/notifications" className={`grid h-10 w-10 place-items-center rounded-full transition ${overHero ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800'}`} aria-label="Notifications">
            <Bell size={17} />
          </NavLink>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-neutral-800 dark:text-neutral-200">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName || user.email || 'Student'} className="h-full w-full object-cover" />
                ) : (
                  (user?.fullName || user?.email || 'S')[0].toUpperCase()
                )}
              </div>
              <span className="hidden max-w-40 truncate sm:inline">{user?.fullName || user?.email || 'Student'}</span>
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                <p className="truncate border-b border-slate-100 px-3 pb-3 pt-1 text-sm font-black text-slate-900 dark:border-neutral-800 dark:text-white">{user?.fullName || user?.email || 'Student'}</p>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-800"><User size={16} /> Account center</NavLink>
                <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={`flex items-center justify-around border-t px-2 py-1 md:hidden ${overHero ? 'border-white/10 bg-slate-950/15' : 'border-slate-100 bg-white dark:border-neutral-800 dark:bg-neutral-950'}`}>
        {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold ${isActive ? overHero ? 'text-white' : 'text-emerald-600' : overHero ? 'text-white/65' : 'text-slate-500'}`}><Icon size={16} />{label}</NavLink>)}
      </div>
    </header>
  );
}
