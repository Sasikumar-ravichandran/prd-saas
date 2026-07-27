import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogActions, Button, TextField, Grid, Typography, Box,
  IconButton, Autocomplete, Chip, useTheme, useMediaQuery, InputAdornment,
  Divider, Stack, RadioGroup, FormControlLabel, Radio, MenuItem, DialogTitle, CircularProgress
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/PersonOutline';
import SaveIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'; // Icon for ID
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

import { patientService } from '../../api/services/patientService';
import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';

const DENTAL_CONCERNS = ['Tooth Pain', 'Cleaning', 'Braces', 'Implant', 'Cosmetic', 'General Checkup', 'Sensitivity'];
const MEDICAL_CONDITIONS = ['None', 'Diabetes', 'BP (High/Low)', 'Heart Issue', 'Pregnancy', 'Asthma', 'Thyroid', 'Epilepsy'];
const REFERRAL_SOURCES = ['Google', 'Friend/Family', 'Walk-in', 'Instagram'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

const QuickChip = ({ label, selected, onClick, disabled }) => (
  <Chip
    label={label}
    onClick={!disabled ? onClick : undefined}
    variant={selected ? "filled" : "outlined"}
    color={selected ? "primary" : "default"}
    disabled={disabled && !selected}
    sx={{ mr: 1, mb: 1, borderRadius: '8px', border: selected ? 'none' : '1px solid #ddd', opacity: disabled && !selected ? 0.5 : 1 }}
  />
);

const PainButton = ({ level, currentLevel, onChange, disabled }) => {
  const isSelected = currentLevel === level;
  let color = level > 6 ? '#ef5350' : '#42a5f5';
  return (
    <Box
      onClick={() => !disabled && onChange(level)}
      sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: isSelected ? color : 'transparent',
        border: `1px solid ${isSelected ? color : '#ddd'}`,
        color: isSelected ? 'white' : '#666',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        fontWeight: 'bold', fontSize: '0.85rem',
        opacity: disabled && !isSelected ? 0.3 : 1
      }}
    >
      {level}
    </Box>
  );
};

const UploadButton = ({ label, icon, disabled }) => (
  <Button
    variant="outlined" component="label" startIcon={icon} fullWidth
    disabled={disabled}
    sx={{ borderStyle: 'dashed', height: 50, color: 'text.secondary', borderColor: '#ccc', justifyContent: 'flex-start' }}
  >
    {label} <input type="file" hidden multiple disabled={disabled} />
  </Button>
);

