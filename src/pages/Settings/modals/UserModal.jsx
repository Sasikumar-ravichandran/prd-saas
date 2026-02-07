import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, IconButton, Typography, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function UserModal({ open, onClose, onSave, user, primaryColor }) {
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Doctor', status: 'Active'
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ name: '', email: '', role: 'Doctor', status: 'Active' });
    }
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          {user ? 'Edit User' : 'Invite New User'}
        </Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField 
              fullWidth label="Full Name" name="name" 
              value={formData.name} onChange={handleChange} 
              placeholder="e.g. Dr. Ramesh"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth label="Email Address" name="email" type="email"
              value={formData.email} onChange={handleChange} 
              placeholder="e.g. ramesh@clinic.com"
            />
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Administrator">Administrator</MenuItem>
                <MenuItem value="Nurse">Nurse</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending Invite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => onSave(formData)}
          sx={{ bgcolor: primaryColor, px: 4, fontWeight: 'bold' }}
        >
          {user ? 'Save Changes' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}