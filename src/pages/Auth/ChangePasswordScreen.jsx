import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, TextField, Button, Alert, Container 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../../api/services/api'; 

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  // REMOVED: const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Call the backend
      // Note: This relies on your axios 'api' instance automatically attaching 
      // the token we saved in LoginPage (via localStorage or cookies)
      const { data } = await api.put('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      // 2. SUCCESS: Manually update Local Storage
      // The backend should return the updated user object + token without the flag
      localStorage.setItem("user", JSON.stringify(data));
      
      // If you store token separately:
      // localStorage.setItem("token", data.token);

      // 3. Redirect to Dashboard
      // Using window.location ensures a full refresh to pick up new state
      window.location.href = "/"; 
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Box sx={{ m: 1, bgcolor: 'warning.light', p: 1.5, borderRadius: '50%' }}>
           <LockResetIcon fontSize="large" sx={{ color: 'warning.dark' }} />
        </Box>
        
        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Set New Password
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          For security, you must change your default password before continuing.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Current (Default) Password"
            type="password"
            value={formData.oldPassword}
            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? 'Updating...' : 'Update Password & Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}