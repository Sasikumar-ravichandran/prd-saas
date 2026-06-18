import api from './api'; // Assuming this is your configured Axios instance

export const inventoryService = {
  // 1. Get all inventory items for the active branch
  getAll: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  // 2. Add a new item or restock an existing one
  add: async (inventoryData) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  // 3. Consume stock (used when materials are used for a treatment)
  consume: async (id, data) => {
    // data should be { quantity: Number, reason: String }
    const response = await api.post(`/inventory/${id}/consume`, data);
    return response.data;
  },

  // 4. Get low stock alerts (Used on the Admin Dashboard)
  getLowStockAlerts: async () => {
    const response = await api.get('/inventory/alerts');
    return response.data;
  },

  // 5. Update an inventory item's details (name, threshold, cost, etc.)
  update: async (id, updates) => {
    const response = await api.put(`/inventory/${id}`, updates);
    return response.data;
  },

  // 6. Delete an inventory item completely
  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};