import { apiClient } from './apiClient';

const queryString = (params) => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
};

export const adminService = {
  getSummary: () => apiClient.get('/admin/summary'),
  getReports: () => apiClient.get('/admin/reports'),
  getUsers: (params = {}) => apiClient.get(`/admin/users${queryString(params)}`),
  getOwners: (params = {}) => apiClient.get(`/admin/owners${queryString(params)}`),
  createUser: (payload) => apiClient.post('/admin/users', payload),
  updateUser: (id, payload) => apiClient.put(`/admin/users/${id}`, payload),
  linkUserOwner: (id, ownerId) => apiClient.post(`/admin/users/${id}/link-owner`, { ownerId }),
  getRoleSummary: () => apiClient.get('/admin/roles'),
  getGroomers: () => apiClient.get('/admin/groomers'),
  createGroomer: (payload) => apiClient.post('/admin/groomers', payload),
  updateGroomer: (id, payload) => apiClient.put(`/admin/groomers/${id}`, payload),
  deleteGroomer: (id) => apiClient.delete(`/admin/groomers/${id}`),
  getSpecialties: () => apiClient.get('/admin/specialties'),
  createSpecialty: (payload) => apiClient.post('/admin/specialties', payload),
  updateSpecialty: (id, payload) => apiClient.put(`/admin/specialties/${id}`, payload),
  deleteSpecialty: (id) => apiClient.delete(`/admin/specialties/${id}`),
  getSettings: (section) => apiClient.get(`/admin/settings/${section}`),
  createSetting: (section, payload) => apiClient.post(`/admin/settings/${section}`, payload),
  updateSetting: (section, id, payload) => apiClient.put(`/admin/settings/${section}/${id}`, payload),
  deleteSetting: (section, id) => apiClient.delete(`/admin/settings/${section}/${id}`),
  getAuditLogs: (params = {}) => apiClient.get(`/admin/audit-logs${queryString(params)}`),
};
