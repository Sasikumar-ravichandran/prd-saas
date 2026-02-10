import api from './api';

export const appointmentService = {
  // 1. Get all appointments for the calendar
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // 2. Create a new appointment
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // 3. Update an appointment (Reschedule/Edit)
  update: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  // 4. Delete appointment (Optional, good to have)
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};