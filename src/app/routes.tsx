import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import DashboardLayout from "../components/layout/DashboardLayout";

import HomePage from "../features/home/pages/HomePage";
import ProcessPage from "../features/home/pages/ProcessPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import HousingPage from "../features/housing/pages/HousingPage";
import JobsPage from "../features/jobs/pages/JobsPage";
import SkillsPage from "../features/skills/pages/SkillsPage";

import DashboardPage from "../features/users/pages/DashboardPage";
import PlaceholderPage from "../features/users/pages/PlaceholderPage";
import ProfilePage from "../features/users/pages/ProfilePage";

import StudentBookingPage from "../features/student/pages/StudentBookingPage";
import StudentJobsPage from "../features/student/pages/StudentJobsPage";
import StudentLearningPage from "../features/student/pages/StudentLearningPage";
import StudentAssignmentsPage from "../features/student/pages/StudentAssignmentsPage";
import StudentCertificatesPage from "../features/student/pages/StudentCertificatesPage";

import HostListingsPage from "../features/host/pages/HostListingsPage";
import HostAddListingPage from "../features/host/pages/HostAddListingPage";
import HostBookingsPage from "../features/host/pages/HostBookingsPage";

import EmployerJobsPage from "../features/employer/pages/EmployerJobsPage";
import EmployerApplicationsPage from "../features/employer/pages/EmployerApplicationsPage";

import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminLearningPage from "../features/admin/pages/AdminLearningPage";
import AdminModerationPage from "../features/admin/pages/AdminModerationPage";

import EmailsPage from "../features/emails/pages/EmailsPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/housing" element={<HousingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/process" element={<ProcessPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/emails" element={<EmailsPage />} />
<<<<<<< HEAD

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/booking" element={<StudentBookingPage />} />
          <Route path="/student/jobs" element={<StudentJobsPage />} />
          <Route path="/student/learning" element={<StudentLearningPage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/certificates" element={<StudentCertificatesPage />} />
          <Route path="/student/recommendations" element={<PlaceholderPage title="Recommendations" />} />
          <Route path="/student/notifications" element={<PlaceholderPage title="Notifications" />} />
        </Route>

        <Route element={<ProtectedRoute role="HOST" />}>
          <Route path="/host/listings" element={<HostListingsPage />} />
          <Route path="/host/listings/new" element={<HostAddListingPage />} />
          <Route path="/host/bookings" element={<HostBookingsPage />} />
          <Route path="/host/verification" element={<PlaceholderPage title="Host verification" />} />
        </Route>

        <Route element={<ProtectedRoute role="EMPLOYER" />}>
          <Route path="/employer/jobs" element={<EmployerJobsPage />} />
          <Route path="/employer/applications" element={<EmployerApplicationsPage />} />
          <Route path="/employer/verification" element={<PlaceholderPage title="Employer verification" />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/learning" element={<AdminLearningPage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
        </Route>
=======

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/booking" element={<StudentBookingPage />} />
          <Route path="/student/jobs" element={<StudentJobsPage />} />
          <Route path="/student/learning" element={<StudentLearningPage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/certificates" element={<StudentCertificatesPage />} />
          <Route path="/student/recommendations" element={<PlaceholderPage title="Recommendations" />} />
          <Route path="/student/notifications" element={<PlaceholderPage title="Notifications" />} />
        </Route>

        <Route element={<ProtectedRoute role="HOST" />}>
          <Route path="/host/listings" element={<HostListingsPage />} />
          <Route path="/host/listings/new" element={<HostAddListingPage />} />
          <Route path="/host/bookings" element={<HostBookingsPage />} />
          <Route path="/host/verification" element={<PlaceholderPage title="Host verification" />} />
        </Route>

        <Route element={<ProtectedRoute role="EMPLOYER" />}>
          <Route path="/employer/jobs" element={<EmployerJobsPage />} />
          <Route path="/employer/applications" element={<EmployerApplicationsPage />} />
          <Route path="/employer/verification" element={<PlaceholderPage title="Employer verification" />} />
        </Route>

<<<<<<< HEAD
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/learning" element={<AdminLearningPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
>>>>>>> afb76de (feat: enhance host dashboard and booking management)
=======
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/learning" element={<AdminLearningPage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
        </Route>
>>>>>>> 8757ee0 (feat(bookings): wire booking flow to shared storage and real API)
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
