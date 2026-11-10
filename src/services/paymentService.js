import { apiClient } from './apiClient';

export const paymentService = {
  createPayosLink: async (appointmentId) => {
    return await apiClient.post('/payments/create-payos-link', { appointmentId });
  },

  verifyPayosPayment: async ({ orderCode, appointmentId, simulateSuccess = false }) => {
    return await apiClient.post('/payments/verify-payos', {
      orderCode,
      appointmentId,
      simulateSuccess,
    });
  },
};

