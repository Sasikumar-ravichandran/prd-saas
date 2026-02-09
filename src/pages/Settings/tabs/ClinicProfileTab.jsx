import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; 
import { Box, Grid, TextField, Button, CircularProgress, InputAdornment } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key'; // Icon for ID
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService'; 
import { useToast } from '../../../context/ToastContext';

export default function ClinicProfileTab() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await settingService.getClinic();
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
                type="submit" 
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
             
             {/* --- NEW FIELD: CLINIC ID (READ ONLY) --- */}
             <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Clinic ID (System Generated)" 
                  disabled // <--- READ ONLY
                  InputLabelProps={{ shrink: true }}
                  {...register("clinicId")} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiInputBase-root': { bgcolor: '#f1f5f9' } // Grey background
                  }}
                />
             </Grid>

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