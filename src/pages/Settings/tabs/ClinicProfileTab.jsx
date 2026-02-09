import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // 1. Use Hook Form
import { Box, Grid, TextField, Button, CircularProgress, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService'; // Import Service
import { useToast } from '../../../context/ToastContext';

export default function ClinicProfileTab() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Setup Form
  const { register, handleSubmit, reset, setValue } = useForm();

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await settingService.getClinic();
        // Populate form if data exists
        if (data) {
          reset(data); 
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        showToast("Failed to load clinic details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [reset, showToast]);

  // --- 2. SAVE HANDLER ---
  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await settingService.updateClinic(data);
      showToast("Clinic profile updated successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
       <form onSubmit={handleSubmit(onSubmit)}>
          <SettingsHeader 
            title="Clinic Profile" 
            sub="Manage your clinic's legal details for invoices." 
            color={primaryColor}
            action={
              <Button 
                type="submit" // Triggers form submit
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} 
                disabled={saving}
                sx={{ bgcolor: primaryColor, fontWeight: 'bold' }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            } 
          />
          
          <Grid container spacing={3}>
             <Grid item xs={12}>
                <TextField 
                  fullWidth label="Clinic Legal Name" 
                  placeholder="e.g. Smile Care Pvt Ltd"
                  InputLabelProps={{ shrink: true }}
                  {...register("legalName")} 
                />
             </Grid>
             <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Brand Name (Display)" 
                  placeholder="e.g. Smile Care"
                  InputLabelProps={{ shrink: true }}
                  {...register("name", { required: true })} 
                />
             </Grid>
             <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Registration Number" 
                  placeholder="e.g. TN-DENT-8821"
                  InputLabelProps={{ shrink: true }}
                  {...register("registrationNumber")} 
                />
             </Grid>
             <Grid item xs={6}>
                <TextField 
                  fullWidth label="GSTIN" 
                  placeholder="e.g. 33AABCS..."
                  InputLabelProps={{ shrink: true }}
                  {...register("gstin")} 
                />
             </Grid>
             <Grid item xs={6}>
                <TextField 
                  fullWidth label="Phone" 
                  placeholder="+91..."
                  InputLabelProps={{ shrink: true }}
                  {...register("phone")} 
                />
             </Grid>
             <Grid item xs={12}>
                <TextField 
                  fullWidth label="Email" 
                  placeholder="admin@clinic.com"
                  InputLabelProps={{ shrink: true }}
                  {...register("email")} 
                />
             </Grid>
             <Grid item xs={12}>
                <TextField 
                  fullWidth multiline rows={3} label="Address" 
                  placeholder="Full address for billing..."
                  InputLabelProps={{ shrink: true }}
                  {...register("address")} 
                />
             </Grid>
          </Grid>
       </form>
    </Box>
  );
}