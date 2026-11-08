import { apiClient } from './apiClient';

export const familyMemberService = {
  /**
   * Get all family members for current patient
   */
  getFamilyMembers: async () => {
    try {
      const response = await apiClient.get('/family-members');
      return response;
    } catch (err) {
      console.warn('Lỗi kết nối API danh sách người thân:', err.message);
      throw err;
    }
  },

  /**
   * Get single member by ID
   */
  getFamilyMemberById: async (id) => {
    return await apiClient.get(`/family-members/${id}`);
  },

  /**
   * Create a new family member
   */
  createFamilyMember: async (memberData) => {
    if (!memberData.name || !memberData.name.trim()) {
      throw new Error('Vui lòng nhập họ và tên người thân');
    }
    if (!memberData.relationship) {
      throw new Error('Vui lòng chọn mối quan hệ');
    }
    if (!memberData.dateOfBirth) {
      throw new Error('Vui lòng nhập ngày sinh');
    }
    if (!memberData.gender) {
      throw new Error('Vui lòng chọn giới tính');
    }

    return await apiClient.post('/family-members', memberData);
  },

  /**
   * Update family member
   */
  updateFamilyMember: async (id, updatedData) => {
    if (!updatedData.name || !updatedData.name.trim()) {
      throw new Error('Vui lòng nhập họ và tên người thân');
    }
    if (!updatedData.relationship) {
      throw new Error('Vui lòng chọn mối quan hệ');
    }
    if (!updatedData.dateOfBirth) {
      throw new Error('Vui lòng nhập ngày sinh');
    }
    if (!updatedData.gender) {
      throw new Error('Vui lòng chọn giới tính');
    }

    return await apiClient.put(`/family-members/${id}`, updatedData);
  },

  /**
   * Delete family member
   */
  deleteFamilyMember: async (id) => {
    return await apiClient.delete(`/family-members/${id}`);
  },
};
