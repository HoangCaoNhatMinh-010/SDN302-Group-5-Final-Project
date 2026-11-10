import { apiClient } from './apiClient';

export const groomerService = {
  getAllGroomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/groomer?${query}` : '/groomer';
    return await apiClient.get(endpoint);
  },

  getGroomerById: async (id) => {
    return await apiClient.get(`/groomer/${id}`);
  },

  getAvailableSlots: async (groomerId, date, durationMinutes) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (durationMinutes) params.set('durationMinutes', durationMinutes);
    const endpoint = params.size
      ? `/groomer/${groomerId}/available-slots?${params.toString()}`
      : `/groomer/${groomerId}/available-slots`;
    return await apiClient.get(endpoint);
  },

  getAllServices: async () => {
    return await apiClient.get('/groomer/services');
  },
};
