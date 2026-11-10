// Role definitions
export const ROLES = {
  PET_OWNER: 'PET_OWNER',
  RECEPTIONIST: 'RECEPTIONIST',
  GROOMER: 'GROOMER',
  VET_DOCTOR: 'VET_DOCTOR',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

// Vietnamese display names for Pet Care Store
export const ROLE_LABELS = {
  [ROLES.PET_OWNER]: 'Khách hàng (Chủ thú cưng)',
  [ROLES.RECEPTIONIST]: 'Nhân viên tiếp đón (Lễ tân)',
  [ROLES.GROOMER]: 'Chuyên viên Spa & Grooming',
  [ROLES.VET_DOCTOR]: 'Bác sĩ chuyên khoa thú y',
  [ROLES.MANAGER]: 'Chủ cửa hàng / Quản lý',
  [ROLES.ADMIN]: 'Quản trị viên hệ thống (Admin)',
};

// Appointment & Queue Statuses for Pet Care
export const APPOINTMENT_STATUS = {
  REQUESTED: 'REQUESTED',
  AWAITING_DEPOSIT: 'AWAITING_DEPOSIT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CANCELLED_EARLY: 'CANCELLED_EARLY',
  CANCELLED_LATE: 'CANCELLED_LATE',
  REJECTED: 'REJECTED',
  NO_SHOW: 'NO_SHOW',
};

export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.REQUESTED]: {
    label: 'Chờ cửa hàng xác nhận',
    variant: 'warning',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  [APPOINTMENT_STATUS.AWAITING_DEPOSIT]: {
    label: 'Chờ thanh toán tiền cọc',
    variant: 'warning',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
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
  [APPOINTMENT_STATUS.CANCELLED_EARLY]: {
    label: 'Đã hủy trước hạn',
    variant: 'danger',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  [APPOINTMENT_STATUS.CANCELLED_LATE]: {
    label: 'Đã hủy trễ',
    variant: 'danger',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  [APPOINTMENT_STATUS.REJECTED]: {
    label: 'Cửa hàng từ chối',
    variant: 'danger',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    label: 'Vắng mặt',
    variant: 'neutral',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  },
};
