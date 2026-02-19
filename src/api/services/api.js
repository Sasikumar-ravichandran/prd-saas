import axios from 'axios';
export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR (Attaches Token & Branch ID)
api.interceptors.request.use((config) => {
  // A. Handle User Token (Existing)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  // B. Handle Active Branch (NEW)
  // We check if the user has selected a specific branch to work in
  const activeBranchId = localStorage.getItem('activeBranchId');

  if (activeBranchId) {
    // We send this custom header so the Backend knows which data to return
    config.headers['x-branch-id'] = activeBranchId;
  }

  return config;
});

// 2. RESPONSE INTERCEPTOR (Handles Token Expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      localStorage.removeItem('activeBranchId'); // Clear branch on logout
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;