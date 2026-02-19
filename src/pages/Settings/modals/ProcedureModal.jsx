import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, InputAdornment, IconButton, Typography, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ⚡️ Categories List (Matches your Backend Enum)
const CATEGORIES = [
  'General', 'Consultation', 'Endodontics', 'Orthodontics', 'Surgery', 'Prosthetics', 'Pediatrics'
];

export default function ProcedureModal({ open, onClose, onSave, procedure, primaryColor }) {
  
  // 1. Updated State to match new Schema
  const [formData, setFormData] = useState({
    code: '', 
    name: '', 
    category: 'General', // Default
    price: '', 
    labCost: '', // ⚡️ NEW: Critical for Net Revenue
    active: true
  });

  useEffect(() => {
    if (open) {
      if (procedure) {
        setFormData({
            code: procedure.code || '',
            name: procedure.name || '',
            category: procedure.category || 'General',
            price: procedure.price || '',
            labCost: procedure.labCost || '', // Load existing value
            active: procedure.isActive ?? true
        });
      } else {
        // Reset for New Entry
        setFormData({ 
            code: '', 
            name: '', 
            category: 'General', 
            price: '', 
            labCost: '', 
            active: true 
        });
      }
    }
  }, [procedure, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
      e.preventDefault(); // Prevent page reload
      onSave({
          ...formData,
          // Ensure numbers are numbers
          price: Number(formData.price),
          labCost: Number(formData.labCost)
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {procedure ? 'Edit Procedure' : 'Add New Procedure'}
            </Typography>
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              
              {/* Row 1: Code & Category */}
              <Grid item xs={4}>
                <TextField 
                    fullWidth 
                    label="Code" 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    placeholder="RCT-01" 
                    InputLabelProps={{ shrink: true }}
                    required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField 
                    select 
                    fullWidth 
                    label="Category" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                >
                    {CATEGORIES.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </TextField>
              </Grid>

              {/* Row 2: Name */}
              <Grid item xs={12}>
                <TextField 
                    fullWidth 
                    label="Procedure Name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Root Canal Treatment (Molar)" 
                    InputLabelProps={{ shrink: true }}
                    required
                />
              </Grid>

              {/* Row 3: Financials */}
              <Grid item xs={6}>
                <TextField 
                    fullWidth 
                    label="Patient Price" 
                    name="price" 
                    type="number" 
                    value={formData.price} 
                    onChange={handleChange} 
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} 
                    InputLabelProps={{ shrink: true }}
                    required
                />
              </Grid>
              
              {/* ⚡️ NEW: Lab Cost Field */}
              <Grid item xs={6}>
                <TextField 
                    fullWidth 
                    label="Est. Lab Cost" 
                    name="labCost" 
                    type="number" 
                    value={formData.labCost} 
                    onChange={handleChange} 
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} 
                    InputLabelProps={{ shrink: true }}
                    helperText="Deducted before calculating commission"
                />
              </Grid>

            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
            <Button 
                type="submit" 
                variant="contained" 
                sx={{ bgcolor: primaryColor, px: 4, fontWeight: 'bold', '&:hover': { bgcolor: primaryColor } }}
            >
              Save Procedure
            </Button>
          </DialogActions>
      </form>
    </Dialog>
  );
}