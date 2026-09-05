import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Grid, TextField, InputAdornment, 
  Button, Stack, Divider, Tooltip, IconButton
} from '@mui/material';

// Icons
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'; // BP
import FavoriteIcon from '@mui/icons-material/Favorite'; // Heart Rate
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat'; // Temp
import BloodtypeIcon from '@mui/icons-material/Bloodtype'; // SpO2
import HeightIcon from '@mui/icons-material/Height'; // Height
import ScaleIcon from '@mui/icons-material/Scale'; // Weight
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Reusable Stat Card for View Mode
const VitalCard = ({ title, value, unit, icon, color }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" fontWeight="700" color="text.secondary" textTransform="uppercase">{title}</Typography>
      <Typography variant="h6" fontWeight="900" color="#0f172a" sx={{ lineHeight: 1.2 }}>
        {value ? value : '--'} <Typography component="span" variant="caption" fontWeight="600" color="text.secondary">{unit}</Typography>
      </Typography>
    </Box>
  </Paper>
);

export default function GeneralVitals({ initialStates, onAction }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize state from the flexible specialtyData object
  const [vitals, setVitals] = useState({
    bpSystolic: initialStates?.bpSystolic || '',
    bpDiastolic: initialStates?.bpDiastolic || '',
    heartRate: initialStates?.heartRate || '',
    temperature: initialStates?.temperature || '',
    spo2: initialStates?.spo2 || '',
    height: initialStates?.height || '',
    weight: initialStates?.weight || ''
  });

  // Sync if initialStates update from parent
  useEffect(() => {
    setVitals({
      bpSystolic: initialStates?.bpSystolic || '',
      bpDiastolic: initialStates?.bpDiastolic || '',
      heartRate: initialStates?.heartRate || '',
      temperature: initialStates?.temperature || '',
      spo2: initialStates?.spo2 || '',
      height: initialStates?.height || '',
      weight: initialStates?.weight || ''
    });
  }, [initialStates]);

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Loop through vitals and update the backend for any changed values
    Object.keys(vitals).forEach(key => {
      if (vitals[key] !== initialStates?.[key]) {
        // Calls the updateSpecialtyDataKey route via handleChartAction in PatientProfile
        onAction('update_vitals', key, vitals[key]);
      }
    });
    setIsEditing(false);
  };

  // Auto-calculate BMI
  const calculateBMI = () => {
    if (vitals.height && vitals.weight) {
      const heightM = Number(vitals.height) / 100;
      const weightKg = Number(vitals.weight);
      if (heightM > 0) return (weightKg / (heightM * heightM)).toFixed(1);
    }
    return '--';
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="800" color="#0f172a">Vitals & Assessment</Typography>
          <Typography variant="body2" color="text.secondary">Track standard patient measurements.</Typography>
        </Box>
        <Button 
          variant={isEditing ? "contained" : "outlined"} 
          color={isEditing ? "success" : "primary"}
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          sx={{ borderRadius: 2, fontWeight: 'bold' }}
        >
          {isEditing ? "Save Vitals" : "Update Vitals"}
        </Button>
      </Stack>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {!isEditing ? (
          /* VIEW MODE: Beautiful Stat Cards */
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="Blood Pressure" value={vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : null} unit="mmHg" icon={<MonitorHeartIcon />} color="#ef4444" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="Heart Rate" value={vitals.heartRate} unit="BPM" icon={<FavoriteIcon />} color="#f43f5e" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="Temperature" value={vitals.temperature} unit="°F" icon={<DeviceThermostatIcon />} color="#f59e0b" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="SpO2 (Oxygen)" value={vitals.spo2} unit="%" icon={<BloodtypeIcon />} color="#3b82f6" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="Height & Weight" value={vitals.height && vitals.weight ? `${vitals.height}cm / ${vitals.weight}kg` : null} unit="" icon={<HeightIcon />} color="#8b5cf6" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <VitalCard title="BMI" value={calculateBMI()} unit="kg/m²" icon={<ScaleIcon />} color="#10b981" />
            </Grid>
          </Grid>
        ) : (
          /* EDIT MODE: Input Fields */
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4} md={3}>
                <TextField fullWidth size="small" label="Systolic BP" name="bpSystolic" value={vitals.bpSystolic} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <TextField fullWidth size="small" label="Diastolic BP" name="bpDiastolic" value={vitals.bpDiastolic} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField fullWidth size="small" label="Heart Rate" name="heartRate" value={vitals.heartRate} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">bpm</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField fullWidth size="small" label="Temperature" name="temperature" value={vitals.temperature} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">°F</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={6} sm={4} md={4}>
                <TextField fullWidth size="small" label="SpO2" name="spo2" value={vitals.spo2} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={6} sm={4} md={4}>
                <TextField fullWidth size="small" label="Height" name="height" value={vitals.height} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={4}>
                <TextField fullWidth size="small" label="Weight" name="weight" value={vitals.weight} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment>, sx: { bgcolor: 'white' } }} />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

    </Box>
  );
}