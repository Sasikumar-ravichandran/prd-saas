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

  logout: () => {
    localStorage.removeItem('user');
  }
};