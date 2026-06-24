import api from './api';

export const expenseService = {
  // Get all expenses
  getAll: async (params) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Create a new expense
  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update an existing expense
  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete an expense
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};