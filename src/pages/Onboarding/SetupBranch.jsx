import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, Stack,
  InputAdornment, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { useColorMode } from '../../context/ThemeContext';
import api from '../../api/services/api';

export default function SetupBranch() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    phone: ''
  });

  console.log(primaryColor,'@@@')

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

      // Update the fields for the app context
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
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f8fafc', p: 2, width: '100vw'
    }}>
      <Paper elevation={3} sx={{
        width: '100%', maxWidth: 450, borderRadius: 3, overflow: 'hidden'
      }}>

        {/* HEADER - Matching SignupPage */}
        <Box sx={{ bgcolor: primaryColor, p: 4, textAlign: 'center', color: 'white' }}>
          <Typography variant="h5" fontWeight="800">Final Step</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Setup your main branch to access your dashboard. <br />
            <strong>Details can be changed later in settings.</strong>
          </Typography>
        </Box>

        {/* FORM - Matching SignupPage padding and gap */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          <TextField
            fullWidth
            label="Branch Name"
            name="branchName"
            placeholder="e.g. Anna Nagar Branch"
            required
            value={formData.branchName}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            placeholder="Street, City, Zip Code"
            required
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <LocationOnIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label="Phone Number (Optional)"
            name="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              bgcolor: primaryColor,
              py: 1.5,
              fontWeight: 'bold',
              mt: 1,
              '&:hover': { bgcolor: primaryColor, opacity: 0.9 }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Setup"}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Need help? <a href="#" style={{ color: primaryColor, fontWeight: 'bold', textDecoration: 'none' }}>Contact Support</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}