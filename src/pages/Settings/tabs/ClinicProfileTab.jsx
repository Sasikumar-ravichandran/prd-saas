import React from 'react';
import { Box, Grid, TextField, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';

export default function ClinicProfileTab() {
  const { primaryColor } = useColorMode();

  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
      <SettingsHeader title="Clinic Profile" sub="Manage your clinic's legal details." color={primaryColor}
        action={<Button variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: primaryColor }}>Save Changes</Button>} />
      
      <Grid container spacing={3}>
         <Grid item xs={12}><TextField fullWidth label="Clinic Legal Name" defaultValue="Smile Care Pvt Ltd" /></Grid>
         <Grid item xs={6}><TextField fullWidth label="Registration Number" defaultValue="TN-DENT-8821" /></Grid>
         <Grid item xs={6}><TextField fullWidth label="GSTIN" defaultValue="33AABCS1234Q1Z5" /></Grid>
         <Grid item xs={6}><TextField fullWidth label="Phone" defaultValue="+91 98400 12345" /></Grid>
         <Grid item xs={6}><TextField fullWidth label="Email" defaultValue="admin@smilecare.com" /></Grid>
         <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Address" defaultValue="No. 42, Gandhi Road, Adyar, Chennai - 600020" /></Grid>
      </Grid>
    </Box>
  );
}