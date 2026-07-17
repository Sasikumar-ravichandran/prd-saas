import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  Alert, CircularProgress, Divider, Link, CssBaseline,
  GlobalStyles
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Form Icons
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

// Branding Icons
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import SecurityIcon from '@mui/icons-material/Security';

import { authService } from '../api/services/authService';

const defaultColor = '#1976d2'

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

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clinicName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await authService.register(formData);
      // Redirect to Dashboard on success
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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

      {/* ⚡️ Scrollbar Nuke */}
      <GlobalStyles styles={{
        '*::-webkit-scrollbar': { display: 'none' },
        '*': { msOverflowStyle: 'none', scrollbarWidth: 'none' },
        'body, html, #root': { overflow: 'hidden', margin: 0, padding: 0 }
      }} />

      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', bgcolor: '#ffffff'
      }}>

        {/* LEFT SIDE: Premium Brand Storytelling */}
        <Box sx={{
          flex: 1.2, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column',
          justifyContent: 'space-between', p: { lg: 6, xl: 8 }, position: 'relative',
          background: `linear-gradient(145deg, #0f172a 0%, #1e293b 100%)`, color: 'white',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: '10%', left: '-10%', width: '60%', height: '60%', background: `radial-gradient(circle, ${defaultColor}35 0%, transparent 60%)`, filter: 'blur(60px)' }} />

          {/* Header / Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
            <Box sx={{ bgcolor: defaultColor, p: 1.5, borderRadius: 3, display: 'flex', boxShadow: `0 4px 30px ${defaultColor}70` }}>
              <MedicalServicesIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-2px' }}>
              Clinic<span style={{ color: '#94a3b8' }}>OS</span>
            </Typography>
          </Box>

          {/* Core Value & "Bento Box" Grid */}
          <Box sx={{ zIndex: 1, mt: -2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15, fontSize: { lg: '2.75rem', xl: '3.5rem' } }}>
              The Operating System<br />for Modern Dentistry.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, maxWidth: 650, mt: 5 }}>
              {advantages.map((adv, idx) => (
                <Box key={idx} sx={{
                  p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateY(-2px)' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ color: defaultColor, display: 'flex' }}>{adv.icon}</Box>
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

          {/* Footer / Trust Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1, color: '#64748b' }}>
            <SecurityIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
              256-BIT ENCRYPTED • HIPAA COMPLIANT • CLOUD BACKUPS
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SIDE: Elevated Form Container */}
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(145deg, #b8c8e6 0%, #a4c0eb 100%)`, height: '100%', overflowY: 'auto', overflowX: 'hidden'
        }}>
          <Box sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, my: 'auto' }}>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: defaultColor, letterSpacing: '-0.5px' }}>
                Create Your Workspace
              </Typography>
              <Typography color="text.secondary" fontWeight={500}>
                Set up your secure, all-in-one digital clinic in seconds.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

              <TextField
                fullWidth placeholder="e.g. Apollo Dental" label="Clinic Name" name="clinicName"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.clinicName} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }}
              />

              <TextField
                fullWidth placeholder="e.g. Dr. Jane Doe" label="Your Full Name" name="fullName"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.fullName} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonAddIcon color="action" /></InputAdornment> }}
              />

              <TextField
                fullWidth placeholder="name@clinic.com" label="Email Address" name="email" type="email"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.email} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
              />

              <TextField
                fullWidth placeholder="••••••••" label="Password" name="password" type="password"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.password} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
              />

              <TextField
                fullWidth placeholder="••••••••" label="Confirm Password" name="confirmPassword" type="password"
                sx={premiumInputSx} InputLabelProps={{ shrink: true }} required
                value={formData.confirmPassword} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
              />

              <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{
                borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                bgcolor: defaultColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${defaultColor}`,
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${defaultColor}` }
              }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Clinic Workspace"}
              </Button>

              <Divider sx={{ my: 1, color: 'text.secondary', typography: 'body2' }}>OR</Divider>

              <Button
                fullWidth onClick={() => navigate('/login')} variant="outlined"
                sx={{
                  borderRadius: '12px', py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                  borderColor: '#e2e8f0', color: '#475569',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                Already have an account? Sign In
              </Button>
            </Box>
          </Box>
        </Box>

      </Box>
    </>
  );
}