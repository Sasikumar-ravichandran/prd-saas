import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Stack, InputAdornment 
} from '@mui/material';
import { expenseService } from '../../api/services/expenseService';
import { useToast } from '../../context/ToastContext';

export default function AddExpenseModal({ open, onClose, onSuccess, expenseToEdit }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '', category: 'Office Supplies', vendor: '', paymentMethod: 'Bank Transfer'
  });

  const categories = ['Office Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Dental Materials', 'Maintenance', 'Other'];
  const methods = ['Cash', 'UPI', 'Bank Transfer', 'Card'];

  //  Pre-fill form if editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'Office Supplies',
        vendor: expenseToEdit.vendor || '',
        paymentMethod: expenseToEdit.paymentMethod || 'Bank Transfer'
      });
    } else {
      setFormData({ amount: '', category: 'Office Supplies', vendor: '', paymentMethod: 'Bank Transfer' });
    }
  }, [expenseToEdit, open]);

  const handleSubmit = async () => {
    if (!formData.amount) {
      showToast('Please enter an amount', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, amount: Number(formData.amount) };

      if (expenseToEdit) {
        await expenseService.update(expenseToEdit._id, payload);
        showToast('Expense updated successfully', 'success');
      } else {
        await expenseService.create(payload);
        showToast('Expense added successfully', 'success');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight="800" sx={{ borderBottom: '1px solid #e2e8f0', pb: 1.5 }}>
        {expenseToEdit ? 'Edit Expense' : 'Record New Expense'}
      </DialogTitle>
      <DialogContent sx={{ pt: '24px !important' }}>
        <Stack spacing={2.5}>
          <TextField 
            label="Amount" type="number" fullWidth 
            value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField select label="Category" fullWidth value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
          <TextField 
            label="Vendor / Description" placeholder="e.g., Dental Depot" fullWidth 
            value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} 
          />
          <TextField select label="Payment Method" fullWidth value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
            {methods.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ fontWeight: 700, px: 3 }}>
          {loading ? 'Saving...' : (expenseToEdit ? 'Update Expense' : 'Save Expense')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}