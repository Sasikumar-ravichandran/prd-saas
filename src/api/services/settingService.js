import api from './api';

export const settingService = {
  // Get all role permissions
  getRoles: async () => {
    const response = await api.get('/settings/roles');
    return response.data;
  },

  // Update a single role's permissions
  updateRole: async (roleId, permissions) => {
    const response = await api.put('/settings/roles', { roleId, permissions });
    return response.data;
  },

  getClinic: async () => {
    const response = await api.get('/settings/clinic');
    return response.data;
  },

  updateClinic: async (data) => {
    const response = await api.put('/settings/clinic', data);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    // We assume a route exists for file uploads. 
    // If you don't have a file server set up, we will mock this or 
    // simply convert to Base64 (simplest for now).
    
    // METHOD A: Real Upload (Requires Multer on Backend)
    // const response = await api.post('/settings/upload-logo', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return response.data.url;

    // METHOD B: Base64 (Easiest for MVP)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
};