import { apiClient } from './apiClient';

export const profileService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response;
    } catch (err) {
      console.warn('Lấy profile từ API lỗi, dùng dữ liệu cục bộ:', err.message);
      return { success: false, message: err.message };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, profileData) => {
    if (!profileData.name || !profileData.name.trim()) {
      throw new Error('Họ và tên không được để trống');
    }
    if (!profileData.email || !profileData.email.trim()) {
      throw new Error('Email không được để trống');
    }
    if (!profileData.phone || !profileData.phone.trim()) {
      throw new Error('Số điện thoại không được để trống');
    }

    const response = await apiClient.put('/profile', profileData);
    return response;
  },

  /**
   * Change password
   */
  changePassword: async (userId, { currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword || !currentPassword.trim()) {
      throw new Error('Vui lòng nhập mật khẩu hiện tại');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự');
    }
    if (newPassword === currentPassword) {
      throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Mật khẩu xác nhận không trùng khớp');
    }

    const response = await apiClient.put('/profile/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response;
  },
};
