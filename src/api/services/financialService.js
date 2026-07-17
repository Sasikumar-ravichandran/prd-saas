// api/services/financialService.js
import api from './api';

export const financialService = {
  // Fetches the combined Income + Expense ledger
  getLedger: async (params) => {
    const response = await api.get('/financials/ledger', { params });
    return response.data;
  },
};