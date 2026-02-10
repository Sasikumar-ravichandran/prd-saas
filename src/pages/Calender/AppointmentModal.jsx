import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Stack, Autocomplete, Typography, IconButton, Box, InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useColorMode } from '../../context/ThemeContext';
const PROCEDURES = ['General Checkup', 'Root Canal', 'Cleaning', 'Extraction', 'Consultation', 'Whitening'];

export default function AppointmentModal({ open, onClose, initialData, resources, doctors, patients, onSave }) {

  // --- DEBUGGING: Check if data is arriving ---
  // console.log("Doctors Data:", doctors); 
  // console.log("Patients Data:", patients);
  const { primaryColor } = useColorMode();

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

  // 1. LOAD DATA
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        patientId: initialData.patientId || null,
        phone: initialData.phone || '',
        docId: initialData.docId || '',
        docName: initialData.doc || '',
        type: initialData.type || PROCEDURES[0],
        date: initialData.start || new Date(),
        startTime: initialData.start || new Date(),
        endTime: initialData.end || new Date(),
        resourceId: initialData.resourceId || 1
      });
    }
  }, [initialData, open]);

  // 2. HANDLERS
  const handlePatientChange = (event, newValue) => {
    if (newValue) {
      // console.log("Selected Patient:", newValue); // Debugging
      setFormData(prev => ({
        ...prev,
        title: newValue.fullName, // Matches your API
        patientId: newValue._id,  // Matches your API
        phone: newValue.mobile || '' // Matches your API
      }));
    } else {
      setFormData(prev => ({ ...prev, title: '', patientId: null, phone: '' }));
    }
  };

  const handleDoctorChange = (e) => {
    const selectedDocId = e.target.value;
    const selectedDoc = doctors.find(d => d._id === selectedDocId);

    // console.log("Selected Doctor ID:", selectedDocId); // Debugging

    setFormData(prev => ({
      ...prev,
      docId: selectedDocId,
      // Handle case where User model might use 'fullName' OR 'name'
      docName: selectedDoc ? (selectedDoc.name || selectedDoc.fullName) : 'Unknown'
    }));
  };

  const handleSubmit = () => {
    // console.log("Submitting Form Data:", formData); // Debugging
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: '650px', maxWidth: '100%', borderRadius: 3 } }}
    >

      {/* HEADER */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', py: 2, px: 3 }}>
        {/* FIX: Add component="span" */}
        <Typography variant="h6" component="span" fontWeight="700" color="#1e293b">
          {initialData?.id ? 'Edit Appointment' : 'New Appointment'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>

            {/* --- ROW 1: PATIENT & PHONE --- */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ width: 180 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>PATIENT</Typography>
                <Autocomplete
                  options={patients || []}
                  // FIX: Ensure this matches API key (fullName)
                  getOptionLabel={(option) => option.fullName || ''}
                  value={patients?.find(p => p._id === formData.patientId) || null}
                  onChange={handlePatientChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select..."
                      fullWidth
                      size="small"
                      // Visual cue if list is empty
                      helperText={(!patients || patients.length === 0) ? "No patients found" : ""}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>CONTACT NO.</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.phone}
                  disabled
                  placeholder="---"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color={formData.phone ? "primary" : "disabled"} /></InputAdornment>,
                  }}
                  sx={{ bgcolor: '#f8fafc', '& .MuiInputBase-input': { color: '#334155', fontWeight: 500 } }}
                />
              </Box>
            </Box>

            {/* --- ROW 2: DOCTOR & CHAIR --- */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ width: 180 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>ASSIGN DOCTOR</Typography>
                <TextField
                  select
                  value={formData.docId}
                  onChange={handleDoctorChange}
                  fullWidth
                  size="small"
                  placeholder="Select"
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Select Doctor
                  </MenuItem>

                  {/* DOCTOR LOGIC FIX */}
                  {doctors && doctors.length > 0 ? (
                    doctors.map(doc => (
                      <MenuItem key={doc._id} value={doc._id}>
                        {/* Try 'name', fallback to 'fullName' */}
                        {doc.name || doc.fullName || "Unnamed Doctor"}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>No Doctors Created</em>
                    </MenuItem>
                  )}
                </TextField>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>DENTAL CHAIR</Typography>
                <TextField
                  select
                  value={formData.resourceId}
                  onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EventSeatIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment>,
                  }}
                >
                  {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
                </TextField>
              </Box>
            </Box>

            {/* --- ROW 3: PROCEDURE --- */}
            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>PROCEDURE TYPE</Typography>
              <TextField
                select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MedicalServicesIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment>,
                }}
              >
                {PROCEDURES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Box>

            {/* --- ROW 4: DATE & TIME --- */}
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" fontWeight="bold" color="#3b82f6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" /> SCHEDULE
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    value={formData.date}
                    onChange={(val) => setFormData({ ...formData, date: val })}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                  />
                </Box>

                <Box sx={{ width: 140 }}>
                  <TimePicker
                    label="Start"
                    value={formData.startTime}
                    onChange={(val) => setFormData({ ...formData, startTime: val })}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                    minutesStep={15}
                    ampm={false}
                  />
                </Box>
                <Box sx={{ width: 140 }}>
                  <TimePicker
                    label="End"
                    value={formData.endTime}
                    onChange={(val) => setFormData({ ...formData, endTime: val })}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                    minutesStep={15}
                    ampm={false}
                  />
                </Box>
              </Box>
            </Box>

          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f1f5f9', bgcolor: '#fff' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: '600', color: '#64748b' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          // Button is disabled if PatientId OR DocId is missing
          disabled={!formData.patientId || !formData.docId}
          sx={{ fontWeight: 'bold', px: 4, bgcolor: primaryColor, borderRadius: 1.5 }}
        >
          {initialData?.id ? 'Update Schedule' : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}