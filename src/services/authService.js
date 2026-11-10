import { ROLES } from '../utils/constants';
import { DEMO_USERS } from '../data/mockData';
import { apiClient } from './apiClient';

export const authService = {
  /**
   * Standard login with email/phone & password
   */
  login: async (identifier, password) => {
    if (!identifier || !identifier.trim()) {
      throw new Error('Vui lòng nhập email hoặc số điện thoại');
    }
    if (!password || !password.trim()) {
      throw new Error('Vui lòng nhập mật khẩu');
    }

    // Ưu tiên gọi API Backend Express + MongoDB
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: identifier.trim(),
        password,
      });

      if (response && response.token) {
        localStorage.setItem('medcare_auth_token', response.token);
      }

      return {
        success: true,
        user: response.user,
        token: response.token,
      };
    } catch (apiError) {
      // Nếu là tài khoản Demo khác (Staff, Doctor, Receptionist, v.v. do không làm backend admin)
      const cleanId = identifier.trim().toLowerCase();
      const matchedRole = Object.keys(DEMO_USERS).find((roleKey) => {
        const u = DEMO_USERS[roleKey];
        return (
          u.email.toLowerCase() === cleanId ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))
        );
      });

      if (matchedRole === ROLES.ADMIN) {
        throw new Error(apiError.message || 'Không thể xác thực tài khoản admin với máy chủ.');
      }

      if (matchedRole && matchedRole !== ROLES.PATIENT) {
        if (password.length < 6) {
          throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự');
        }
        return {
          success: true,
          user: DEMO_USERS[matchedRole],
        };
      }

      throw new Error(apiError.message || 'Email/Số điện thoại hoặc mật khẩu không chính xác');
    }
  },

  /**
   * Google OAuth Login / Auto-Register
   */
  googleLogin: async (googlePayload) => {
    const response = await apiClient.post('/auth/google', googlePayload);

    if (response && response.token) {
      localStorage.setItem('medcare_auth_token', response.token);
    }

    return {
      success: true,
      user: response.user,
      token: response.token,
      isNewUser: response.isNewUser,
      message: response.message,
    };
  },

  /**
   * Multi-step OTP Login (qua Email Gmail thật)
   */
  requestOtp: async (identifier) => {
    if (!identifier || !identifier.trim()) {
      throw new Error('Vui lòng nhập email hoặc số điện thoại');
    }

    return await apiClient.post('/auth/request-otp', {
      identifier: identifier.trim(),
      phone: identifier.trim(),
    });
  },

  /**
   * Verify OTP and Login
   */
  verifyOtpAndLogin: async (identifier, otpCode) => {
    if (!otpCode || !otpCode.trim()) {
      throw new Error('Vui lòng nhập mã OTP');
    }

    const response = await apiClient.post('/auth/verify-otp', {
      identifier: identifier.trim(),
      phone: identifier.trim(),
      otpCode: otpCode.trim(),
    });

    if (response && response.token) {
      localStorage.setItem('medcare_auth_token', response.token);
    }

    return {
      success: true,
      user: response.user,
      token: response.token,
    };
  },

  /**
   * Staff Two-Factor Authentication Login (Dành cho nhân sự nội bộ)
   */
  loginStaffWith2FA: async (email, password, twoFactorCode) => {
    if (!email || !email.trim()) {
      throw new Error('Vui lòng nhập email nhân sự phòng khám');
    }
    if (!password || !password.trim()) {
      throw new Error('Vui lòng nhập mật khẩu');
    }

    const cleanEmail = email.trim().toLowerCase();
    const staffRoles = [
      ROLES.RECEPTIONIST,
      ROLES.DOCTOR,
      ROLES.ADMIN,
      ROLES.CLINIC_MANAGER,
    ];

    const matchedRole = staffRoles.find((roleKey) => {
      const u = DEMO_USERS[roleKey];
      return u.email.toLowerCase() === cleanEmail;
    });

    if (cleanEmail === DEMO_USERS[ROLES.PATIENT].email.toLowerCase()) {
      throw new Error('Tài khoản Bệnh nhân không thuộc diện nhân viên phòng khám.');
    }

    if (!matchedRole) {
      throw new Error('Không tìm thấy thông tin nhân sự với email này.');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu nhân sự không chính xác.');
    }

    if (!twoFactorCode || twoFactorCode.trim() !== '123456') {
      throw new Error('Mã xác thực 2FA không chính xác. Mã demo là: 123456');
    }

    return {
      success: true,
      user: DEMO_USERS[matchedRole],
    };
  },

  /**
   * Send 6-digit OTP to user's Gmail before registration
   */
  sendRegisterOtp: async ({ fullName, phone, email, password, confirmPassword, agreeTerms }) => {
    if (!agreeTerms) {
      throw new Error('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư');
    }

    return await apiClient.post('/auth/register/send-otp', {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
    });
  },

  /**
   * Verify Gmail OTP and complete registration
   */
  register: async ({ fullName, phone, email, password, confirmPassword, otpCode }) => {
    const response = await apiClient.post('/auth/register', {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      otpCode,
    });

    if (response && response.token) {
      localStorage.setItem('medcare_auth_token', response.token);
    }

    return response;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (identifier) => {
    return await apiClient.post('/auth/forgot-password', {
      identifier: identifier.trim(),
    });
  },

  /**
   * Reset password
   */
  resetPassword: async (newPassword, confirmPassword, otpOrToken, identifier) => {
    return await apiClient.post('/auth/reset-password', {
      otp: otpOrToken,
      token: otpOrToken,
      identifier,
      newPassword,
      confirmPassword,
    });
  },
};
