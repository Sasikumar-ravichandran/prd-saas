import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  Alert, CircularProgress, Divider, Link, CssBaseline,
  GlobalStyles, Drawer, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Form & Feature Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import DomainIcon from '@mui/icons-material/Domain';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PieChartIcon from '@mui/icons-material/PieChart';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { authService } from '../api/services/authService';
import { setCredentials } from '../redux/slices/authSlice';
import { useColorMode } from '../context/ThemeContext';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0); // 0 = Admin, 1 = Staff
  const [formData, setFormData] = useState({ email: '', password: '', clinicShortId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ⚡️ MOBILE VIEW STATE
  const [mobileView, setMobileView] = useState('welcome');
  // ⚡️ MOBILE FEATURE DRAWER STATE
  const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);

  const { loadBranding, changePrimaryColor } = useColorMode();

  const advantages = [
    {
      icon: <CalendarMonthIcon />,
      title: "Smart Chair & Appointment Scheduling",
      desc: "Effortlessly manage patient bookings, assign treatment chairs, and track doctor schedules with our drag-and-drop calendar."
    },
    {
      icon: <ChatIcon />,
      title: "In-Clinic Staff Messaging",
      desc: "Secure, real-time messaging between reception, nurses, and doctors. Keep your clinic team connected without leaving the app."
    },
    {
      icon: <ReceiptLongIcon />,
      title: "Fast & Accurate Billing",
      desc: "Generate treatment invoices, track pending payments, and manage day-to-day clinic expenses with clean financial ledgers."
    },
    {
      icon: <PieChartIcon />,
      title: "Profit & Share Tracking",
      desc: "Automatically calculate net clinic profits, doctor commissions, and branch-wise revenue performance in real time."
    }
  ];

  useEffect(() => {
    if (changePrimaryColor) {
      changePrimaryColor(defaultColor);
    }
  }, [changePrimaryColor]);

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
      await loadBranding();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

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

        {/* =========================================================
            1. DESKTOP ONLY: Left Side Brand Storytelling
           ========================================================= */}
        <Box sx={{
          flex: 1.2,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          p: { lg: 5, xl: 6 },
          position: 'relative',
          backgroundImage: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Abstract background glow */}
          <Box sx={{
            position: 'absolute',
            top: '10%', left: '-10%',
            width: '60%', height: '60%',
            backgroundImage: `radial-gradient(circle, ${defaultColor}35 0%, transparent 60%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }} />

          {/* Header / Custom Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1, flexShrink: 0, mb: 2 }}>
            <Box sx={{
              bgcolor: 'white', p: 0.8, borderRadius: 2.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 20px ${defaultColor}40`, width: 42, height: 42
            }}>
              <Box
                component="img"
                src="/kliniclogo.png"
                alt="Logo"
                onError={(e) => { e.target.style.display = 'none'; }}
                sx={{ width: 86, height: 86, objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '2.75rem' }}>
              Klinic<span style={{ color: defaultColor }}>Hub</span>
            </Typography>
          </Box>

          {/* Scrollable Center Area */}
          <Box sx={{
            zIndex: 1, my: 'auto', py: 2, pr: 1.5, overflowY: 'auto',
            maxHeight: 'calc(100vh - 160px)',
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: `${defaultColor}80` },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
          }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.2, fontSize: { lg: '1.75rem', xl: '2.25rem' } }}>
              Complete Clinical & Financial<br />Control for Your Practice.
            </Typography>

            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4, maxWidth: 520, fontSize: '0.95rem', lineHeight: 1.6 }}>
              From chair-side appointments and instant team messaging to automated billing and profit splits—everything your clinic needs in one workspace.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 640 }}>
              {advantages.map((adv, idx) => (
                <Box key={idx} sx={{
                  p: 2.5, borderRadius: 3.5,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.07)',
                    borderColor: `${defaultColor}60`,
                    transform: 'translateY(-3px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                    <Box sx={{
                      color: defaultColor, display: 'flex',
                      bgcolor: 'rgba(255,255,255,0.06)', p: 1, borderRadius: 2, flexShrink: 0
                    }}>
                      {adv.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#f8fafc', fontSize: '0.95rem' }}>
                      {adv.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.83rem' }}>
                    {adv.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Footer / Trust Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1, flexShrink: 0, pt: 2, color: '#64748b' }}>
            <SecurityIcon sx={{ fontSize: 18, color: defaultColor }} />
            <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 0.5, color: '#94a3b8', fontSize: '0.75rem' }}>
              SECURE CLINIC DATA • REAL-TIME SYNC
            </Typography>
          </Box>
        </Box>

        {/* =========================================================
            2. RIGHT SIDE: Form Container & Mobile Welcome Screen
           ========================================================= */}
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

            {/* ⚡️ MOBILE WELCOME SCREEN */}
            {mobileView === 'welcome' ? (
              <Box sx={{
                display: { xs: 'flex', lg: 'none' },
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 2
              }}>
                <Box sx={{
                  bgcolor: 'white', p: 1.5, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 30px rgba(0,0,0,0.1)`, width: 72, height: 72, mb: 2
                }}>
                  <Box
                    component="img"
                    src="/kliniclogo.png"
                    alt="Logo"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    sx={{ width: 126, height: 126, objectFit: 'contain' }}
                  />
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', mb: 1 }}>
                  Klinic<span style={{ color: defaultColor }}>Hub</span>
                </Typography>

                <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, mb: 4, px: 2 }}>
                  The complete operating system for modern dental clinics & branch workflows.
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Button
                    fullWidth size="large" variant="contained"
                    onClick={() => setMobileView('form')}
                    sx={{
                      borderRadius: '12px', py: 1.8, fontSize: '1.05rem', fontWeight: 700,
                      bgcolor: defaultColor, textTransform: 'none',
                      boxShadow: `0 8px 24px -6px ${defaultColor}`,
                    }}
                  >
                    Sign In
                  </Button>

                  <Button
                    fullWidth size="large" variant="outlined"
                    onClick={() => navigate('/signup')}
                    sx={{
                      borderRadius: '12px', py: 1.8, fontSize: '1.05rem', fontWeight: 700,
                      borderColor: '#475569', color: '#0f172a', textTransform: 'none',
                      bgcolor: 'rgba(255,255,255,0.4)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    }}
                  >
                    Register New Clinic
                  </Button>
                </Box>

                {/* ⚡️ THE FIX: Tapping this opens the native Mobile Bottom Drawer! */}
                <Box
                  onClick={() => setFeatureDrawerOpen(true)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    py: 1.2, px: 2.5, borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:active': { transform: 'scale(0.97)' }
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: defaultColor }} />
                  <Typography variant="body2" fontWeight="700" color="#0f172a">
                    See Why Clinics Choose KlinicHub
                  </Typography>
                </Box>

              </Box>
            ) : null}

            {/* ⚡️ LOGIN FORM */}
            <Box sx={{
              display: {
                xs: mobileView === 'form' ? 'block' : 'none',
                lg: 'block'
              }
            }}>
              <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 2 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setMobileView('welcome')}
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#0f172a', pl: 0 }}
                >
                  Back
                </Button>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: defaultColor, letterSpacing: '-0.5px' }}>
                  Welcome back
                </Typography>
                <Typography color="text.secondary" fontWeight={500}>
                  Enter your details to securely sign in.
                </Typography>
              </Box>

              {/* Segmented Control */}
              <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 3, mb: 4 }}>
                <Button
                  fullWidth onClick={() => setTab(0)} disableRipple
                  sx={{
                    borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                    color: tab === 0 ? '#0f172a' : '#64748b',
                    bgcolor: tab === 0 ? '#ffffff' : 'transparent',
                    boxShadow: tab === 0 ? `0 2px 8px ${defaultColor}` : 'none',
                    '&:hover': { bgcolor: tab === 0 ? '#ffffff' : 'rgba(0,0,0,0.02)' }
                  }}
                >
                  Clinic Admin
                </Button>
                <Button
                  fullWidth onClick={() => setTab(1)} disableRipple
                  sx={{
                    borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                    color: tab === 1 ? '#0f172a' : '#64748b',
                    bgcolor: tab === 1 ? '#ffffff' : 'transparent',
                    boxShadow: tab === 1 ? `0 2px 8px ${defaultColor}` : 'none',
                    '&:hover': { bgcolor: tab === 1 ? '#ffffff' : 'rgba(0,0,0,0.02)' }
                  }}
                >
                  Staff Member
                </Button>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                {tab === 1 && (
                  <TextField
                    fullWidth placeholder="e.g. CL-8821" label="Clinic ID"
                    sx={premiumInputSx} InputLabelProps={{ shrink: true }}
                    value={formData.clinicShortId}
                    onChange={(e) => {
                      if (error) setError(null);
                      setFormData({ ...formData, clinicShortId: e.target.value });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><DomainIcon color="action" /></InputAdornment>
                    }}
                  />
                )}

                <TextField
                  fullWidth placeholder="name@clinic.com" label="Email Address" type="email"
                  sx={premiumInputSx} InputLabelProps={{ shrink: true }}
                  value={formData.email}
                  onChange={(e) => {
                    if (error) setError(null);
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>
                  }}
                />

                <Box>
                  <TextField
                    fullWidth placeholder="••••••••" label="Password" type="password"
                    sx={premiumInputSx} InputLabelProps={{ shrink: true }}
                    value={formData.password}
                    onChange={(e) => {
                      if (error) setError(null);
                      setFormData({ ...formData, password: e.target.value });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Link href="#forgot" variant="body2" sx={{ color: defaultColor, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      Forgot password?
                    </Link>
                  </Box>
                </Box>

                <Button
                  type="submit" fullWidth size="large" variant="contained" disabled={loading}
                  sx={{
                    borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                    bgcolor: defaultColor, textTransform: 'none',
                    boxShadow: `0 8px 24px -6px ${defaultColor}`,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${defaultColor}` }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                </Button>

                <Divider sx={{ my: 1, color: 'text.secondary', typography: 'body2' }}>OR</Divider>

                <Button
                  fullWidth onClick={() => navigate('/signup')} variant="outlined"
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

      </Box>

      {/* =========================================================
          3. ⚡️ MOBILE ONLY: Sleek Native Bottom Drawer for Features
         ========================================================= */}
      <Drawer
        anchor="bottom"
        open={featureDrawerOpen}
        onClose={() => setFeatureDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            p: 3,
            bgcolor: '#0f172a',
            color: 'white',
            maxHeight: '85vh'
          }
        }}
      >
        {/* Swipe Handle Indicator */}
        <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, mx: 'auto', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="800">
            Why Clinics Choose KlinicHub
          </Typography>
          <IconButton onClick={() => setFeatureDrawerOpen(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2, overflowY: 'auto' }}>
          {advantages.map((adv, idx) => (
            <Box key={idx} sx={{
              p: 2.5, borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'flex-start', gap: 2
            }}>
              <Box sx={{
                color: defaultColor, display: 'flex',
                bgcolor: 'rgba(255,255,255,0.08)', p: 1.2, borderRadius: 2, flexShrink: 0
              }}>
                {adv.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.2, mb: 0.5 }}>
                  {adv.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
                  {adv.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Drawer>
    </>
  );
}