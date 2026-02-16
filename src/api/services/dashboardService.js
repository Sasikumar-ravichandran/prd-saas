import api from './api'; // This is your axios instance (usually points to localhost:5000/api)

export const dashboardService = {
  getReceptionData: async () => {
    // This runs in the background. The user DOES NOT see this URL.
    const response = await api.get('/dashboard/reception'); 
    return response.data;
  },
  
  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}`, { status });
    return response.data;
  },

  getDoctorData: async () => {
    const response = await api.get('/dashboard/doctor');
    return response.data;
  },

  getAdminData: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};