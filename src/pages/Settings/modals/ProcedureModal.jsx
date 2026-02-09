import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, InputAdornment, IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ProcedureModal({ open, onClose, onSave, procedure, primaryColor }) {
  const [formData, setFormData] = useState({
    code: '', name: '', price: '',  commission: 0,  active: true
  });

  useEffect(() => {
    if (procedure) {
      setFormData(procedure);
    } else {
      setFormData({ code: '', name: '', price: '', commission: 0, active: true });
    }
  }, [procedure, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          {procedure ? 'Edit Procedure' : 'Add New Procedure'}
        </Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField fullWidth label="Code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. RCT-01" />
          </Grid>
          <Grid item xs={8}>
            <TextField fullWidth label="Procedure Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Root Canal" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Standard Price" name="price" type="number" value={formData.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
           {/* <Grid item xs={6}>
            <TextField fullWidth label="Lab Cost (Est)" name="lab" type="number" value={formData.lab} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid> */}
          <Grid item xs={6}>
            <TextField fullWidth label="Doctor Commission" name="commission" type="number" value={formData.commission} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField fullWidth label="Tax Rate" name="tax" type="number" value={formData.tax} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid> */}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={() => onSave(formData)} sx={{ bgcolor: primaryColor, px: 4, fontWeight: 'bold' }}>
          Save Procedure
        </Button>
      </DialogActions>
    </Dialog>
  );
}