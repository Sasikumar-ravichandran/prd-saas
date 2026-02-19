import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Typography, Box, Stack, TextField, Chip, Divider, Paper
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import api from '../../api/services/api'; // Your Axios instance
import { useToast } from '../../context/ToastContext';
import { useColorMode } from '../../context/ThemeContext';

export default function CreateInvoiceModal({ open, onClose, patientId, doctorId, onSuccess }) {
  const [treatments, setTreatments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const { primaryColor } = useColorMode();

  // 1. Fetch Unbilled Treatments for this Patient
  useEffect(() => {
    if (open && patientId) {
      // Assuming you have an endpoint to get patient details including treatment plan
      api.get(`/patients/${patientId}`)
        .then(res => {
          // Filter only treatments that are completed but NOT billed yet
          const unbilled = (res.data.treatmentPlan || []).filter(
            t => t.status === 'Completed' && !t.billed
          );
          setTreatments(unbilled);
        })
        .catch(err => console.error("Error fetching treatments", err));
    }
  }, [open, patientId]);

  // 2. Handle Checkbox Selection
  const handleSelect = (id) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedItems, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedItems.slice(1));
    } else if (selectedIndex === selectedItems.length - 1) {
      newSelected = newSelected.concat(selectedItems.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedItems.slice(0, selectedIndex),
        selectedItems.slice(selectedIndex + 1),
      );
    }
    setSelectedItems(newSelected);
  };

  // 3. Calculate Totals
  const selectedTreatments = treatments.filter(t => selectedItems.includes(t._id));
  const subTotal = selectedTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
  const finalTotal = Math.max(0, subTotal - discount);

  // 4. Submit Invoice
  const handleCreateInvoice = async () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one treatment to bill', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Prepare the payload for your new createInvoice controller
      const payload = {
        patientId,
        doctorId, // Passed from parent (who performed these treatments)
        items: selectedTreatments.map(t => ({
          treatmentId: t._id,
          procedureName: t.procedure,
          cost: t.cost
        })),
        discount: Number(discount),
        notes,
        dueDate: new Date() // Default to due today
      };

      await api.post('/invoices', payload);
      
      showToast('Invoice generated successfully!', 'success');
      onSuccess(); // Refresh parent data
      onClose();   // Close modal
      
      // Reset State
      setSelectedItems([]);
      setDiscount(0);
      setNotes('');
    } catch (error) {
      console.error("Invoice Error:", error);
      showToast('Failed to generate invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #f1f5f9' }}>
        <ReceiptLongIcon sx={{ color: primaryColor }} />
        <Typography variant="h6" fontWeight="800">Generate Invoice</Typography>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 400, p: 0 }}>
        <Stack direction="row" sx={{ height: '100%' }}>
          
          {/* LEFT: Treatment Selection List */}
          <Box sx={{ flex: 2, p: 2, borderRight: '1px solid #f1f5f9' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Select Completed Treatments
            </Typography>
            
            {treatments.length === 0 ? (
               <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #e2e8f0' }}>
                 <Typography color="text.secondary">No unbilled treatments found.</Typography>
               </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell>Procedure</TableCell>
                      <TableCell align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treatments.map((row) => {
                      const isSelected = selectedItems.indexOf(row._id) !== -1;
                      return (
                        <TableRow 
                          hover 
                          key={row._id} 
                          role="checkbox" 
                          selected={isSelected}
                          onClick={() => handleSelect(row._id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">{row.procedure}</Typography>
                            <Typography variant="caption" color="text.secondary">Tooth: {row.tooth || 'General'}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">₹{row.cost}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* RIGHT: Invoice Summary Panel */}
          <Box sx={{ flex: 1, p: 3, bgcolor: '#fbfcfd' }}>
            <Typography variant="subtitle1" fontWeight="800" gutterBottom>Summary</Typography>
            
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal ({selectedItems.length} items):</Typography>
                <Typography fontWeight="600">₹{subTotal}</Typography>
              </Stack>

              <TextField 
                label="Discount Amount" 
                size="small" 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(e.target.value)}
                InputProps={{ startAdornment: <Typography color="text.secondary" mr={1}>₹</Typography> }}
              />

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="800" color="primary">Total:</Typography>
                <Typography variant="h5" fontWeight="900" color="primary">₹{finalTotal}</Typography>
              </Stack>

              <TextField
                label="Invoice Notes"
                multiline rows={3}
                placeholder="Payment terms, insurance details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleCreateInvoice} 
          disabled={loading || selectedItems.length === 0}
          sx={{ bgcolor: primaryColor, px: 4, fontWeight: 'bold' }}
        >
          {loading ? 'Generating...' : 'Create Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}