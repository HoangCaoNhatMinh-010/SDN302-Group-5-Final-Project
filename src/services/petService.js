import { apiClient } from './apiClient';

export const petService = {
  /**
   * Get all pets for the current pet owner
   */
  getMyPets: async () => {
    try {
      const response = await apiClient.get('/pet-owner/pets');
      return response;
    } catch (err) {
      console.warn('Lỗi kết nối API danh sách thú cưng:', err.message);
      throw err;
    }
  },

  /**
   * Get a pet by ID
   */
  getPetById: async (id) => {
    return await apiClient.get(`/pet-owner/pets/${id}`);
  },

  /**
   * Create a pet profile
   */
  createPet: async (petData) => {
    if (!petData.name || !petData.name.trim()) {
      throw new Error('Vui lòng nhập tên thú cưng');
    }
    if (!petData.relationship) {
      throw new Error('Vui lòng chọn loài thú cưng');
    }
    if (!petData.dateOfBirth) {
      throw new Error('Vui lòng nhập ngày sinh hoặc tuổi của thú cưng');
    }
    if (!petData.gender) {
      throw new Error('Vui lòng chọn giới tính');
    }

    return await apiClient.post('/pet-owner/pets', petData);
  },

  /**
   * Update a pet profile
   */
  updatePet: async (id, updatedPetData) => {
    if (!updatedPetData.name || !updatedPetData.name.trim()) {
      throw new Error('Vui lòng nhập tên thú cưng');
    }
    if (!updatedPetData.relationship) {
      throw new Error('Vui lòng chọn loài thú cưng');
    }
    if (!updatedPetData.dateOfBirth) {
      throw new Error('Vui lòng nhập ngày sinh hoặc tuổi của thú cưng');
    }
    if (!updatedPetData.gender) {
      throw new Error('Vui lòng chọn giới tính');
    }

    return await apiClient.put(`/pet-owner/pets/${id}`, updatedPetData);
  },

  /**
   * Delete a pet profile
   */
  deletePet: async (id) => {
    return await apiClient.delete(`/pet-owner/pets/${id}`);
  },
};
