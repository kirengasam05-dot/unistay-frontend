import { Navigate, Route, Routes, useParams } from "react-router-dom";

import MainLayout from "./shared/components/layout/MainLayout";
import DashboardLayout from "./shared/components/layout/DashboardLayout";

function HousingRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/hostels/${id}` : "/hostels"} replace />;
}

import HomePage from "./features/home/pages/HomePage";
import ProcessPage from "./features/home/pages/ProcessPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import NotFoundPage from "./features/home/pages/NotFoundPage";

import HousingPage from "./features/housing/pages/HousingPage";
import HousingDetailPage from "./features/housing/pages/HousingDetailPage";
import JobsPage from "./features/jobs/pages/JobsPage";
import SkillsPage from "./features/skills/pages/SkillsPage";

import DashboardPage from "./features/users/pages/DashboardPage";
import ProfilePage from "./features/users/pages/ProfilePage";

import StudentHostelDetailPage from "./features/student/pages/StudentHostelDetailPage";
import StudentHostelApplicationPage from "./features/student/pages/StudentHostelApplicationPage";
import StudentHostelPaymentPage from "./features/student/pages/StudentHostelPaymentPage";
import StudentHostelConfirmationPage from "./features/student/pages/StudentHostelConfirmationPage";
import MyAccommodationPage from "./features/student/pages/MyAccommodationPage";
import StudentBookingPage from "./features/student/pages/StudentBookingPage";
import StudentJobsPage from "./features/student/pages/StudentJobsPage";
import StudentLearningPage from "./features/student/pages/StudentLearningPage";
import StudentAssignmentsPage from "./features/student/pages/StudentAssignmentsPage";
import StudentCertificatesPage from "./features/student/pages/StudentCertificatesPage";
import StudentRecommendationsPage from "./features/student/pages/StudentRecommendationsPage";
import StudentNotificationsPage from "./features/student/pages/StudentNotificationsPage";
import StudentCoursePage from "./features/student/pages/StudentCoursePage";
import LearningLayout from "./features/student/components/LearningLayout";

import HostListingsPage from "./features/host/pages/HostListingsPage";
import HostAddListingPage from "./features/host/pages/HostAddListingPage";
import HostEditListingPage from "./features/host/pages/HostEditListingPage";
import HostBookingsPage from "./features/host/pages/HostBookingsPage";
import HostVerificationPage from "./features/host/pages/HostVerificationPage";

import EmployerJobsPage from "./features/employer/pages/EmployerJobsPage";
import EmployerApplicationsPage from "./features/employer/pages/EmployerApplicationsPage";
import EmployerVerificationPage from "./features/employer/pages/EmployerVerificationPage";

import AdminUsersPage from "./features/admin/pages/AdminUsersPage";
import AdminModerationPage from "./features/admin/pages/AdminModerationPage";
import AdminAnalyticsPage from "./features/admin/pages/AdminAnalyticsPage";
import AdminJobsPage from "./features/admin/pages/AdminJobsPage";
import HostJobsPage from "./features/host/pages/HostJobsPage";
import InstructorCoursesPage from "./features/instructor/pages/InstructorCoursesPage";
import InstructorCourseFormPage from "./features/instructor/pages/InstructorCourseFormPage";
import InstructorSkillsPage from "./features/instructor/pages/InstructorSkillsPage";
import InstructorContentPage from "./features/instructor/pages/InstructorContentPage";

import EmailsPage from "./features/emails/pages/EmailsPage";
import ProtectedRoute from "./shared/components/auth/ProtectedRoute";

import HostOccupancyMonitoring from "./features/host/pages/HostOccupancyMonitoring";
import HostWaitlistMonitoring from "./features/host/pages/HostWaitlistMonitoring";
import HostReportsPage from "./features/host/pages/HostReportsPage";

import AdminPaymentsPage from "./features/admin/pages/AdminPaymentsPage";
import AdminSettingsPage from "./features/admin/pages/AdminSettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hostels" element={<HousingPage />} />
        <Route path="/hostels/:id" element={<HousingDetailPage />} />
        <Route path="/housing" element={<Navigate to="/hostels" replace />} />
        <Route path="/housing/:id" element={<HousingRedirect />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/process" element={<ProcessPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/emails" element={<EmailsPage />} />

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/hostels" element={<HousingPage />} />
          <Route path="/student/hostels/:id" element={<StudentHostelDetailPage />} />
          <Route path="/student/hostels/:id/apply" element={<StudentHostelApplicationPage />} />
          <Route path="/student/booking/:id/payment" element={<StudentHostelPaymentPage />} />
          <Route path="/student/booking/:id/confirmation" element={<StudentHostelConfirmationPage />} />
          <Route path="/student/accommodation" element={<MyAccommodationPage />} />
          <Route path="/student/housing" element={<Navigate to="/student/hostels" replace />} />
          <Route path="/student/booking" element={<StudentBookingPage />} />
          <Route path="/student/jobs" element={<StudentJobsPage />} />
          <Route element={<LearningLayout />}>
            <Route path="/student/learning" element={<StudentLearningPage />} />
            <Route path="/student/learning/:id" element={<StudentCoursePage />} />
            <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
            <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentsPage />} />
            <Route path="/student/certificates" element={<StudentCertificatesPage />} />
          </Route>
          <Route path="/student/recommendations" element={<StudentRecommendationsPage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
        </Route>

        <Route element={<ProtectedRoute role="HOST" />}>
          <Route path="/host/listings" element={<HostListingsPage />} />
          <Route path="/host/listings/new" element={<HostAddListingPage />} />
          <Route path="/host/listings/:id/edit" element={<HostEditListingPage />} />
          <Route path="/host/bookings" element={<HostBookingsPage />} />
          <Route path="/host/verification" element={<HostVerificationPage />} />
          <Route path="/host/jobs" element={<HostJobsPage />} />
          <Route path="/host/occupancy" element={<HostOccupancyMonitoring />} />
          <Route path="/host/waitlist" element={<HostWaitlistMonitoring />} />
          <Route path="/host/reports" element={<HostReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute role="EMPLOYER" />}>
          <Route path="/employer/jobs" element={<EmployerJobsPage />} />
          <Route path="/employer/applications" element={<EmployerApplicationsPage />} />
          <Route path="/employer/verification" element={<EmployerVerificationPage />} />
        </Route>

        <Route element={<ProtectedRoute role="INSTRUCTOR" />}>
          <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
          <Route path="/instructor/courses/new" element={<InstructorCourseFormPage />} />
          <Route path="/instructor/courses/:id/edit" element={<InstructorCourseFormPage />} />
          <Route element={<ProtectedRoute role="INSTRUCTOR" />}>
            <Route path="/instructor/skills" element={<InstructorSkillsPage />} />
            <Route path="/instructor/content" element={<InstructorContentPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
