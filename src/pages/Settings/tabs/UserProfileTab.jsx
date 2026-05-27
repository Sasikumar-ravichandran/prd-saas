import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, TextField, Button, CircularProgress, InputAdornment,
  Divider, Typography, Paper, Avatar, Stack, IconButton, alpha
} from '@mui/material';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';

import { useColorMode } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/services/api';
import { settingService } from '../../../api/services/settingService'; 

// IMPORT YOUR HEADER COMPONENT HERE (Adjust the path as needed)
import SettingsHeader from '../components/SettingsHeader';

export default function UserProfileTab() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [clinicData, setClinicData] = useState(null); 
  
  const hasFetched = useRef(false);

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile } = useForm();
  const { register: regPassword, handleSubmit: submitPassword, reset: resetPassword, watch: watchPassword, formState: { errors: passErrors } } = useForm();

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchProfileAndClinic = async () => {
      try {
        setLoading(true);
        const [userRes, clinicRes] = await Promise.all([
          api.get('/users/me'),
          settingService.getClinic()
        ]);
        
        resetProfile(userRes.data);
        setClinicData(clinicRes);
        
        hasFetched.current = true;
      } catch (err) {
        if (user) resetProfile(user); 
        showToast("Loaded profile from cache", "info");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndClinic();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const onSaveProfile = async (data) => {
    try {
      setSavingProfile(true);
      await api.put('/users/me', { fullName: data.fullName, mobile: data.mobile });
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (data) => {
    try {
      setSavingPassword(true);
      await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      showToast("Password changed successfully", "success");
      resetPassword(); 
    } catch (err) {
      showToast(err.response?.data?.message || "Incorrect current password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress sx={{ color: primaryColor }} /></Box>;

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#fff' } };

  return (
    <Box sx={{ p: 4, maxWidth: 1000 }}>
      
      {/* PAGE HEADER USING YOUR CUSTOM COMPONENT */}
      <SettingsHeader 
        title="Account Settings"
        sub="Manage your personal profile, workspace details, and security preferences."
        color={primaryColor}
      />

      <Stack spacing={4}>
        
        {/* ================= SECTION 1: PERSONAL INFO ================= */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          {/* Card Header */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">Personal Information</Typography>
            <Typography variant="body2" color="text.secondary">Update your name and contact details.</Typography>
          </Box>

          <form onSubmit={submitProfile(onSaveProfile)}>
            {/* Card Body */}
            <Box sx={{ p: 3 }}>
              {/* Avatar Row */}
              <Stack direction="row" spacing={2.5} alignItems="center" mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontWeight: 800, fontSize: '1.5rem' }}>
                  {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="800" color="#1e293b" mb={0.2}>{user?.fullName || user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Your system avatar.</Typography>
                </Box>
              </Stack>
              
              {/* Form Grid */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">FULL NAME</Typography>
                  <TextField fullWidth size="small" {...regProfile("fullName", { required: true })} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">MOBILE NUMBER</Typography>
                  <TextField fullWidth size="small" {...regProfile("mobile")} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">EMAIL ADDRESS</Typography>
                  <TextField 
                    fullWidth size="small" disabled {...regProfile("email")} 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#f8fafc' } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: '#94a3b8' }}/></InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Card Footer */}
            <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit" variant="contained" disableElevation disabled={savingProfile}
                startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
                sx={{ bgcolor: primaryColor, fontWeight: '700', textTransform: 'none', borderRadius: 1.5, px: 3 }}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* ================= SECTION 2: WORKSPACE INFO ================= */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          {/* Card Header */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">Workspace & Role</Typography>
            <Typography variant="body2" color="text.secondary">Your current clinic assignment and system privileges (Read-only).</Typography>
          </Box>

          {/* Card Body */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" display="block" mb={0.5}>CLINIC NAME</Typography>
                  <Typography variant="body2" fontWeight="700" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: primaryColor }} /> {clinicData?.name || 'Loading...'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" display="block" mb={0.5}>CLINIC ID</Typography>
                  <Typography variant="body2" fontWeight="700" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KeyIcon sx={{ fontSize: 18, color: '#64748b' }} /> {clinicData?.clinicId || 'Loading...'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" display="block" mb={0.5}>SYSTEM ROLE</Typography>
                  <Typography variant="body2" fontWeight="700" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon sx={{ fontSize: 18, color: '#64748b' }} /> {user?.role || 'Staff'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" display="block" mb={0.5}>ACCESS LEVEL</Typography>
                  <Typography variant="body2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: user?.role === 'Administrator' ? '#10b981' : '#f59e0b' }}>
                    <SecurityIcon sx={{ fontSize: 18 }} /> 
                    {user?.role === 'Administrator' ? 'Full Administrator' : 'Restricted Staff'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* ================= SECTION 3: SECURITY ================= */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          {/* Card Header */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">Security Settings</Typography>
            <Typography variant="body2" color="text.secondary">Ensure your account is using a strong, random password.</Typography>
          </Box>

          <form onSubmit={submitPassword(onSavePassword)}>
            {/* Card Body */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">CURRENT PASSWORD</Typography>
                  <TextField
                    fullWidth size="small" type={showPassword.current ? 'text' : 'password'}
                    {...regPassword("currentPassword", { required: "Current password is required" })}
                    error={!!passErrors.currentPassword} helperText={passErrors.currentPassword?.message}
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => togglePasswordVisibility('current')} edge="end" size="small">
                            {showPassword.current ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">NEW PASSWORD</Typography>
                    <TextField
                      fullWidth size="small" type={showPassword.new ? 'text' : 'password'} 
                      {...regPassword("newPassword", { minLength: { value: 6, message: "At least 6 characters" } })}
                      error={!!passErrors.newPassword} helperText={passErrors.newPassword?.message}
                      sx={inputSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('new')} edge="end" size="small">
                              {showPassword.new ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight="800" color="#475569" mb={0.5} display="block">CONFIRM PASSWORD</Typography>
                    <TextField
                      fullWidth size="small" type={showPassword.confirm ? 'text' : 'password'}
                      {...regPassword("confirmPassword", { validate: (val) => watchPassword("newPassword") === val || "Passwords don't match" })}
                      error={!!passErrors.confirmPassword} helperText={passErrors.confirmPassword?.message}
                      sx={inputSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end" size="small">
                              {showPassword.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {/* Card Footer */}
            <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit" variant="outlined" disableElevation disabled={savingPassword}
                sx={{ fontWeight: '700', color: '#0f172a', borderColor: '#cbd5e1', textTransform: 'none', borderRadius: 1.5, '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}
              >
                {savingPassword ? <CircularProgress size={16} /> : "Update Password"}
              </Button>
            </Box>
          </form>
        </Paper>

      </Stack>
    </Box>
  );
}