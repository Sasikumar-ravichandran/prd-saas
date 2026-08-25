import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, InputAdornment,
  Alert, CircularProgress, CssBaseline, GlobalStyles
} from '@mui/material';

// Icons
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';

import api from '../../api/services/api';
import { useColorMode } from '../../context/ThemeContext';
import { BrandSidebar, MobileFeatureDrawer } from './BrandVisuals'; // Assuming they are in the same /Auth folder
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const defaultColor = '#1976d2';

const premiumInputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f8fafc',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused': {
      bgcolor: '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      '& fieldset': { borderWidth: '2px' }
    }
  }
};

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { changePrimaryColor } = useColorMode();
  
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false); // For mobile

  useEffect(() => {
    if (changePrimaryColor) {
      changePrimaryColor(defaultColor);
    }
  }, [changePrimaryColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await api.put('/users/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      // Update Local Storage
      localStorage.setItem("user", JSON.stringify(data));
      
      // Redirect to Dashboard via hard refresh
      window.location.href = "/"; 
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      <CssBaseline />

      {/* Global overrides to hide scrollbars for a clean SaaS look */}
      <GlobalStyles styles={{
        '*::-webkit-scrollbar': { display: 'none' },
        '*': { msOverflowStyle: 'none', scrollbarWidth: 'none' },
        'body, html, #root': { overflow: 'hidden', margin: 0, padding: 0 }
      }} />

      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', bgcolor: '#ffffff'
      }}>

        {/* 1. DESKTOP ONLY: Left Side Brand Storytelling */}
        <BrandSidebar defaultColor={defaultColor} />

        {/* 2. RIGHT SIDE: Form Container */}
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: 'linear-gradient(145deg, #b8c8e6 0%, #a4c0eb 100%)',
          height: '100%', overflowY: 'auto', overflowX: 'hidden'
        }}>
          <Box sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, my: 'auto', bgcolor: { xs: 'white', lg: 'transparent' }, borderRadius: { xs: 4, lg: 0 }, boxShadow: { xs: '0 10px 40px rgba(0,0,0,0.1)', lg: 'none' }, m: { xs: 2, lg: 'auto' } }}>

            <Box sx={{ display: 'flex', mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleLogout}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#0f172a', pl: 0 }}
              >
                Back to Login
              </Button>
            </Box>

            <Box sx={{ mb: 4, textAlign: { xs: 'center', lg: 'left' } }}>
              
              {/* Flex container to put Icon and Title on the same row */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', lg: 'flex-start' }, 
                  gap: 2, 
                  mb: 1 
                }}
              >
                <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(25, 118, 210, 0.1)', p: 1.2, borderRadius: '50%' }}>
                   <VerifiedUserIcon fontSize="medium" sx={{ color: defaultColor }} />
                </Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Security Update
                </Typography>
              </Box>

              <Typography color="text.secondary" fontWeight={500} sx={{ mt: 1 }}>
                For your security, please change your default password before accessing the clinic dashboard.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

              <TextField
                fullWidth
                label="Current (Default) Password"
                type="password"
                placeholder="Enter current password"
                sx={premiumInputSx} 
                InputLabelProps={{ shrink: true }}
                value={formData.oldPassword}
                onChange={(e) => {
                  if (error) setError('');
                  setFormData({ ...formData, oldPassword: e.target.value });
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                sx={premiumInputSx} 
                InputLabelProps={{ shrink: true }}
                value={formData.newPassword}
                onChange={(e) => {
                  if (error) setError('');
                  setFormData({ ...formData, newPassword: e.target.value });
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VpnKeyIcon color="action" /></InputAdornment>
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                placeholder="Retype new password"
                sx={premiumInputSx} 
                InputLabelProps={{ shrink: true }}
                value={formData.confirmPassword}
                onChange={(e) => {
                  if (error) setError('');
                  setFormData({ ...formData, confirmPassword: e.target.value });
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VpnKeyIcon color="action" /></InputAdornment>
                }}
              />

              <Button
                type="submit" fullWidth size="large" variant="contained" disabled={loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
                sx={{
                  borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1.05rem', fontWeight: 700,
                  bgcolor: defaultColor, textTransform: 'none',
                  boxShadow: `0 8px 24px -6px ${defaultColor}`,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${defaultColor}` }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Secure Account & Continue"}
              </Button>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* 3. MOBILE ONLY: Sleek Native Bottom Drawer for Features (Optional, matches Login) */}
      <MobileFeatureDrawer 
        open={featureDrawerOpen} 
        onClose={() => setFeatureDrawerOpen(false)} 
        defaultColor={defaultColor} 
      />
    </>
  );
}