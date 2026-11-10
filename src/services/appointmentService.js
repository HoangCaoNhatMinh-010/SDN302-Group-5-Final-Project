import { apiClient } from './apiClient';

export const appointmentService = {
  getMyAppointments: async () => {
    return await apiClient.get('/appointments/my-appointments');
  },

  getAppointmentById: async (id) => {
    return await apiClient.get(`/appointments/${id}`);
  },

  createAppointment: async (appointmentData) => {
    return await apiClient.post('/appointments', appointmentData);
  },

  cancelAppointment: async (id, cancelReason) => {
    return await apiClient.put(`/appointments/${id}/cancel`, { cancelReason });
  },
};

