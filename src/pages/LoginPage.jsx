import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  Alert, CircularProgress, Divider, Link, CssBaseline,
  GlobalStyles
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // ⚡️ REQUIRED FOR ROUTING

// Form Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import DomainIcon from '@mui/icons-material/Domain';

// Branding Icons
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import SecurityIcon from '@mui/icons-material/Security';

import { useColorMode } from '../context/ThemeContext';
import { authService } from '../api/services/authService';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice'; 

// Custom style for premium SaaS inputs
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

export default function LoginPage() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate(); //  INITIALIZED ROUTER
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0); // 0 = Admin, 1 = Staff
  const [formData, setFormData] = useState({ email: '', password: '', clinicShortId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        clinicShortId: tab === 1 ? formData.clinicShortId : undefined
      };
      const data = await authService.login(payload);
      if (data.requirePasswordChange) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/change-password");
        return;
      }
      dispatch(setCredentials({ user: data }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      // ⚡️ FIXED: Clear ONLY the password field, keep the email/ID, and stay on the page
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const advantages = [
    { icon: <EventAvailableIcon />, title: "Smart Scheduling", desc: "Zero double-bookings & automated SMS." },
    { icon: <AccountBalanceWalletIcon />, title: "Frictionless Billing", desc: "1-click invoicing & due tracking." },
    { icon: <MonitorHeartIcon />, title: "Clinical Records", desc: "Interactive odontograms & history." },
    { icon: <InsertChartOutlinedIcon />, title: "Real-Time Analytics", desc: "Track revenue & clinic growth." },
  ];

  return (
    <>
      <CssBaseline />

      <GlobalStyles styles={{
        '*::-webkit-scrollbar': { display: 'none' },
        '*': { msOverflowStyle: 'none', scrollbarWidth: 'none' },
        'body, html, #root': { overflow: 'hidden', margin: 0, padding: 0 }
      }} />

      <Box sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        bgcolor: '#ffffff'
      }}>

        {/* LEFT SIDE: Premium Brand Storytelling */}
        <Box sx={{
          flex: 1.2,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 6, xl: 8 },
          position: 'relative',
          background: `linear-gradient(145deg, #0f172a 0%, #1e293b 100%)`,
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Abstract background glow */}
          <Box sx={{ position: 'absolute', top: '10%', left: '-10%', width: '60%', height: '60%', background: `radial-gradient(circle, ${primaryColor}35 0%, transparent 60%)`, filter: 'blur(60px)' }} />

          {/* 1. Header / Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
            <Box sx={{ bgcolor: primaryColor, p: 1.5, borderRadius: 3, display: 'flex', boxShadow: `0 4px 30px ${primaryColor}70` }}>
              <MedicalServicesIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-2px' }}>
              Clinic<span style={{ color: '#94a3b8' }}>OS</span>
            </Typography>
          </Box>

          {/* 2. Core Value & "Bento Box" Grid */}
          <Box sx={{ zIndex: 1, mt: -2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15, fontSize: { lg: '2.75rem', xl: '3.5rem' } }}>
              The Operating System<br />for Modern Dentistry.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, maxWidth: 650, mt: 5 }}>
              {advantages.map((adv, idx) => (
                <Box key={idx} sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateY(-2px)' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ color: primaryColor, display: 'flex' }}>{adv.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1, color: '#f8fafc' }}>
                      {adv.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
                    {adv.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 3. Footer / Trust Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1, color: '#64748b' }}>
            <SecurityIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
              256-BIT ENCRYPTED • HIPAA COMPLIANT • CLOUD BACKUPS
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SIDE: Elevated Form Container */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(145deg, #b8c8e6 0%, #a4c0eb 100%)`,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Box sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, my: 'auto' }}>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: primaryColor, letterSpacing: '-0.5px' }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" fontWeight={500}>
                Enter your details to securely sign in.
              </Typography>
            </Box>

            {/* Premium Apple-style Segmented Control */}
            <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 3, mb: 4 }}>
              <Button
                fullWidth
                onClick={() => setTab(0)}
                disableRipple
                sx={{
                  borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                  color: tab === 0 ? '#0f172a' : '#64748b',
                  bgcolor: tab === 0 ? '#ffffff' : 'transparent',
                  boxShadow: tab === 0 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  '&:hover': { bgcolor: tab === 0 ? '#ffffff' : 'rgba(0,0,0,0.02)' }
                }}
              >
                Clinic Admin
              </Button>
              <Button
                fullWidth
                onClick={() => setTab(1)}
                disableRipple
                sx={{
                  borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                  color: tab === 1 ? '#0f172a' : '#64748b',
                  bgcolor: tab === 1 ? '#ffffff' : 'transparent',
                  boxShadow: tab === 1 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  '&:hover': { bgcolor: tab === 1 ? '#ffffff' : 'rgba(0,0,0,0.02)' }
                }}
              >
                Staff Member
              </Button>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

              {tab === 1 && (
                <TextField fullWidth placeholder="e.g. CL-8821" label="Clinic ID" sx={premiumInputSx} InputLabelProps={{ shrink: true }} value={formData.clinicShortId} onChange={(e) => {
                  if (error) setError(null);
                  setFormData({ ...formData, clinicShortId: e.target.value })
                }} InputProps={{ startAdornment: <InputAdornment position="start"><DomainIcon color="action" /></InputAdornment> }} />
              )}

              <TextField fullWidth placeholder="name@clinic.com" label="Email Address" type="email" sx={premiumInputSx} InputLabelProps={{ shrink: true }} value={formData.email} onChange={(e) => {
                if (error) setError(null);
                setFormData({ ...formData, email: e.target.value })
              }} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />

              <Box>
                <TextField fullWidth placeholder="••••••••" label="Password" type="password" sx={premiumInputSx} InputLabelProps={{ shrink: true }} value={formData.password} onChange={(e) => {
                  if (error) setError(null);
                  setFormData({ ...formData, password: e.target.value })
                }} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Link href="#" variant="body2" sx={{ color: primaryColor, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    Forgot password?
                  </Link>
                </Box>
              </Box>

              <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{
                borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                bgcolor: primaryColor, textTransform: 'none',
                boxShadow: `0 8px 24px -6px ${primaryColor}`,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${primaryColor}` }
              }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>

              <Divider sx={{ my: 1, color: 'text.secondary', typography: 'body2' }}>OR</Divider>

              {/* ⚡️ FIXED: Navigates directly to the signup route */}
              <Button
                fullWidth
                onClick={() => navigate('/signup')}
                variant="outlined"
                sx={{
                  borderRadius: '12px', py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                  borderColor: '#e2e8f0', color: '#475569',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                Register New Clinic
              </Button>
            </Box>
          </Box>
        </Box>

      </Box>
    </>
  );
}