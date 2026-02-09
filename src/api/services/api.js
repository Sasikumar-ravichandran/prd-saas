import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // timeout: 10000, // Good practice: Fail if request takes >10s
});

// --- Request Interceptor (You already have this) ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor (ADD THIS) ---
api.interceptors.response.use(
  (response) => response, // Return success responses directly
  (error) => {
    // 1. Log the error for debugging
    console.error("API Error:", error.response?.data?.message || error.message);

    // 2. Handle 401 (Unauthorized) - Token Expired
    if (error.response && error.response.status === 401) {
       // Optional: Force logout if token is invalid
       // localStorage.removeItem('token');
       // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;