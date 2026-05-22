import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getUser } from '../../lib/authStorage';
export default function DashboardLayout(){ const user=getUser(); if(!user) return <Navigate to="/login" replace/>; return <div className="flex min-h-screen bg-neutral-50"><Sidebar role={user.role}/><main className="min-w-0 flex-1 p-4 md:p-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-200 bg-white p-5 shadow-soft"><div><p className="text-sm font-semibold text-neutral-500">Logged in as {user.role}</p><h1 className="text-2xl font-black">{user.fullName}</h1></div><a className="btn-white" href="/">Back to website</a></div><Outlet/></main></div> }
