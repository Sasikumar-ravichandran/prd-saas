import api from './api';

export const payrollService = {
  getPayrollReport: async (params) => {
    // params = { mode: 'monthly', month: 1, year: 2026 } OR { mode: 'custom', startDate: '...', endDate: '...' }
    const response = await api.get('/payroll', { params });
    return response.data;
  }
};