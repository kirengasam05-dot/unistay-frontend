import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Briefcase, Building2, CheckCircle2, GraduationCap, Home, Inbox, LogOut, ShieldCheck, UserCog, Users } from 'lucide-react';
import { logoutUser } from '../../lib/authStorage';
import type { Role } from '../../types';

const links: Record<Role, {label:string; to:string; icon:any}[]> = {
  STUDENT: [
    {label:'Dashboard', to:'/dashboard', icon:Home},
    {label:'Book Housing', to:'/student/booking', icon:Building2},
    {label:'Search Jobs', to:'/student/jobs', icon:Briefcase},
    {label:'Courses & Skills', to:'/student/learning', icon:BookOpen},
    {label:'Assignments & Exams', to:'/student/assignments', icon:GraduationCap},
    {label:'Certificates', to:'/student/certificates', icon:CheckCircle2},
    {label:'Recommendations', to:'/student/recommendations', icon:BarChart3},
    {label:'Emails', to:'/emails', icon:Inbox},
    {label:'Profile', to:'/profile', icon:UserCog},
  ],
  HOST: [
    {label:'Dashboard', to:'/dashboard', icon:Home},
    {label:'My Housing Listings', to:'/host/listings', icon:Building2},
    {label:'Bookings & Availability', to:'/host/bookings', icon:CheckCircle2},
    {label:'Emails', to:'/emails', icon:Inbox},
    {label:'Verification', to:'/host/verification', icon:ShieldCheck},
    {label:'Profile', to:'/profile', icon:UserCog},
  ],
  EMPLOYER: [
    {label:'Dashboard', to:'/dashboard', icon:Home},
    {label:'Create Jobs', to:'/employer/jobs', icon:Briefcase},
    {label:'Review Applications', to:'/employer/applications', icon:Users},
    {label:'Emails', to:'/emails', icon:Inbox},
    {label:'Verification', to:'/employer/verification', icon:ShieldCheck},
    {label:'Profile', to:'/profile', icon:UserCog},
  ],
  ADMIN: [
    {label:'Dashboard', to:'/dashboard', icon:Home},
    {label:'Users & Roles', to:'/admin/users', icon:Users},
    {label:'Course Builder', to:'/admin/learning', icon:BookOpen},
    {label:'Moderation', to:'/admin/moderation', icon:ShieldCheck},
    {label:'Emails', to:'/emails', icon:Inbox},
    {label:'Analytics', to:'/admin/analytics', icon:BarChart3},
  ],
};

export default function Sidebar({role}:{role:Role}){
  const navigate=useNavigate();
  const logout=()=>{ logoutUser(); navigate('/login'); };
  return <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-neutral-200 bg-white p-5 lg:block">
    <Link to="/" className="flex items-center gap-3 rounded-3xl border border-neutral-200 p-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white font-black">U+</div><div><p className="text-lg font-black">UniStay+</p><p className="text-xs font-semibold text-neutral-500">{role.toLowerCase()} workspace</p></div></Link>
    <nav className="mt-7 space-y-2">{links[role].map(item=>{ const Icon=item.icon; return <NavLink key={item.to} to={item.to} className={({isActive})=>`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive?'bg-black text-white':'text-neutral-700 hover:bg-neutral-100'}`}><Icon size={18}/>{item.label}</NavLink> })}</nav>
    <button onClick={logout} className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut size={18}/>Logout</button>
  </aside>
}
