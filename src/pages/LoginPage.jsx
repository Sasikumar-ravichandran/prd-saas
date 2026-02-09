import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Tabs, Tab, 
  InputAdornment, Alert, CircularProgress 
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import DomainIcon from '@mui/icons-material/Domain';
import { useColorMode } from '../context/ThemeContext';
import { authService } from '../api/services/authService';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0 = Admin, 1 = Staff
  const [formData, setFormData] = useState({ email: '', password: '', clinicShortId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean payload based on role
      const payload = {
        email: formData.email,
        password: formData.password,
        // Only send Clinic ID if it's the Staff Tab
        clinicShortId: tab === 1 ? formData.clinicShortId : undefined 
      };

      await authService.login(payload);
      // If success, redirect to dashboard
      window.location.href = "/"; 
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      bgcolor: '#f1f5f9', p: 2 
    }}>
      <Paper elevation={4} sx={{ 
        width: '100%', maxWidth: 400, borderRadius: 3, overflow: 'hidden' 
      }}>
        
        {/* HEADER */}
        <Box sx={{ bgcolor: primaryColor, p: 4, textAlign: 'center', color: 'white' }}>
           <Typography variant="h5" fontWeight="800">DentalApp</Typography>
           <Typography variant="caption" sx={{ opacity: 0.9 }}>Practice Management System</Typography>
        </Box>

        {/* TABS */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          variant="fullWidth" 
          sx={{ borderBottom: '1px solid #e2e8f0' }}
        >
           <Tab label="Clinic Admin" sx={{ fontWeight: 'bold' }} />
           <Tab label="Staff Member" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
           
           {error && <Alert severity="error">{error}</Alert>}

           {/* Clinic ID - ONLY FOR STAFF */}
           {tab === 1 && (
             <TextField
               fullWidth label="Clinic ID" placeholder="e.g. CL-8821" required
               value={formData.clinicShortId}
               onChange={(e) => setFormData({...formData, clinicShortId: e.target.value})}
               InputProps={{
                 startAdornment: <InputAdornment position="start"><DomainIcon color="action"/></InputAdornment>,
               }}
             />
           )}

           <TextField
             fullWidth label="Email Address" type="email" required
             value={formData.email}
             onChange={(e) => setFormData({...formData, email: e.target.value})}
             InputProps={{
               startAdornment: <InputAdornment position="start"><EmailIcon color="action"/></InputAdornment>,
             }}
           />

           <TextField
             fullWidth label="Password" type="password" required
             value={formData.password}
             onChange={(e) => setFormData({...formData, password: e.target.value})}
             InputProps={{
               startAdornment: <InputAdornment position="start"><LockIcon color="action"/></InputAdornment>,
             }}
           />

           <Button 
             type="submit" 
             variant="contained" 
             size="large" 
             disabled={loading}
             startIcon={!loading && <LoginIcon />}
             sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 'bold', mt: 1 }}
           >
             {loading ? <CircularProgress size={24} color="inherit" /> : "Login Securely"}
           </Button>

           {tab === 0 && (
             <Typography variant="caption" align="center" color="text.secondary">
                Don't have a clinic? <a href="/signup" style={{ color: primaryColor, fontWeight: 'bold' }}>Register Here</a>
             </Typography>
           )}
        </Box>
      </Paper>
    </Box>
  );
}