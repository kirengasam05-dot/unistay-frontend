import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import StudentDashboard from '../../student/StudentDashboard';
import HostDashboard from '../../host/HostDashboard';
import EmployerDashboard from '../../employer/EmployerDashboard';
import AdminDashboard from '../../admin/AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <StudentDashboard />;
  if (user.role === 'HOST') return <HostDashboard />;
  if (user.role === 'EMPLOYER') return <EmployerDashboard />;
  return <AdminDashboard />;
}
