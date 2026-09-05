import axios from 'axios';
export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR (Attaches Token & Branch ID)
api.interceptors.request.use((config) => {
  
  // A. Handle User Token (Fallback for older sessions/mobile)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }

  // B. Handle Active Branch
  const activeBranchId = localStorage.getItem('activeBranchId');
  if (activeBranchId) {
    config.headers['x-branch-id'] = activeBranchId;
  }

  // C. Handle CSRF Defense (Blocks external HTML form submissions)
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

  return config;
});

// 2. RESPONSE INTERCEPTOR (Handles Token Expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      // FIXED: Check if this error came from the login route
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      // Only redirect and wipe data if it is NOT a login attempt
      if (!isLoginRequest) {
        // Token expired or invalid during normal app usage
        localStorage.removeItem('user');
        localStorage.removeItem('activeBranchId'); // Clear branch on logout
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;