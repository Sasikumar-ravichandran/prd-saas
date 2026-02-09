import api from './api';

export const procedureService = {
  getAll: async () => {
    const response = await api.get('/procedures');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/procedures', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/procedures/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/procedures/${id}`);
    return response.data;
  }
};