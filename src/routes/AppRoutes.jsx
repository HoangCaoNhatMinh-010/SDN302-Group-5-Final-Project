import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

// Guards & Layouts
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { OtpLoginPage } from '../pages/auth/OtpLoginPage';
import { Staff2FAPage } from '../pages/auth/Staff2FAPage';

// Common Pages
import { ForbiddenPage } from '../pages/common/ForbiddenPage';
import { ProfilePage } from '../pages/common/ProfilePage';
import { ChangePasswordPage } from '../pages/common/ChangePasswordPage';
import { NotificationsPage } from '../pages/common/NotificationsPage';
import { PlaceholderPage } from '../pages/common/PlaceholderPage';

// Patient Pages (Pet Care)
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { FamilyMembersPage } from '../pages/patient/FamilyMembersPage';
import { BookPetAppointmentPage } from '../pages/patient/BookPetAppointmentPage';
import { PetServicesPage } from '../pages/patient/PetServicesPage';
import { GroomersPage } from '../pages/patient/GroomersPage';
import { PetAvailableSlotsPage } from '../pages/patient/PetAvailableSlotsPage';
import { PetAppointmentsPage } from '../pages/patient/PetAppointmentsPage';

// Other Role Dashboards
import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminDoctorsPage } from '../pages/admin/AdminDoctorsPage';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';

// Helper component to redirect root "/" to user's role dashboard
const RootRedirect = () => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleDashboardMap = {
    [ROLES.PATIENT]: '/patient/dashboard',
    [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
    [ROLES.DOCTOR]: '/doctor/dashboard',
    [ROLES.ADMIN]: '/admin/dashboard',
    [ROLES.CLINIC_MANAGER]: '/manager/dashboard',
  };

  return <Navigate to={roleDashboardMap[role] || '/login'} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Authentication & Error Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/otp-login" element={<OtpLoginPage />} />
      <Route path="/staff-2fa" element={<Staff2FAPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* 2. Protected Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Root Redirect to role dashboard */}
        <Route index element={<RootRedirect />} />

        {/* Profile & Security Routes (All authenticated users) */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/change-password" element={<ChangePasswordPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* ================= PATIENT ROUTES ================= */}
        <Route
          path="patient/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <PatientDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="patient/family"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <FamilyMembersPage />
            </RoleRoute>
          }
        />
        {/* Alias to support /patient/family-members */}
        <Route
          path="patient/family-members"
          element={<Navigate to="/patient/family" replace />}
        />
        {/* Alias to support /patient/profile */}
        <Route
          path="patient/profile"
          element={<Navigate to="/profile" replace />}
        />
        <Route
          path="patient/book-appointment"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <BookPetAppointmentPage />
            </RoleRoute>
          }
        />
        <Route
          path="patient/doctors"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <GroomersPage />
            </RoleRoute>
          }
        />
        <Route
          path="patient/specialties"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <PetServicesPage />
            </RoleRoute>
          }
        />
        <Route
          path="patient/available-slots"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <PetAvailableSlotsPage />
            </RoleRoute>
          }
        />
        <Route
          path="patient/appointments"
          element={
            <RoleRoute allowedRoles={[ROLES.PATIENT]}>
              <PetAppointmentsPage />
            </RoleRoute>
          }
        />

        {/* ================= RECEPTIONIST ROUTES ================= */}
        <Route
          path="receptionist/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <ReceptionistDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/queue"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Quản lý hàng chờ" category="Lễ tân" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/check-in"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Tiếp đón & Check-in" category="Lễ tân" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/master-calendar"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Lịch tổng phòng khám" category="Lễ tân" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/book-for-patient"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Đặt lịch hộ bệnh nhân" category="Lễ tân" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/appointments"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Danh sách lịch hẹn" category="Lễ tân" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/no-show"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Quản lý vắng mặt (No-show)" category="Lễ tân" />
            </RoleRoute>
          }
        />

        {/* ================= DOCTOR ROUTES ================= */}
        <Route
          path="doctor/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/calendar"
          element={
            <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
              <PlaceholderPage title="Lịch cá nhân" category="Bác sĩ" />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/shifts"
          element={
            <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
              <PlaceholderPage title="Ca khám & phiên trực" category="Bác sĩ" />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/block-time"
          element={
            <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
              <PlaceholderPage title="Quản lý Block Time" category="Bác sĩ" />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/clinical-notes"
          element={
            <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
              <PlaceholderPage title="Ghi chú ca khám" category="Bác sĩ" />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/profile"
          element={<Navigate to="/profile" replace />}
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="admin/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="admin/staff"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin/doctors"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDoctorsPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin/services"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="services" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/slot-config"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="slot-config" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/policies"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="policies" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/rbac"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsersPage mode="rbac" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/consent"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="consent" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminAuditLogsPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin/integrations"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="integrations" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/reminders"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSettingsPage section="reminders" />
            </RoleRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminReportsPage />
            </RoleRoute>
          }
        />

        {/* ================= CLINIC MANAGER ROUTES ================= */}
        <Route
          path="manager/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <ManagerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="manager/staff"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Bác sĩ & Nhân viên" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/services"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Dịch vụ phòng khám" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/slot-config"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Cấu hình khung giờ & Slot" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/policies"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Chính sách & Quy định" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/reminders"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Chiến dịch nhắc hẹn" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/reports"
          element={
            <RoleRoute allowedRoles={[ROLES.CLINIC_MANAGER]}>
              <PlaceholderPage title="Báo cáo vận hành phòng khám" category="Vận hành" />
            </RoleRoute>
          }
        />
      </Route>

      {/* Catch-all route -> redirect to root */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
