import { apiClient } from './apiClient';

export const appointmentService = {
  getMyAppointments: async () => {
    return await apiClient.get('/pet-owner/appointments/my-appointments');
  },

  getAppointmentById: async (id) => {
    return await apiClient.get(`/pet-owner/appointments/${id}`);
  },

  createAppointment: async (appointmentData) => {
    return await apiClient.post('/pet-owner/appointments', appointmentData);
  },

  cancelAppointment: async (id, cancelReason) => {
    return await apiClient.put(`/pet-owner/appointments/${id}/cancel`, { cancelReason });
  },
};
