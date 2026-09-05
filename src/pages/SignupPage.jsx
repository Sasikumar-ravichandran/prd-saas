import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  Alert, CircularProgress, Divider, CssBaseline,
  GlobalStyles, Grid, Paper, alpha, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Form & Feature Icons
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { BrandSidebar, MobileFeatureDrawer } from '../pages/Auth/BrandVisuals';
import { authService } from '../api/services/authService';

const defaultColor = '#1976d2';

//  NEW: The Clinic Types Configuration
const CLINIC_TYPES = [
  { id: 'Dental', label: 'Dental Care', icon: '🦷', desc: 'Odontograms & Perio' },
  { id: 'Dermatology', label: 'Dermatology', icon: '✨', desc: 'Body Mapping & Botox' },
  { id: 'General_Practice', label: 'General Practice', icon: '🩺', desc: 'Vitals & Prescriptions' },
  { id: 'Ophthalmology', label: 'Eye Care', icon: '👁️', desc: 'Vision Rx & Retinal' },
  { id: 'Physiotherapy', label: 'Physiotherapy', icon: '🏃', desc: 'Skeletal Maps & Rehab' },
];

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
    clinicType: '', //  NEW: Capture the type
    clinicName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  CHANGED: Flow now starts at 'TYPE' -> 'FORM' -> 'OTP' -> 'SUCCESS'
  const [step, setStep] = useState('TYPE');
  const [otp, setOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [mobileView, setMobileView] = useState('welcome');
  const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');
    setOtp('');
    
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError("Password must be at least 8 characters long and contain at least 1 number and 1 special character.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await authService.requestOtp(formData.email, 'SIGNUP_VERIFY');
      setSuccessMsg('Verification code sent to your email!');
      setStep('OTP');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Email might be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter a valid 6-digit OTP');

    try {
      setLoading(true);
      setError('');

      await authService.verifyOtp(formData.email, otp, 'SIGNUP_VERIFY');

      // formData already includes clinicType, so it gets sent automatically!
      await authService.register({
        ...formData,
        otp: otp
      });

      // Move them to the success/pending screen
      setStep('SUCCESS');

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or Registration failed.");
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

      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', bgcolor: '#ffffff' }}>

        {/* 1. DESKTOP ONLY: Left Side Brand Storytelling */}
        <BrandSidebar defaultColor={defaultColor} />

        {/* 2. RIGHT SIDE: Form Container & Mobile Welcome Screen */}
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: 'linear-gradient(145deg, #b8c8e6 0%, #a4c0eb 100%)',
          height: '100%', overflowY: 'auto', overflowX: 'hidden'
        }}>
          <Box sx={{ width: '100%', maxWidth: 500, p: { xs: 3, sm: 5 }, my: 'auto' }}>

            {/* MOBILE WELCOME SCREEN */}
            {mobileView === 'welcome' ? (
              <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
                <Box sx={{
                  bgcolor: 'white', p: 1.5, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 30px rgba(0,0,0,0.1)`, width: 72, height: 72, mb: 2
                }}>
                  <Box component="img" src="/kliniclogo.png" alt="Logo" onError={(e) => { e.target.style.display = 'none'; }} sx={{ width: 126, height: 126, objectFit: 'contain' }} />
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', mb: 1 }}>
                  Klinic<span style={{ color: defaultColor }}>Hub</span>
                </Typography>

                <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, mb: 4, px: 2 }}>
                  Set up your secure, all-in-one digital clinic workspace in seconds.
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Button
                    fullWidth size="large" variant="contained"
                    onClick={() => setMobileView('form')}
                    sx={{ borderRadius: '12px', py: 1.8, fontSize: '1.05rem', fontWeight: 700, bgcolor: defaultColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${defaultColor}` }}
                  >
                    Register New Clinic
                  </Button>

                  <Button
                    fullWidth size="large" variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: '12px', py: 1.8, fontSize: '1.05rem', fontWeight: 700, borderColor: '#475569', color: '#0f172a', textTransform: 'none', bgcolor: 'rgba(255,255,255,0.4)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}
                  >
                    Already have an account? Sign In
                  </Button>
                </Box>

                <Box onClick={() => setFeatureDrawerOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.2, px: 2.5, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'all 0.2s', '&:active': { transform: 'scale(0.97)' } }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: defaultColor }} />
                  <Typography variant="body2" fontWeight="700" color="#0f172a">See Why Clinics Choose KlinicHub</Typography>
                </Box>
              </Box>
            ) : null}

            {/* MAIN FORM CONTAINER */}
            <Box sx={{ display: { xs: mobileView === 'form' ? 'block' : 'none', lg: 'block' } }}>
              
              {/* Back Button (Only show if not on SUCCESS screen) */}
              {step !== 'SUCCESS' && (
                <Box sx={{ display: { xs: 'flex', lg: step === 'TYPE' ? 'none' : 'flex' }, mb: 2 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => {
                      if (step === 'OTP') {
                        setStep('FORM');
                        setSuccessMsg('');
                        setOtp('');
                      } else if (step === 'FORM') {
                        setStep('TYPE'); //  Go back to type selector
                      } else if (step === 'TYPE') {
                        setMobileView('welcome'); //  Go back to mobile welcome
                      }
                    }}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#0f172a', pl: 0 }}
                  >
                    Back
                  </Button>
                </Box>
              )}

              {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>{error}</Alert>}
              {successMsg && step !== 'SUCCESS' && <Alert severity="success" sx={{ borderRadius: 2, mb: 3 }}>{successMsg}</Alert>}

              {/*  =========================================================
                  STEP 1: CLINIC TYPE SELECTION
              ========================================================= */}
             {step === 'TYPE' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: defaultColor, letterSpacing: '-0.5px' }}>
                      Choose your specialty
                    </Typography>
                    <Typography color="text.secondary" fontWeight={500}>
                      We'll tailor your workspace and clinical charts to fit your practice perfectly.
                    </Typography>
                  </Box>

                  {/* ⚡️ COMPACT 2-COLUMN GRID TILES */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, // 1 column on mobile, 2 on desktop
                    gap: 1.5,
                    mt: 2
                  }}>
                    {CLINIC_TYPES.map((type) => {
                      const isSelected = formData.clinicType === type.id;
                      return (
                        <Paper
                          key={type.id}
                          elevation={0}
                          onClick={() => setFormData({ ...formData, clinicType: type.id })}
                          sx={{
                            p: 1.5, // Tighter padding
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: isSelected ? defaultColor : 'rgba(226, 232, 240, 0.8)',
                            bgcolor: isSelected ? `${defaultColor}10` : '#ffffff', // Hex with 10% opacity
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': {
                              borderColor: isSelected ? defaultColor : '#cbd5e1',
                              bgcolor: isSelected ? `${defaultColor}15` : '#f8fafc',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          {/* Premium Compact Icon Box */}
                          <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem',
                            bgcolor: isSelected ? `${defaultColor}25` : '#f1f5f9',
                            mr: 1.5, transition: 'all 0.2s ease'
                          }}>
                            {type.icon}
                          </Box>

                          {/* Text (No description to save vertical space) */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="800" color="#0f172a">
                              {type.label}
                            </Typography>
                          </Box>

                          {/* Checkbox / Radio Indicator */}
                          <Box sx={{
                            width: 20, height: 20, borderRadius: '50%',
                            border: '2px solid',
                            borderColor: isSelected ? defaultColor : '#cbd5e1',
                            bgcolor: isSelected ? defaultColor : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffffff' }} />}
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>

                  <Button 
                    fullWidth size="large" variant="contained" 
                    disabled={!formData.clinicType}
                    onClick={() => setStep('FORM')}
                    sx={{
                      borderRadius: '12px', py: 1.8, mt: 4, fontSize: '1rem', fontWeight: 700,
                      bgcolor: defaultColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${defaultColor}`,
                    }}
                  >
                    Continue
                  </Button>
                  
                  <Divider sx={{ my: 3, color: 'text.secondary', typography: 'body2' }}>OR</Divider>
                  
                  <Button
                    fullWidth onClick={() => navigate('/login')} variant="outlined"
                    sx={{ borderRadius: '12px', py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 600, borderColor: '#e2e8f0', color: '#475569', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}
                  >
                    Already have an account? Sign In
                  </Button>
                </>
              )}

              {/* =========================================================
                  STEP 2: REGISTRATION DETAILS
              ========================================================= */}
              {step === 'FORM' && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: defaultColor, letterSpacing: '-0.5px' }}>
                      Create Your Workspace
                    </Typography>
                    <Typography color="text.secondary" fontWeight={500}>
                      Set up your secure digital clinic in seconds.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleInitialSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField 
                      fullWidth 
                      placeholder={formData.clinicType ? `e.g. Apollo ${formData.clinicType.replace('_', ' ')}` : "e.g. Apollo Health"} 
                      label="Clinic Name" name="clinicName" sx={premiumInputSx} InputLabelProps={{ shrink: true }} required value={formData.clinicName} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }} 
                    />
                    <TextField fullWidth placeholder="e.g. Dr. Jane Doe" label="Your Full Name" name="fullName" sx={premiumInputSx} InputLabelProps={{ shrink: true }} required value={formData.fullName} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><PersonAddIcon color="action" /></InputAdornment> }} />
                    <TextField fullWidth placeholder="name@clinic.com" label="Email Address" name="email" type="email" sx={premiumInputSx} InputLabelProps={{ shrink: true }} required value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />
                    <TextField fullWidth placeholder="••••••••" label="Password" name="password" type="password" sx={premiumInputSx} InputLabelProps={{ shrink: true }} required value={formData.password} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }} />
                    <TextField fullWidth placeholder="••••••••" label="Confirm Password" name="confirmPassword" type="password" sx={premiumInputSx} InputLabelProps={{ shrink: true }} required value={formData.confirmPassword} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }} />

                    <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{
                      borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                      bgcolor: defaultColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${defaultColor}`,
                      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${defaultColor}` }
                    }}>
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Verify Email & Create Account"}
                    </Button>
                  </Box>
                </>
              )}

              {/* =========================================================
                  STEP 3: OTP VERIFICATION
              ========================================================= */}
              {step === 'OTP' && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: defaultColor, letterSpacing: '-0.5px' }}>
                      Verify Email
                    </Typography>
                    <Typography color="text.secondary" fontWeight={500}>
                      We sent a 6-digit secure code to <strong>{formData.email}</strong>.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleVerifyAndRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      fullWidth label="6-Digit OTP" required
                      sx={premiumInputSx} InputLabelProps={{ shrink: true }}
                      value={otp} onChange={(e) => setOtp(e.target.value)}
                      inputProps={{ maxLength: 6, style: { letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' } }}
                    />

                    <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{
                      borderRadius: '12px', py: 1.8, mt: 1, fontSize: '1rem', fontWeight: 700,
                      bgcolor: defaultColor, textTransform: 'none', boxShadow: `0 8px 24px -6px ${defaultColor}`,
                      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px -8px ${defaultColor}` }
                    }}>
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Verify & Complete Registration"}
                    </Button>

                    <Typography
                      textAlign="center" variant="body2"
                      sx={{ mt: 2, cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: defaultColor } }}
                      onClick={() => { setStep('FORM'); setSuccessMsg(''); }}
                    >
                      Wrong email? Go back and edit
                    </Typography>
                  </Box>
                </>
              )}

              {/* =========================================================
                  STEP 4: SUCCESS / PENDING ADMIN APPROVAL
              ========================================================= */}
              {step === 'SUCCESS' && (
                <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                  <Box sx={{ 
                    width: 80, height: 80, borderRadius: '50%', bgcolor: '#f0fdf4', border: '4px solid #dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#16a34a' }} />
                  </Box>
                  
                  <Typography variant="h4" fontWeight="900" sx={{ mb: 2, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Registration Successful!
                  </Typography>
                  
                  <Box sx={{ 
                    bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 3, p: 2, mb: 4,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
                  }}>
                    <HourglassEmptyIcon sx={{ color: '#d97706' }} />
                    <Typography variant="body2" color="#b45309" fontWeight="700">
                      Pending Admin Approval
                    </Typography>
                    <Typography variant="caption" color="#92400e" sx={{ lineHeight: 1.5 }}>
                      To ensure security, our admin team is reviewing your clinic workspace. Once approved, you will receive an email and can log in to configure your branches.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth size="large" variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderRadius: '12px', py: 1.5, fontSize: '1rem', fontWeight: 700,
                      bgcolor: '#0f172a', textTransform: 'none',
                      '&:hover': { bgcolor: '#334155' }
                    }}
                  >
                    Go to Login Page
                  </Button>
                </Box>
              )}

            </Box>
          </Box>
        </Box>
      </Box>

      {/* 3. MOBILE ONLY: Native Bottom Drawer for Features */}
      <MobileFeatureDrawer open={featureDrawerOpen} onClose={() => setFeatureDrawerOpen(false)} defaultColor={defaultColor} />
    </>
  );
}