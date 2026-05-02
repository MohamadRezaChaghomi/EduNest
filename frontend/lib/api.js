const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    logoutAll: () => fetchAPI('/auth/logout-all', { method: 'POST' }),
    refresh: () => fetchAPI('/auth/refresh', { method: 'POST' }),
    me: () => fetchAPI('/auth/me'),
    profile: () => fetchAPI('/auth/profile'),
    updateProfile: (data) => fetchAPI('/auth/update-profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data) => fetchAPI('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
    forgotPassword: (email) => fetchAPI('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, password) => fetchAPI(`/auth/reset-password/${token}`, { method: 'PUT', body: JSON.stringify({ password }) }),
    requestOtp: (phone) => fetchAPI('/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyOtp: (phone, code, rememberMe) => fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code, rememberMe }) }),
  },
  admin: {
    getUsers: (params) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/admin/users${query}`);
    },
    banUser: (id, data) => fetchAPI(`/admin/users/${id}/ban`, { method: 'POST', body: JSON.stringify(data) }),
    unbanUser: (id) => fetchAPI(`/admin/users/${id}/ban`, { method: 'DELETE' }),
    deleteUser: (id) => fetchAPI(`/admin/users/${id}`, { method: 'DELETE' }),
    changeRole: (id, role) => fetchAPI(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    getLogs: (params) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/admin/logs${query}`);
    },
  },
};