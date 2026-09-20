// src/components/Auth/ForgotPasswordFlow.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { authService } from '../../api/services/authService';

export default function ForgotPasswordFlow({ onCancel, defaultColor, premiumInputSx }) {
  // Internal views: 'EMAIL' -> 'OTP' -> 'NEW_PASSWORD'
  const [step, setStep] = useState('EMAIL');
  
  // State
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // A. Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setMessage({ type: 'error', text: 'Please enter your email.' });
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authService.requestOtp(resetEmail, 'PASSWORD_RESET');
      setMessage({ type: 'success', text: 'OTP sent! Please check your email.' });
      setStep('OTP');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP.' });
    } finally {
      setLoading(false);
    }
  };

  // B. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!resetOtp) return setMessage({ type: 'error', text: 'Please enter the 6-digit OTP.' });

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authService.verifyOtp(resetEmail, resetOtp, 'PASSWORD_RESET');
      setMessage({ type: 'success', text: 'OTP Verified! Enter your new password.' });
      setStep('NEW_PASSWORD');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid or expired OTP.' });
    } finally {
      setLoading(false);
    }
  };

  // C. Save New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });

    setLoading(true);
    try {
      await authService.resetPassword(resetEmail, resetOtp, newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully! You can now log in.' });
      
      // Auto-return to login screen after 2 seconds
      setTimeout(() => {
        onCancel();
      }, 2000);
      
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
      )}

      {/* --- STEP 1: EMAIL --- */}
      {step === 'EMAIL' && (
        <form onSubmit={handleRequestOtp}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Reset Password</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your registered email address to receive a secure OTP.
          </Typography>

          <TextField
            fullWidth label="Registered Email" type="email"
            sx={premiumInputSx} InputLabelProps={{ shrink: true }}
            value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2, height: 48, bgcolor: defaultColor }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification OTP'}
          </Button>
          <Typography textAlign="center" variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: defaultColor } }} onClick={onCancel}>
            Back to Login
          </Typography>
        </form>
      )}

      {/* --- STEP 2: OTP --- */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Enter OTP</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Code sent to <strong>{resetEmail}</strong>
          </Typography>

          <TextField
            fullWidth label="6-Digit OTP"
            sx={premiumInputSx} InputLabelProps={{ shrink: true }}
            value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} required
            inputProps={{ maxLength: 6, style: { letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' } }}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2, height: 48, bgcolor: defaultColor }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
          </Button>
          <Typography textAlign="center" variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: defaultColor } }} onClick={onCancel}>
            Cancel & Return to Login
          </Typography>
        </form>
      )}

      {/* --- STEP 3: NEW PASSWORD --- */}
      {step === 'NEW_PASSWORD' && (
        <form onSubmit={handleResetPassword}>
          <Typography variant="h6" fontWeight="bold" mb={1}>Create New Password</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter a strong new password for your account.
          </Typography>

          <TextField
            fullWidth label="New Password" type="password"
            sx={premiumInputSx} InputLabelProps={{ shrink: true }}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, height: 48, bgcolor: defaultColor }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
          </Button>
        </form>
      )}
    </Box>
  );
}