export default function AddPatientModal({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isEditing, setIsEditing] = useState(false);

  const [doctorList, setDoctorList] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const [showAiConsent, setShowAiConsent] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // ADDED patientId to defaultValues
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      patientId: '', // Custom ID field
      fullName: '', age: '', gender: 'Male', mobile: '', bloodGroup: '',
      emergencyContact: '', emergencyRelation: '', assignedDoctor: '',
      primaryConcern: null, painLevel: 0, medicalConditions: [],
      referredBy: '', communication: 'WhatsApp', notes: ''
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if they have already consented in the past
    const hasConsented = localStorage.getItem('clinic_ai_consent');

    if (!hasConsented) {
      // Pause the upload and show the terms
      setPendingFile(file);
      setShowAiConsent(true);
      event.target.value = null; // Reset input
    } else {
      // Already consented, proceed directly to upload
      executeAiScan(file);
      event.target.value = null;
    }
  };

  // 2. The actual scanning logic (separated from the input event)
  const executeAiScan = async (fileToScan) => {
    const formData = new FormData();
    formData.append('formImage', fileToScan);

    try {
      setIsScanning(true);
      showToast('Scanning form with AI... This takes a few seconds.', 'info');

      const res = await api.post('/patients/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.data) {
        const extracted = res.data.data;
        Object.keys(extracted).forEach(key => {
          if (extracted[key]) {
            setValue(key, extracted[key], { shouldValidate: true, shouldDirty: true });
          }
        });
        showToast('Form data extracted successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to read the form. Please check the image quality.', 'error');
    } finally {
      setIsScanning(false);
      setPendingFile(null);
    }
  };

  // 3. Handle the "I Agree" button click
  const handleAcceptTerms = () => {
    localStorage.setItem('clinic_ai_consent', 'true');
    setShowAiConsent(false);
    if (pendingFile) {
      executeAiScan(pendingFile);
    }
  };

  // 1. FETCH DOCTORS
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/users');
        const docs = res.data.filter(u => u.role === 'Doctor' || u.role === 'doctor');
        setDoctorList(docs);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };

    if (open) {
      fetchDoctors();
    }
  }, [open]);

  // 2. RESET FORM
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
        setIsEditing(false);
      } else {
        reset({
          patientId: '', // Reset custom ID
          fullName: '', age: '', gender: 'Male', mobile: '', bloodGroup: '',
          emergencyContact: '', emergencyRelation: '', assignedDoctor: '',
          primaryConcern: null, painLevel: 0, medicalConditions: [],
          referredBy: '', communication: 'WhatsApp', notes: ''
        });
        setIsEditing(true);
      }
    }
  }, [open, initialData, reset]);

  const currentGender = watch('gender');
  const currentReferral = watch('referredBy');
  const currentPain = watch('painLevel');
  const { showToast } = useToast();

  const handleFormSubmit = async (data) => {
    try {
      if (initialData) {
        // Edit Mode
        await patientService.update(initialData._id, data);
        showToast('Patient updated successfully', 'success');
      } else {
        // Create Mode
        await patientService.create(data);
        showToast('Patient registered successfully', 'success');
      }

      if (onSubmit) onSubmit();
      onClose();
    } catch (error) {
      console.error("Save Error:", error);

      const isDuplicate = error.response?.data?.errorResponse?.code === 11000
        || error.response?.data?.code === 11000
        || (error.response?.data?.message && error.response.data.message.includes('duplicate'));

      if (isDuplicate) {
        showToast('Error: This Patient ID is already in use.', 'error');
      } else {
        const msg = error.response?.data?.message || 'Error saving patient';
        showToast(msg, 'error');
      }
    }
  };


  return (
    <Dialog
      open={open} onClose={onClose}
      fullScreen={isMobile} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, height: isMobile ? '100%' : '90vh', maxHeight: 900 } }}
    >
      {/* HEADER */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isEditing ? 'white' : '#f9fafb' }}>
        <Box>
          <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1 }}>
            {initialData ? (isEditing ? 'Edit Patient Details' : 'Patient Profile') : 'New Patient Registration'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {initialData ? `ID: ${initialData.patientId || 'PID-000'}` : 'Create New ID'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* {!initialData && isEditing && (
            <Button
              variant="contained"
              component="label"
              disabled={isScanning}
              startIcon={isScanning ? <CircularProgress size={16} color="inherit" /> : <DocumentScannerIcon />}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, fontWeight: 'bold', borderRadius: 2 }}
            >
              {isScanning ? 'Scanning...' : 'Auto-Fill from Form'}
              <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
            </Button>
          )} */}
          {initialData && !isEditing && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Edit Details
            </Button>
          )}
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f5f5f5' }}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* FORM BODY */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%' }}>
        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'contents' }}>

          {/* === LEFT PANEL === */}
          <Box sx={{ flex: 1.1, p: 4, overflowY: 'auto' }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold">PATIENT IDENTITY</Typography>
            <Stack spacing={2.5} sx={{ mt: 1 }}>

              {/* ⚡️ CUSTOM PATIENT ID FIELD */}
              <TextField
                fullWidth
                placeholder="Physical File ID (Optional)"
                // We only allow editing the ID if it's a completely new patient.
                // You shouldn't be able to edit an existing patient's ID.
                disabled={!isEditing || !!initialData}
                {...register("patientId")}
                helperText={!initialData ? "Leave blank to auto-generate (e.g. PID-1001)" : ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon color="action" fontSize="small" /></InputAdornment>,
                  sx: { bgcolor: (!isEditing || !!initialData) ? '#f5f5f5' : 'white' }
                }}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />

              <TextField
                fullWidth placeholder="Full Name" disabled={!isEditing}
                {...register("fullName", { required: "Name is required" })}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                  sx: { fontSize: '1.1rem', fontWeight: 500, bgcolor: !isEditing ? '#f5f5f5' : 'white' }
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth placeholder="Mobile" disabled={!isEditing}
                    {...register("mobile", { required: "Mobile is required" })}
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                    InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment>, sx: { bgcolor: !isEditing ? '#f5f5f5' : 'white' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth placeholder="Age" type="number" disabled={!isEditing}
                    {...register("age")}
                    InputProps={{ sx: { bgcolor: !isEditing ? '#f5f5f5' : 'white' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Controller
                    name="bloodGroup"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Blood Group"
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><WaterDropIcon sx={{ fontSize: 16, color: '#ef5350' }} /></InputAdornment>,
                          sx: { bgcolor: !isEditing ? '#f5f5f5' : 'white' }
                        }}
                      >
                        {BLOOD_GROUPS.map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" display="block" mb={0.5} color="text.secondary">GENDER</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <QuickChip
                      key={g} label={g} selected={currentGender === g} disabled={!isEditing}
                      onClick={() => setValue('gender', g)}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#fff5f5', p: 2, borderRadius: 2, border: '1px solid #ffebee', opacity: !isEditing ? 0.7 : 1 }}>
                <Typography variant="caption" fontWeight="bold" color="error" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BadgeIcon sx={{ fontSize: 14, mr: 0.5 }} /> EMERGENCY CONTACT
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <TextField fullWidth size="small" placeholder="Name" disabled={!isEditing} sx={{ bgcolor: 'white' }} {...register("emergencyContact")} />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField fullWidth size="small" placeholder="Relation" disabled={!isEditing} sx={{ bgcolor: 'white' }} {...register("emergencyRelation")} />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              {/* DYNAMIC DOCTOR DROPDOWN */}
              <TextField
                select
                fullWidth
                label="Assign Doctor"
                disabled={!isEditing}
                defaultValue=""
                {...register("assignedDoctor", { required: "Assigning a doctor is required" })}
                error={!!errors.assignedDoctor}
                helperText={errors.assignedDoctor?.message}
                InputProps={{ sx: { bgcolor: !isEditing ? '#f5f5f5' : 'white' } }}
              >
                {doctorList && doctorList.length > 0 ? (
                  doctorList.map(doc => (
                    <MenuItem key={doc._id} value={doc.fullName}>
                      {doc.fullName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    <em>No Doctor Available</em>
                  </MenuItem>
                )}
              </TextField>

              <Box>
                <Typography variant="caption" display="block" mb={0.5} color="text.secondary">REFERRAL SOURCE</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {REFERRAL_SOURCES.map(r => (
                    <QuickChip key={r} label={r} selected={currentReferral === r} disabled={!isEditing} onClick={() => setValue('referredBy', r)} />
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* === RIGHT PANEL === */}
          <Box sx={{ flex: 1, bgcolor: '#f8fafc', p: 4, borderLeft: isMobile ? 'none' : '1px solid #eee', overflowY: 'auto' }}>
            <Typography variant="overline" color="primary" fontWeight="bold">CLINICAL</Typography>
            <Stack spacing={3} sx={{ mt: 1 }}>

              <Controller
                name="primaryConcern"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field} disabled={!isEditing}
                    options={DENTAL_CONCERNS}
                    value={field.value || null}
                    freeSolo
                    onChange={(_, data) => field.onChange(data)}
                    renderInput={(params) => <TextField {...params} label="Primary Complaint" sx={{ bgcolor: 'white' }} />}
                  />
                )}
              />

              {/* <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #e0e0e0', opacity: !isEditing ? 0.7 : 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>PAIN SCALE (0 - 10)</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {[0, 2, 4, 6, 8, 10].map(level => (
                    <PainButton
                      key={level} level={level} currentLevel={currentPain} disabled={!isEditing}
                      onChange={(val) => setValue('painLevel', val)}
                    />
                  ))}
                </Box>
              </Box> */}

              <Controller
                name="medicalConditions"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field} multiple disabled={!isEditing} options={MEDICAL_CONDITIONS}
                    value={field.value || []}
                    onChange={(_, data) => field.onChange(data)}
                    freeSolo
                    renderInput={(params) => <TextField {...params} label="Medical Alerts" sx={{ bgcolor: 'white' }} />}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip size="small" label={option} {...getTagProps({ index })} color="error" variant="soft" />)
                    }
                  />
                )}
              />

              <Box>
                <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>ATTACHMENTS</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><UploadButton label="Photo" icon={<CameraAltIcon />} disabled={!isEditing} /></Grid>
                  <Grid item xs={6}><UploadButton label="X-Ray" icon={<InsertDriveFileIcon />} disabled={!isEditing} /></Grid>
                </Grid>
              </Box>

              <TextField
                fullWidth multiline rows={2} label="Chief Notes" disabled={!isEditing}
                sx={{ bgcolor: 'white' }} {...register("notes")}
              />

              <Controller
                name="communication"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel disabled={!isEditing} value="WhatsApp" control={<Radio size="small" />} label={<Box sx={{ display: 'flex', alignItems: 'center' }}><WhatsAppIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} /> WhatsApp</Box>} />
                    <FormControlLabel disabled={!isEditing} value="SMS" control={<Radio size="small" />} label="SMS" />
                  </RadioGroup>
                )}
              />
            </Stack>
          </Box>

        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} color="inherit" size="large" sx={{ mr: 1, color: '#666' }}>Cancel</Button>

        {isEditing && (
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            variant="contained" size="large" disableElevation startIcon={<SaveIcon />}
            sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
          >
            {initialData ? 'Save' : 'Register Patient'}
          </Button>
        )}
      </DialogActions>
      {/* ================= AI CONSENT DIALOG ================= */}
      <Dialog open={showAiConsent} onClose={() => setShowAiConsent(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '800', color: '#0f172a' }}>
          <DocumentScannerIcon color="primary" /> AI Document Scanner
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#334155' }}>
            To magically extract text from physical forms, ClinicOS utilizes <strong>Google Gemini AI Vision</strong>. Before using this feature, please review the following terms:
          </Typography>

          <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
              1. Usage Limits
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your clinic is currently on the Free AI Tier, which allows up to <strong>1,500 document scans per day</strong>. Exceeding this limit will temporarily disable the scanner until midnight.
            </Typography>

            <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
              2. Data Privacy & Processing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Images uploaded via this tool are sent securely to Google's API for processing. The images are analyzed in real-time and are <strong>not</strong> retained or used by Google to train public models. However, please ensure no highly sensitive government IDs are scanned unless necessary.
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            By clicking "I Agree", you consent to these terms on behalf of your clinic.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAiConsent(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAcceptTerms}
            sx={{ bgcolor: '#6366f1', fontWeight: 'bold' }}
          >
            I Agree & Scan Document
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}