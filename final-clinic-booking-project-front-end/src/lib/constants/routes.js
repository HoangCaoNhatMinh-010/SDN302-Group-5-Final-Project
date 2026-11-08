export const ROUTES = {
  auth: {
    login: '/login',
    otp: '/otp',
    staffLogin: '/staff-login',
  },
  patient: {
    home: '/home',
    specialties: '/specialties',
    doctors: '/doctors',
    bookingSlot: '/booking/slot',
    bookingConfirm: '/booking/confirm',
    bookingSuccess: '/booking/success',
    appointments: '/appointments',
    profile: '/profile',
  },
  staff: {
    calendar: '/staff/calendar',
    checkIn: '/staff/check-in',
    queue: '/staff/queue',
  },
  doctor: {
    schedule: '/doctor/schedule',
    blockTime: '/doctor/block-time',
  },
  manager: {
    staff: '/manager/staff',
    services: '/manager/services',
    slots: '/manager/slots',
    reports: '/manager/reports',
  },
  admin: {
    roles: '/admin/roles',
    audit: '/admin/audit',
  },
};



