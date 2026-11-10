import { apiClient } from './apiClient';

export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/doctors?${query}` : '/doctors';
    return await apiClient.get(endpoint);
  },

  getDoctorById: async (id) => {
    return await apiClient.get(`/doctors/${id}`);
  },

  getAvailableSlots: async (doctorId, date) => {
    const endpoint = date
      ? `/doctors/${doctorId}/available-slots?date=${encodeURIComponent(date)}`
      : `/doctors/${doctorId}/available-slots`;
    return await apiClient.get(endpoint);
  },

  getAllSpecialties: async () => {
    return await apiClient.get('/doctors/specialties');
  },
};

