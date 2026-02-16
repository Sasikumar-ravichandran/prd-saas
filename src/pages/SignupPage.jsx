import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment, Alert, CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useColorMode } from '../context/ThemeContext';
import { authService } from '../api/services/authService';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clinicName: '',
    adminName: '',
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
      // Call API
      await authService.register(formData);
      // Redirect to Dashboard
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f8fafc', p: 2, width: '100vw'
    }}>
      <Paper elevation={3} sx={{
        width: '100%', maxWidth: 450, borderRadius: 3, overflow: 'hidden'
      }}>

        {/* HEADER */}
        <Box sx={{ bgcolor: primaryColor, p: 4, textAlign: 'center', color: 'white' }}>
          <Typography variant="h5" fontWeight="800">Start Your Trial</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Create your clinic workspace in seconds.
          </Typography>
        </Box>

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth label="Clinic Name" name="clinicName" placeholder="e.g. Apollo Dental" required
            value={formData.clinicName} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }}
          />

          <TextField
            fullWidth label="Your Full Name" name="adminName" placeholder="e.g. Dr. Rajesh" required
            value={formData.adminName} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonAddIcon color="action" /></InputAdornment> }}
          />

          <TextField
            fullWidth label="Email Address" name="email" type="email" required
            value={formData.email} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
          />

          <TextField
            fullWidth label="Password" name="password" type="password" required
            value={formData.password} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
          />

          <TextField
            fullWidth label="Confirm Password" name="confirmPassword" type="password" required
            value={formData.confirmPassword} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 'bold', mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Clinic"}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account? <a href="/login" style={{ color: primaryColor, fontWeight: 'bold', textDecoration: 'none' }}>Login</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}