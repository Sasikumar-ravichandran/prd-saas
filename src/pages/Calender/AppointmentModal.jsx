import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Stack, Autocomplete, Typography, IconButton, Box, InputAdornment,
  DialogContentText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // New Icon for Alert
import { useColorMode } from '../../context/ThemeContext';

const PROCEDURES = ['General Checkup', 'Root Canal', 'Cleaning', 'Extraction', 'Consultation', 'Whitening'];

export default function AppointmentModal({ open, onClose, initialData, resources, doctors, patients, onSave, onDelete }) {

  console.log(initialData, '%%%%')

  const { primaryColor } = useColorMode();

  // --- 1. NEW STATE FOR DELETE CONFIRMATION ---
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    patientId: null,
    phone: '',
    docId: '',
    docName: '',
    type: PROCEDURES[0],
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    resourceId: 1
  });

  const selectedDoctor = doctors?.find(d => d._id === formData.docId);
  const doctorPhone = selectedDoctor?.mobile || '';

  useEffect(() => {
    if (initialData) {

      // 1. SMART DOCTOR MATCHING
      // Grab the ID and Name sent by the backend
      let matchedDocId = initialData.docId || '';
      const incomingDocName = initialData.docName || initialData.doc || '';

      // If the backend sent a blank ID ("") but gave us the name ("doctor 1"),
      // we search your 'doctors' array to find their true ID.
      if (!matchedDocId && incomingDocName && doctors && doctors.length > 0) {
        const foundDoc = doctors.find(d => d.fullName === incomingDocName);
        if (foundDoc) {
          matchedDocId = foundDoc._id; // We found the ID!
        }
      }

      // 2. SET FORM DATA
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        patientId: initialData.patientId || null,
        phone: initialData.phone || '',

        docId: matchedDocId, // ⚡️ Use our smartly matched ID
        docName: incomingDocName,

        type: initialData.type || PROCEDURES[0],
        date: initialData.date || initialData.start || new Date(),
        startTime: initialData.startTime || initialData.start || new Date(),
        endTime: initialData.endTime || initialData.end || new Date(),
        resourceId: initialData.resourceId || 1
      });
    }
  }, [initialData, open, doctors]);

  const handlePatientChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        title: newValue.fullName,
        patientId: newValue._id,
        phone: newValue.mobile || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, title: '', patientId: null, phone: '' }));
    }
  };

  const handleDoctorChange = (e) => {
    const selectedDocId = e.target.value;
    const selectedDoc = doctors.find(d => d._id === selectedDocId);
    setFormData(prev => ({
      ...prev,
      docId: selectedDocId,
      docName: selectedDoc ? (selectedDoc.fullName) : 'Unknown'
    }));
  };

  const handleSubmit = () => {
    const finalStart = new Date(formData.date);
    finalStart.setHours(formData.startTime.getHours(), formData.startTime.getMinutes());

    const finalEnd = new Date(formData.date);
    finalEnd.setHours(formData.endTime.getHours(), formData.endTime.getMinutes());

    onSave({
      id: formData.id,
      title: formData.title || 'Unknown Patient',
      patientId: formData.patientId,
      phone: formData.phone,
      docId: formData.docId,
      doc: formData.docName,
      type: formData.type,
      start: finalStart,
      end: finalEnd,
      resourceId: formData.resourceId,
      status: 'Scheduled'
    });
    onClose();
  };

  console.log(formData, '----------')

  // --- 2. UPDATED DELETE HANDLERS ---

  // Just opens the confirmation dialog
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  // Actually performs the delete
  const confirmDelete = () => {
    onDelete(formData.id);
    setDeleteConfirmOpen(false); // Close confirm
    onClose(); // Close main modal
  };

  return (
    <>
      {/* --- MAIN APPOINTMENT FORM DIALOG --- */}
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: '650px', maxWidth: '100%', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', py: 2, px: 3 }}>
          <Typography variant="h6" component="span" fontWeight="700" color="#1e293b">
            {initialData?.id ? 'Edit Appointment' : 'New Appointment'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>

              {/* ROW 1: PATIENT */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 180 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>PATIENT</Typography>
                  <Autocomplete
                    options={patients || []}
                    getOptionLabel={(option) => option.fullName || ''}
                    value={patients?.find(p => p._id === formData.patientId) || null}
                    onChange={handlePatientChange}
                    renderInput={(params) => <TextField {...params} placeholder="Select..." fullWidth size="small" />}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>PATIENT CONTACT</Typography>
                  <TextField
                    fullWidth size="small" value={formData.phone} disabled placeholder="---"
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }}
                    sx={{ bgcolor: '#f8fafc' }}
                  />
                </Box>
              </Box>

              {/* ROW 2: DOCTOR */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 180 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>ASSIGN DOCTOR</Typography>
                  <TextField select value={formData.docId} onChange={handleDoctorChange} fullWidth size="small">
                    {doctors && doctors.length > 0 ? (
                      doctors.map(doc => <MenuItem key={doc._id} value={doc._id}>{doc.fullName}</MenuItem>)
                    ) : <MenuItem disabled>No Doctors</MenuItem>}
                  </TextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>DOCTOR CONTACT</Typography>
                  <TextField
                    fullWidth size="small"
                    value={doctorPhone}
                    disabled
                    placeholder="---"
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }}
                    sx={{ bgcolor: '#f8fafc' }}
                  />
                </Box>
              </Box>

              {/* ROW 3: CHAIR & PROCEDURE */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>DENTAL CHAIR</Typography>
                  <TextField select value={formData.resourceId} onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start"><EventSeatIcon fontSize="small" /></InputAdornment> }}>
                    {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>PROCEDURE TYPE</Typography>
                  <TextField select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start"><MedicalServicesIcon fontSize="small" /></InputAdornment> }}>
                    {PROCEDURES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                </Box>
              </Box>

              {/* ROW 4: DATE & TIME */}
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" fontWeight="bold" color="#3b82f6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" /> SCHEDULE
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <DatePicker value={formData.date} onChange={(val) => setFormData({ ...formData, date: val })} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />} />
                  </Box>
                  <Box sx={{ width: 140 }}>
                    <TimePicker label="Start" value={formData.startTime} onChange={(val) => setFormData({ ...formData, startTime: val })} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />} minutesStep={15} ampm={false} />
                  </Box>
                  <Box sx={{ width: 140 }}>
                    <TimePicker label="End" value={formData.endTime} onChange={(val) => setFormData({ ...formData, endTime: val })} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />} minutesStep={15} ampm={false} />
                  </Box>
                </Box>
              </Box>

            </Stack>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f1f5f9', bgcolor: '#fff', justifyContent: 'space-between' }}>

          {/* DELETE BUTTON (Triggers confirmation) */}
          {initialData?.id ? (
            <Button
              onClick={handleDeleteClick}
              color="error"
              startIcon={<DeleteOutlineIcon />}
              sx={{ fontWeight: 'bold' }}
            >
              Cancel Appt
            </Button>
          ) : (
            <Box />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} color="inherit" sx={{ fontWeight: '600', color: '#64748b' }}>Close</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.patientId || !formData.docId}
              sx={{ fontWeight: 'bold', px: 4, bgcolor: primaryColor, borderRadius: 1.5 }}
            >
              {initialData?.id ? 'Update Schedule' : 'Book Now'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* --- 3. NESTED DELETE CONFIRMATION DIALOG --- */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { width: 400, borderRadius: 3, p: 1 } }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: '50%', bgcolor: '#fee2e2', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2
          }}>
            <WarningAmberIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight="800" gutterBottom>
            Cancel Appointment?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Are you sure you want to cancel this appointment for <b>{formData.title}</b>? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              variant="outlined"
              color="inherit"
              sx={{ fontWeight: 'bold', borderColor: '#e2e8f0', color: '#64748b' }}
            >
              No, Keep it
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              sx={{ fontWeight: 'bold', boxShadow: 'none' }}
            >
              Yes, Cancel It
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
}