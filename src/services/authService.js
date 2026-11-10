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

    const response = await apiClient.post('/auth/login', {
      identifier: identifier.trim(),
      password,
    });

    if (response?.token) {
      localStorage.setItem('medcare_auth_token', response.token);
    }

    return {
      success: true,
      user: response.user,
      token: response.token,
    };
  },

  /**
   * Multi-step OTP Login
   */
  requestOtp: async (phone) => {
    if (!phone || !phone.trim()) {
      throw new Error('Vui lòng nhập số điện thoại');
    }

    return apiClient.post('/auth/request-otp', { phone: phone.trim() });
  },

  /**
   * Verify OTP and Login
   */
  verifyOtpAndLogin: async (phone, otpCode) => {
    if (!otpCode || !otpCode.trim()) {
      throw new Error('Vui lòng nhập mã OTP');
    }

    const response = await apiClient.post('/auth/verify-otp', {
      phone: phone.trim(),
      otpCode: otpCode.trim(),
    });

    if (response?.token) {
      localStorage.setItem('medcare_auth_token', response.token);
    }

    return {
      success: true,
      user: response.user,
      token: response.token,
    };
  },

  /**
   * Register a new pet-owner account
   */
  register: async ({ fullName, phone, email, password, confirmPassword, agreeTerms }) => {
    if (!agreeTerms) {
      throw new Error('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư');
    }

    return apiClient.post('/auth/register', {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
    });
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
  resetPassword: async (newPassword, confirmPassword) => {
    return await apiClient.post('/auth/reset-password', {
      newPassword,
      confirmPassword,
    });
  },
};
