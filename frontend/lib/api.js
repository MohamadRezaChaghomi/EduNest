// frontend/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Set token in localStorage
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  }
};

// Remove token
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};

// Core fetch function – no automatic redirect!
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If 401 Unauthorized, just throw an error – do NOT redirect here
  if (res.status === 401) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  auth: {
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    logoutAll: () => fetchAPI('/auth/logout-all', { method: 'POST' }),
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
    // مدیریت نظرات در حالت ادمین (دریافت نظرات نیازمند تأیید)
    getPendingReviews: () => fetchAPI('/admin/reviews/pending'),
    getReports: (params) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/admin/reports${query}`);
    },
    resolveReport: (id, { action, adminNote }) => 
      fetchAPI(`/admin/reports/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ action, adminNote }) }),
    getTickets: () => fetchAPI('/admin/tickets'),
  },

  categories: {
    getAll: () => fetchAPI('/categories'),
    getById: (id) => fetchAPI(`/categories/${id}`),
  },

  courses: {
    getAll: (params) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/courses${query}`);
    },
    getAllAdmin: (params) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/courses/admin/all${query}`);
    },
    getBySlug: (slug) => fetchAPI(`/courses/${slug}`),
    getById: (id) => fetchAPI(`/courses/${id}`),
    getPopular: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchAPI(`/courses/popular${query ? '?' + query : ''}`);
    },
    getMyCourses: () => fetchAPI('/courses/instructor/my-courses'),
    getMyEnrolledCourses: () => fetchAPI('/courses/my-enrolled'), // باید در بک‌اند پیاده شود
    create: (data) => fetchAPI('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/courses/${id}`, { method: 'DELETE' }),
  },

  sections: {
    getByCourse: (courseId) => fetchAPI(`/courses/${courseId}/sections`),
    create: (courseId, data) => fetchAPI(`/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
    update: (sectionId, data) => fetchAPI(`/sections/${sectionId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (sectionId) => fetchAPI(`/sections/${sectionId}`, { method: 'DELETE' }),
  },

  lessons: {
    getById: (lessonId) => fetchAPI(`/lessons/${lessonId}`),
    getBySection: (sectionId) => fetchAPI(`/sections/${sectionId}/lessons`),
    create: (sectionId, data) => fetchAPI(`/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    update: (lessonId, data) => fetchAPI(`/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (lessonId) => fetchAPI(`/lessons/${lessonId}`, { method: 'DELETE' }),
  },

  reviews: {
    getByCourse: (courseId, page = 1) => fetchAPI(`/reviews/course/${courseId}?page=${page}`),
    create: (data) => fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/reviews/${id}`, { method: 'DELETE' }),
    like: (id) => fetchAPI(`/reviews/${id}/like`, { method: 'POST' }),
    approve: (id) => fetchAPI(`/reviews/${id}/approve`, { method: 'PUT' }),
    pin: (id) => fetchAPI(`/reviews/${id}/pin`, { method: 'POST' }),
    markOfficial: (id) => fetchAPI(`/reviews/${id}/official`, { method: 'POST' }),
  },

  lessonComments: {
    getByLesson: (lessonId, page = 1) => fetchAPI(`/lesson-comments/lesson/${lessonId}?page=${page}`),
    create: (data) => fetchAPI('/lesson-comments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/lesson-comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/lesson-comments/${id}`, { method: 'DELETE' }),
    like: (id) => fetchAPI(`/lesson-comments/${id}/like`, { method: 'POST' }),
    approve: (id) => fetchAPI(`/lesson-comments/${id}/approve`, { method: 'PUT' }),
  },

  orders: {
    getMyOrders: () => fetchAPI('/orders/my'),
    getOrderById: (id) => fetchAPI(`/orders/${id}`),
    enroll: (courseId) => fetchAPI('/orders/enroll', { method: 'POST', body: JSON.stringify({ courseId }) }),
  },

  payment: {
    createCheckoutSession: (data) => fetchAPI('/payment/create-checkout-session', { method: 'POST', body: JSON.stringify(data) }),
    verifySession: (sessionId) => fetchAPI(`/payment/verify-session?session_id=${sessionId}`),
  },

  tickets: {
    getMyTickets: () => fetchAPI('/tickets'),
    getTicketById: (id) => fetchAPI(`/tickets/${id}`),
    create: (data) => fetchAPI('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    addMessage: (id, message) => fetchAPI(`/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
    updateStatus: (id, status) => fetchAPI(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  reports: {
    create: (data) => fetchAPI('/reports', { method: 'POST', body: JSON.stringify(data) }),
  },

  contact: {
    submit: (data) => fetchAPI('/contact', { method: 'POST', body: JSON.stringify(data) }),
  },

  upload: {
    courseCover: (courseId, file) => {
      const formData = new FormData();
      formData.append('cover', file);
      return fetchAPI(`/upload/courses/${courseId}/cover`, { method: 'POST', body: formData, headers: {} });
    },
    lessonVideo: (lessonId, file) => {
      const formData = new FormData();
      formData.append('video', file);
      return fetchAPI(`/upload/lessons/${lessonId}/video`, { method: 'POST', body: formData, headers: {} });
    },
  },

  stats: {
    getSiteStats: () => fetchAPI('/stats/site'),
  },
};