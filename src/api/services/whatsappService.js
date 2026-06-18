import api from './api';

export const whatsappService = {
  // Save the configuration
  saveConfig: async (configData) => {
    const response = await api.post('/settings/whatsapp', configData);
    return response.data;
  },

  // Test the Twilio connection
  testConnection: async (testPayload) => {
    const response = await api.post('/settings/whatsapp/test', testPayload);
    return response.data;
  }
};