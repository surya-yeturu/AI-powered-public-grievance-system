import axios from 'axios';

// In development, use relative /api so Vite proxy forwards to backend (avoids CORS).
// In production, use VITE_API_URL or full backend URL.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return '/api'; // Vite proxy in vite.config.js -> localhost:5000
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me')
};

// Complaint API calls
export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getMyComplaints: () => api.get('/complaints/my'),
  getDepartmentComplaints: (params) => api.get('/complaints/department', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  getStats: () => api.get('/complaints/stats')
};

export default api;
