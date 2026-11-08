// Role definitions
export const ROLES = {
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
  CLINIC_MANAGER: 'CLINIC_MANAGER',
};

// Vietnamese display names for roles
export const ROLE_LABELS = {
  [ROLES.PATIENT]: 'Bệnh nhân',
  [ROLES.RECEPTIONIST]: 'Lễ tân phòng khám',
  [ROLES.DOCTOR]: 'Bác sĩ chuyên khoa',
  [ROLES.ADMIN]: 'Quản trị viên hệ thống',
  [ROLES.CLINIC_MANAGER]: 'Quản lý phòng khám',
};

// Appointment & Queue Statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.PENDING]: {
    label: 'Chờ xác nhận',
    variant: 'warning',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: 'Đã xác nhận',
    variant: 'primary',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
  },
  [APPOINTMENT_STATUS.WAITING]: {
    label: 'Đang chờ khám',
    variant: 'secondary',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
  [APPOINTMENT_STATUS.IN_PROGRESS]: {
    label: 'Đang khám',
    variant: 'primary',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: 'Hoàn thành',
    variant: 'success',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    variant: 'danger',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    label: 'Vắng mặt (No-show)',
    variant: 'neutral',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  },
};
