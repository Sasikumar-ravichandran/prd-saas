import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    if (response.data.defaultBranch) {
      localStorage.setItem('activeBranchId', response.data.defaultBranch);
    }
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  requestOtp: async (email, purpose = 'PASSWORD_RESET') => {
    const response = await api.post('/auth/send-otp', { email, purpose });
    console.log(response,'@@@@@@@@@@@')
    return response.data;
  },

  verifyOtp: async (email, otp, purpose = 'PASSWORD_RESET') => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    // Your backend requires the OTP again during the final password reset step!
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  // UPDATED: Async logout to destroy the backend cookie
  logout: async () => {
    try {
      // 1. Tell the server to instantly expire the HttpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API failed, proceeding with local cleanup", error);
    } finally {
      // 2. Clear local storage so the UI updates
      localStorage.removeItem('user');
      localStorage.removeItem('activeBranchId');
    }
  }
};