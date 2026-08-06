import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment, Alert,
  CircularProgress, CssBaseline, GlobalStyles
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Form Icons
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

// Import the shared UI components you just created
import { BrandSidebar, MobileFeatureDrawer } from '../Auth/BrandVisuals';

import { useColorMode } from '../../context/ThemeContext';
import api from '../../api/services/api';

// Fallback color if context doesn't load immediately
const defaultColor = '#1976d2'; 

// Custom style for premium SaaS inputs (matching Login/Signup)
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

export default function SetupBranch() {
  const { primaryColor } = useColorMode();
  const activeColor = primaryColor || defaultColor;
  
  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Drawer state for mobile
  const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the Branch
      const res = await api.post('/branches', formData);

      // 2. Update Local User State
      const user = JSON.parse(localStorage.getItem('user'));
      user.defaultBranch = res.data._id;
      user.branchName = res.data.branchName;
      user.branchCode = res.data.branchCode;
      user.allowedBranches = [res.data];

      // Save back to storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('activeBranchId', res.data._id);

      setSuccessMsg(`Success! ${res.data.branchCode} created.`);

      // 3. Delay slightly then redirect
      setTimeout(() => {
        window.location.href = "/"; // Force refresh to update guards
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />

      {/* Scrollbar Nuke */}
      <GlobalStyles styles={{
        '*::-webkit-scrollbar': { display: 'none' },
        '*': { msOverflowStyle: 'none', scrollbarWidth: 'none' },
        'body, html, #root': { overflow: 'hidden', margin: 0, padding: 0 }
      }} />

      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', bgcolor: '#ffffff'
      }}>

        {/* 1. DESKTOP ONLY: Shared Sidebar */}
        <BrandSidebar defaultColor={activeColor} />

        {/* 2. RIGHT SIDE: Form Container */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(145deg, #b8c8e6 0%, #a4c0eb 100%)',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Box sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, my: 'auto' }}>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: activeColor, letterSpacing: '-0.5px' }}>
                Final Step
              </Typography>
              <Typography color="text.secondary" fontWeight={500}>
                Setup your main branch to access your dashboard. Details can be easily changed later in settings.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              {successMsg && <Alert severity="success" sx={{ borderRadius: 2 }}>{successMsg}</Alert>}

              <TextField
                fullWidth label="Branch Name" name="branchName" placeholder="e.g. Anna Nagar Branch"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.branchName} onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment>
                }}
              />

              <TextField
                fullWidth label="Address" name="address" placeholder="Street, City, Zip Code"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required multiline rows={2}
                value={formData.address} onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><LocationOnIcon color="action" /></InputAdornment>
                }}
              />

              <TextField
                fullWidth label="Phone Number (Optional)" name="phone" placeholder="+91 98765 43210"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }}
                value={formData.phone} onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>
                }}
              />

              <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{
                borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                bgcolor: activeColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${activeColor}`,
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${activeColor}` }
              }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Setup"}
              </Button>

              {/* Mobile Only: Show Drawer Trigger */}
              <Typography 
                textAlign="center" variant="body2" 
                sx={{ 
                  display: { xs: 'block', lg: 'none' },
                  mt: 2, cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: activeColor } 
                }} 
                onClick={() => setFeatureDrawerOpen(true)}
              >
                See why clinics choose KlinicHub
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 3. MOBILE ONLY: Shared Drawer */}
      <MobileFeatureDrawer 
        open={featureDrawerOpen} 
        onClose={() => setFeatureDrawerOpen(false)} 
        defaultColor={activeColor} 
      />
    </>
  );
}