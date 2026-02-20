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
  
  // ⚡️ THE FIX: Use a ref to ensure we only fetch ONCE
  const hasFetched = useRef(false);

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile } = useForm();
  const { register: regPassword, handleSubmit: submitPassword, reset: resetPassword, watch: watchPassword, formState: { errors: passErrors } } = useForm();

  useEffect(() => {
    // If we already fetched the data, don't do it again!
    if (hasFetched.current) return;

    const fetchProfileAndClinic = async () => {
      try {
        setLoading(true);
        const [userRes, clinicRes] = await Promise.all([
          api.get('/users/me'),
          settingService.getClinic()
        ]);
        
        // This will automatically populate fullName, mobile, and email in the form
        resetProfile(userRes.data);
        setClinicData(clinicRes);
        
        // Mark as fetched
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
  }, []); // ⚡️ Empty dependency array ensures this only runs once on mount

  const onSaveProfile = async (data) => {
    try {
      setSavingProfile(true);
      // Sending fullName and mobile to match your User schema
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

  return (
    <Box sx={{ maxWidth: 950, margin: '0 auto', pb: 6, p: 4 }}>
      
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="800" color={primaryColor}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal profile, workspace details, and security preferences.
        </Typography>
      </Box>

      {/* TIGHTER STACK WITH DIVIDERS */}
      <Stack spacing={4} divider={<Divider sx={{ borderColor: '#e2e8f0' }} />}>
        
        {/* ================= SECTION 1: PERSONAL INFO ================= */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ pr: { md: 2 } }}>
              <Typography variant="subtitle2" fontWeight="700" color="#1e293b">Personal Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Update your name and contact details. Your email is your unique login ID.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <form onSubmit={submitProfile(onSaveProfile)}>
                
                {/* CLEAN AVATAR HEADER (No upload buttons) */}
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontWeight: 800, fontSize: '1.5rem' }}>
                    {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{user?.fullName || user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Your system avatar.</Typography>
                  </Box>
                </Box>
                
                {/* DENSE FORM FIELDS */}
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">Full Name</Typography>
                      {/* Matched to fullName */}
                      <TextField fullWidth size="small" {...regProfile("fullName", { required: true })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">Mobile Number</Typography>
                      {/* Matched to mobile */}
                      <TextField fullWidth size="small" {...regProfile("mobile")} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">Email Address</Typography>
                      <TextField 
                        fullWidth size="small" disabled {...regProfile("email")} 
                        sx={{ '& .MuiInputBase-root': { bgcolor: '#f8fafc' } }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: '#94a3b8' }}/></InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit" variant="contained" disableElevation disabled={savingProfile}
                    startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
                    sx={{ bgcolor: primaryColor, fontWeight: '600', textTransform: 'none' }}
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* ================= SECTION 2: WORKSPACE INFO (COMPACT GRID) ================= */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ pr: { md: 2 } }}>
              <Typography variant="subtitle2" fontWeight="700" color="#1e293b">Workspace & Role</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Your current clinic assignment and system privileges. Read-only.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" mb={0.5}>CLINIC NAME</Typography>
                  <Typography variant="body2" fontWeight="600" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: primaryColor }} /> {clinicData?.name || 'Loading...'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" mb={0.5}>CLINIC ID</Typography>
                  <Typography variant="body2" fontWeight="600" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KeyIcon sx={{ fontSize: 18, color: '#64748b' }} /> {clinicData?.clinicId || 'Loading...'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" mb={0.5}>SYSTEM ROLE</Typography>
                  <Typography variant="body2" fontWeight="600" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon sx={{ fontSize: 18, color: '#64748b' }} /> {user?.role || 'Staff'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" mb={0.5}>ACCESS LEVEL</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: user?.role === 'Administrator' ? '#10b981' : '#f59e0b' }}>
                    <SecurityIcon sx={{ fontSize: 18 }} /> 
                    {user?.role === 'Administrator' ? 'Full Administrator' : 'Restricted Staff'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* ================= SECTION 3: SECURITY ================= */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ pr: { md: 2 } }}>
              <Typography variant="subtitle2" fontWeight="700" color="#1e293b">Security</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <form onSubmit={submitPassword(onSavePassword)}>
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">Current Password</Typography>
                      <TextField
                        fullWidth size="small" type={showPassword.current ? 'text' : 'password'}
                        {...regPassword("currentPassword", { required: "Current password is required" })}
                        error={!!passErrors.currentPassword} helperText={passErrors.currentPassword?.message}
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

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">New Password</Typography>
                        <TextField
                          fullWidth size="small" type={showPassword.new ? 'text' : 'password'} 
                          {...regPassword("newPassword", { minLength: { value: 6, message: "At least 6 characters" } })}
                          error={!!passErrors.newPassword} helperText={passErrors.newPassword?.message}
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
                        <Typography variant="caption" fontWeight="700" color="#475569" mb={0.5} display="block">Confirm Password</Typography>
                        <TextField
                          fullWidth size="small" type={showPassword.confirm ? 'text' : 'password'}
                          {...regPassword("confirmPassword", { validate: (val) => watchPassword("newPassword") === val || "Passwords don't match" })}
                          error={!!passErrors.confirmPassword} helperText={passErrors.confirmPassword?.message}
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

                <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit" variant="outlined" disableElevation disabled={savingPassword}
                    sx={{ fontWeight: '600', color: '#0f172a', borderColor: '#cbd5e1', textTransform: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}
                  >
                    {savingPassword ? <CircularProgress size={16} /> : "Update Password"}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>

      </Stack>
    </Box>
  );
}