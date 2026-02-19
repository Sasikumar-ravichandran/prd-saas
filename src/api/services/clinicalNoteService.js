import api from './api'; // Your axios instance

export const clinicalNoteService = {
  // 1. Get Timeline (All notes for a patient)
  getNotesByPatient: async (patientId) => {
    const response = await api.get(`/clinical-notes/${patientId}`);
    return response.data;
  },

  // 2. Add a New Note (Visit Summary)
  createNote: async (noteData) => {
    // noteData = { patientId, content, type, tags, visitDate }
    const response = await api.post('/clinical-notes', noteData);
    return response.data;
  },

  // 3. Update Medical Alerts (Allergies & Conditions)
  updateAlerts: async (patientId, alertsData) => {
    // alertsData = { medicalConditions: [], allergies: "" }
    const response = await api.put(`/clinical-notes/alerts/${patientId}`, alertsData);
    return response.data;
  },

  // 4. Delete a Note (In case of mistake)
  deleteNote: async (noteId) => {
    const response = await api.delete(`/clinical-notes/${noteId}`);
    return response.data;
  }
};