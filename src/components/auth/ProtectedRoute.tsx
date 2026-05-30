import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../lib/authStorage';

interface Props {
  /** If provided, the user must have exactly this role to view the route. */
  role?: UserRole;
}

export default function ProtectedRoute({ role }: Props) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the boot-time token validation before deciding anything.
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
