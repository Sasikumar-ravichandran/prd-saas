import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, MenuItem, Stack, Autocomplete, Grid, Typography, IconButton, Box, InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Mock Data
const PATIENTS = [
  { label: 'Ravi Kumar', id: 'P-1024' },
  { label: 'Anita Raj', id: 'P-1025' },
  { label: 'Suresh B', id: 'P-1026' },
  { label: 'New Patient...', id: 'new' }
];

const PROCEDURES = ['General Checkup', 'Root Canal', 'Cleaning', 'Extraction', 'Consultation'];

export default function AppointmentModal({ open, onClose, initialData, resources, onSave }) {
  // 1. SET DEFAULT PROCEDURE (PROCEDURES[0])
  const [formData, setFormData] = useState({
    patient: null, 
    type: PROCEDURES[0], // <--- Default Selected
    date: new Date(), 
    startTime: new Date(), 
    endTime: new Date(), 
    resourceId: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient: initialData.title ? { label: initialData.title } : null,
        type: initialData.type || PROCEDURES[0], // <--- Default if editing empty event
        date: initialData.start || new Date(),
        startTime: initialData.start || new Date(),
        endTime: initialData.end || new Date(),
        resourceId: initialData.resourceId || 1
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    const finalStart = new Date(formData.date);
    finalStart.setHours(formData.startTime.getHours(), formData.startTime.getMinutes());
    const finalEnd = new Date(formData.date);
    finalEnd.setHours(formData.endTime.getHours(), formData.endTime.getMinutes());

    onSave({
      patient: formData.patient,
      title: formData.patient?.label || 'Unknown',
      type: formData.type,
      start: finalStart,
      end: finalEnd,
      resourceId: formData.resourceId
    });
    onClose();
  };

  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        PaperProps={{ sx: { width: '600px', maxWidth: '100%', borderRadius: 3 } }}
    >
      
      {/* HEADER */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', py: 2, px: 3 }}>
        <Typography variant="h6" fontWeight="700" color="#1e293b">
            {initialData?.title ? 'Edit Appointment' : 'New Appointment'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3} sx={{ mt: 1 }}>
                
                {/* PATIENT SECTION */}
                <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>PATIENT</Typography>
                    <Autocomplete
                        options={PATIENTS}
                        value={formData.patient}
                        onChange={(e, val) => setFormData({ ...formData, patient: val })}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                placeholder="Search Name or ID..." 
                                fullWidth 
                                InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment> }}
                            />
                        )}
                    />
                </Box>

                {/* CLINICAL DETAILS (Modified Ratio) */}
                <Grid container spacing={2}>
                    {/* 2. PROCEDURE - WIDER (xs=8) */}
                    <Grid item xs={8}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>PROCEDURE</Typography>
                        <TextField
                            select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            fullWidth
                            size="small"
                        >
                            {PROCEDURES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </TextField>
                    </Grid>

                    {/* DOCTOR - NARROWER (xs=4) */}
                    <Grid item xs={4}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>DOCTOR</Typography>
                        <TextField
                            select
                            value={formData.resourceId}
                            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                            fullWidth
                            size="small"
                        >
                            {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.title} ({r.capacity})</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>

                {/* SCHEDULING (Grey Box) */}
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" fontWeight="bold" color="#3b82f6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" /> DATE & TIME
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                             <DatePicker
                                value={formData.date}
                                onChange={(val) => setFormData({ ...formData, date: val })}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                            />
                        </Grid>
                        
                        <Grid item xs={6}>
                             <TimePicker
                                label="Start"
                                value={formData.startTime}
                                onChange={(val) => setFormData({ ...formData, startTime: val })}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                                minutesStep={15}
                            />
                        </Grid>
                        <Grid item xs={6}>
                             <TimePicker
                                label="End"
                                value={formData.endTime}
                                onChange={(val) => setFormData({ ...formData, endTime: val })}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ bgcolor: 'white' }} />}
                                minutesStep={15}
                            />
                        </Grid>
                    </Grid>
                </Box>

            </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f1f5f9', bgcolor: '#fff' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: '600', color: '#64748b' }}>Cancel</Button>
        <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={!formData.patient}
            sx={{ fontWeight: 'bold', px: 4, bgcolor: '#0f172a', borderRadius: 1.5 }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}