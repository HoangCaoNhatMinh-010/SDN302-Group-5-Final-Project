// Role definitions
export const ROLES = {
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
  CLINIC_MANAGER: 'CLINIC_MANAGER',
};

// Vietnamese display names for Pet Care Store
export const ROLE_LABELS = {
  [ROLES.PATIENT]: 'Khách hàng (Chủ thú cưng)',
  [ROLES.RECEPTIONIST]: 'Thu ngân & Tiếp đón Cửa hàng',
  [ROLES.DOCTOR]: 'Chuyên viên Groomer & Thú y',
  [ROLES.ADMIN]: 'Quản trị viên hệ thống',
  [ROLES.CLINIC_MANAGER]: 'Quản lý Cửa hàng Thú cưng',
};

// Appointment & Queue Statuses for Pet Care
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
    label: 'Đã xác nhận lịch',
    variant: 'primary',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
  },
  [APPOINTMENT_STATUS.WAITING]: {
    label: 'Đang ở cửa hàng',
    variant: 'secondary',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
  [APPOINTMENT_STATUS.IN_PROGRESS]: {
    label: 'Đang Spa & Tạo kiểu',
    variant: 'primary',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: 'Đã hoàn tất (Chờ đón bé)',
    variant: 'success',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: 'Đã hủy lịch',
    variant: 'danger',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    label: 'Vắng mặt',
    variant: 'neutral',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  },
};
