import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../../lib/authStorage';
import type { UserRole } from '../../lib/authStorage';

interface Props {
  role: UserRole;
}

export default function ProtectedRoute({ role }: Props) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
