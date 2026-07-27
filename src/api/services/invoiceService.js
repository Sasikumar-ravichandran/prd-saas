import api from './api';

export const invoiceService = {
  // 1. Create a new invoice
  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  // 2. Get all invoices (for a Billing Dashboard)
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  // 3. Get a specific invoice (for generating a PDF view)
  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // 4. Pay an invoice
  pay: async (id, paymentData) => {
    // paymentData = { amount: 500, paymentMethod: 'UPI' }
    const response = await api.post(`/invoices/${id}/pay`, paymentData);
    return response.data;
  },

  // 5. Void an invoice (if a mistake was made)
  void: async (id) => {
    //  Notice it is a PUT request!
    const response = await api.put(`/invoices/${id}/void`);
    return response.data;
  }
};