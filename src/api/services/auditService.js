import api from './api';

export const auditService = {
  getLogs: async () => {
    const response = await api.get('/audit-logs');
    return response.data;
  }
};