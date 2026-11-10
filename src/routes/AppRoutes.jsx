import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Pet owner pages
import { PetOwnerDashboard } from '../pages/pet-owner/PetOwnerDashboard';
import { PetsPage } from '../pages/pet-owner/PetsPage';
import { BookPetAppointmentPage } from '../pages/pet-owner/BookPetAppointmentPage';
import { PetServicesPage } from '../pages/pet-owner/PetServicesPage';
import { GroomersPage } from '../pages/pet-owner/GroomersPage';
import { PetAvailableSlotsPage } from '../pages/pet-owner/PetAvailableSlotsPage';
import { PetAppointmentsPage } from '../pages/pet-owner/PetAppointmentsPage';

// Other Role Dashboards
import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { GroomerDashboard } from '../pages/groomer/GroomerDashboard';
import { VetDoctorDashboard } from '../pages/vet-doctor/VetDoctorDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminGroomersPage } from '../pages/admin/AdminGroomersPage';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';

// Helper component to redirect root "/" to user's role dashboard
const RootRedirect = () => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleDashboardMap = {
    [ROLES.PET_OWNER]: '/pet-owner/dashboard',
    [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
    [ROLES.GROOMER]: '/groomer/dashboard',
    [ROLES.VET_DOCTOR]: '/vet-doctor/dashboard',
    [ROLES.ADMIN]: '/admin/dashboard',
    [ROLES.MANAGER]: '/manager/dashboard',
  };

  return <Navigate to={roleDashboardMap[role] || '/login'} replace />;
};

const LegacyPetOwnerRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const destination = pathname === '/patient'
    ? '/pet-owner/dashboard'
    : pathname.replace(/^\/patient(?=\/|$)/, '/pet-owner');
  return <Navigate to={`${destination}${search}${hash}`} replace />;
};

const LegacyRoleRedirect = ({ from, to }) => {
  const { pathname, search, hash } = useLocation();
  const destination = pathname.replace(new RegExp(`^/${from}(?=/|$)`), `/${to}`);
  return <Navigate to={`${destination}${search}${hash}`} replace />;
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
        <Route path="patient/*" element={<LegacyPetOwnerRedirect />} />
        <Route path="doctor/*" element={<LegacyRoleRedirect from="doctor" to="groomer" />} />
        <Route path="veterinarian/*" element={<LegacyRoleRedirect from="veterinarian" to="vet-doctor" />} />
        <Route
          path="pet-owner"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <Navigate to="/pet-owner/dashboard" replace />
            </RoleRoute>
          }
        />

        {/* Profile & Security Routes (All authenticated users) */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/change-password" element={<ChangePasswordPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* ================= PET OWNER ROUTES ================= */}
        <Route
          path="pet-owner/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <PetOwnerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="pet-owner/pets"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <PetsPage />
            </RoleRoute>
          }
        />
        <Route
          path="pet-owner/family"
          element={<Navigate to="/pet-owner/pets" replace />}
        />
        <Route
          path="pet-owner/family-members"
          element={<Navigate to="/pet-owner/pets" replace />}
        />
        {/* Alias to support /pet-owner/profile */}
        <Route
          path="pet-owner/profile"
          element={<Navigate to="/profile" replace />}
        />
        <Route
          path="pet-owner/book-appointment"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <BookPetAppointmentPage />
            </RoleRoute>
          }
        />
        <Route
          path="pet-owner/team"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <GroomersPage />
            </RoleRoute>
          }
        />
        <Route
          path="pet-owner/doctors"
          element={<Navigate to="/pet-owner/team" replace />}
        />
        <Route
          path="pet-owner/services"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <PetServicesPage />
            </RoleRoute>
          }
        />
        <Route path="pet-owner/specialties" element={<Navigate to="/pet-owner/services" replace />} />
        <Route
          path="pet-owner/available-slots"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
              <PetAvailableSlotsPage />
            </RoleRoute>
          }
        />
        <Route
          path="pet-owner/appointments"
          element={
            <RoleRoute allowedRoles={[ROLES.PET_OWNER]}>
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
              <PlaceholderPage title="Lịch tổng cửa hàng" category="Tiếp đón" />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/book-for-pet-owner"
          element={
            <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
              <PlaceholderPage title="Đặt lịch hộ khách hàng" category="Tiếp đón" />
            </RoleRoute>
          }
        />
        <Route path="receptionist/book-for-patient" element={<Navigate to="/receptionist/book-for-pet-owner" replace />} />
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

        {/* ================= GROOMER ROUTES ================= */}
        <Route
          path="groomer/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.GROOMER]}>
              <GroomerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="groomer/calendar"
          element={
            <RoleRoute allowedRoles={[ROLES.GROOMER]}>
              <PlaceholderPage title="Lịch chăm sóc cá nhân" category="Chuyên viên" />
            </RoleRoute>
          }
        />
        <Route
          path="groomer/shifts"
          element={
            <RoleRoute allowedRoles={[ROLES.GROOMER]}>
              <PlaceholderPage title="Ca làm việc & lịch grooming" category="Chuyên viên" />
            </RoleRoute>
          }
        />
        <Route
          path="groomer/block-time"
          element={
            <RoleRoute allowedRoles={[ROLES.GROOMER]}>
              <PlaceholderPage title="Quản lý giờ nghỉ" category="Chuyên viên" />
            </RoleRoute>
          }
        />
        <Route
          path="groomer/care-notes"
          element={
            <RoleRoute allowedRoles={[ROLES.GROOMER]}>
              <PlaceholderPage title="Ghi chú chăm sóc thú cưng" category="Chuyên viên" />
            </RoleRoute>
          }
        />
        <Route path="groomer/clinical-notes" element={<Navigate to="/groomer/care-notes" replace />} />
        <Route
          path="groomer/profile"
          element={<Navigate to="/profile" replace />}
        />

        {/* ================= VET DOCTOR ROUTES ================= */}
        <Route
          path="vet-doctor/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.VET_DOCTOR]}>
              <VetDoctorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="vet-doctor/appointments"
          element={
            <RoleRoute allowedRoles={[ROLES.VET_DOCTOR]}>
              <PlaceholderPage title="Lịch khám thú y" category="Bác sĩ thú y" description="Khu vực dành cho lịch hẹn cần khám hoặc tư vấn y tế." />
            </RoleRoute>
          }
        />
        <Route
          path="vet-doctor/medical-notes"
          element={
            <RoleRoute allowedRoles={[ROLES.VET_DOCTOR]}>
              <PlaceholderPage title="Hồ sơ y tế thú cưng" category="Bác sĩ thú y" description="Giao diện ghi chú y tế sẽ kết nối với API medical_notes khi nghiệp vụ này được triển khai." />
            </RoleRoute>
          }
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
          path="admin/groomers"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminGroomersPage />
            </RoleRoute>
          }
        />
        <Route path="admin/doctors" element={<Navigate to="/admin/groomers" replace />} />
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
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="manager/staff"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Đội ngũ chăm sóc" category="Vận hành cửa hàng" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/services"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Dịch vụ Spa & Grooming" category="Vận hành cửa hàng" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/slot-config"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Cấu hình khung giờ & Slot" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/policies"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Chính sách & Quy định" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/reminders"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Chiến dịch nhắc hẹn" category="Vận hành" />
            </RoleRoute>
          }
        />
        <Route
          path="manager/reports"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <PlaceholderPage title="Báo cáo vận hành cửa hàng" category="Vận hành cửa hàng" />
            </RoleRoute>
          }
        />
      </Route>

      {/* Catch-all route -> redirect to root */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
