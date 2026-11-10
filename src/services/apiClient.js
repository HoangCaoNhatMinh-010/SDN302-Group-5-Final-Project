/**
 * API Client connected to Express & MongoDB Backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const TOKEN_KEY = 'medcare_auth_token';
const AUTH_STATE_KEY = 'medcare_auth_state';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Lỗi khi đọc token từ localStorage:', e);
  }
  return headers;
};

const request = async (method, endpoint, payload = null) => {
  const options = {
    method,
    headers: getHeaders(),
  };

  if (payload !== null && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(
      AUTH_STATE_KEY,
      JSON.stringify({ isAuthenticated: false, role: null, currentUser: null })
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Lỗi yêu cầu (${response.status})`);
  }
  return data;
};

export const apiClient = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, payload) => request('POST', endpoint, payload),
  put: (endpoint, payload) => request('PUT', endpoint, payload),
  delete: (endpoint) => request('DELETE', endpoint),
};
