import api from './api'; // Import your configured axios instance

// Base URL for this service
const PATH = '/patients';

export const patientService = {
  // 1. GET ALL PATIENTS
  getAll: async () => {
    const response = await api.get(PATH);
    return response.data; // Returns the array of patients
  },

  // 2. GET SINGLE PATIENT
  getById: async (id) => {
    const response = await api.get(`${PATH}/${id}`);
    return response.data;
  },

  // 3. CREATE NEW PATIENT
  create: async (data) => {
    // Ensure numbers are numbers before sending
    const payload = {
      ...data,
      age: Number(data.age),
      painLevel: Number(data.painLevel),
    };
    const response = await api.post(PATH, payload);
    return response.data;
  },

  // 4. UPDATE PATIENT
  update: async (id, data) => {
    const response = await api.put(`${PATH}/${id}`, data);
    return response.data;
  },

  // 5. DELETE PATIENT
  delete: async (id) => {
    const response = await api.delete(`${PATH}/${id}`);
    return response.data;
  },

  addTreatment: async (id, treatmentData) => {
    const response = await api.post(`/patients/${id}/treatments`, treatmentData);
    return response.data; // Returns updated Patient object
  },

  // 2. START ALL PROPOSED (Approve)
  startAllTreatments: async (id) => {
    const response = await api.post(`/patients/${id}/treatments/start`);
    return response.data.patient;
  },

  // 3. DELETE TREATMENT (New)
  deleteTreatment: async (patientId, treatmentId) => {
    // We assume a DELETE route: /api/patients/:id/treatments/:itemId
    const response = await api.delete(`/patients/${patientId}/treatments/${treatmentId}`);
    return response.data;
  },

  // 4. UPDATE STATUS (Used for Revert)
  updateTreatmentStatus: async (patientId, treatmentId, status) => {
    const response = await api.patch(`/patients/${patientId}/treatments/${treatmentId}`, { status });
    return response.data;
  },

  getLedger: async (patientId) => {
    // NOTE: Ensure you pass the Mongo _id here, not PID-1001, 
    // unless you updated the backend to handle PID in getPatientLedger
    const response = await api.get(`/payments/ledger/${patientId}`);
    return response.data;
  },

  // Record a payment
  addPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  uploadAttachment: async (patientId, formData) => {
    // Note: Content-Type header is usually auto-set by axios for FormData, 
    // but setting it explicitly is safer.
    const response = await api.post(`/patients/${patientId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete Attachment
  deleteAttachment: async (patientId, fileUrl) => {
    // Axios DELETE requires 'data' property for body content
    const response = await api.delete(`/patients/${patientId}/files`, {
      data: { fileUrl }
    });
    return response.data;
  }
};