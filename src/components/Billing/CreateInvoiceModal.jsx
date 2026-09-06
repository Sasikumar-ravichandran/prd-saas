import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Typography, Box, Stack, TextField, Divider, Paper, IconButton,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// IMPORT SERVICES
import { patientService } from '../../api/services/patientService';
import { invoiceService } from '../../api/services/invoiceService'; 
import api from '../../api/services/api'; // Added for procedures

import { useToast } from '../../context/ToastContext';
import { useColorMode } from '../../context/ThemeContext';

export default function CreateInvoiceModal({ open, onClose, patientId, doctorId, onSuccess }) {
  const [treatments, setTreatments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // NEW: Direct Item States
  const [proceduresList, setProceduresList] = useState([]);
  const [directItems, setDirectItems] = useState([]); 
  const [selectedProcedure, setSelectedProcedure] = useState('');

  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { primaryColor } = useColorMode();

  const clinicType = useSelector((state) => state.auth?.user?.clinicType) || 'General_Practice';

  // 1. Fetch Data on Open
  useEffect(() => {
    if (open && patientId) {
      // A. Fetch Unbilled Treatments for this Patient
      patientService.getById(patientId)
        .then(data => {
          const unbilled = (data.treatmentPlan || []).filter(
            t => t.status === 'Completed' && !t.billed
          );
          setTreatments(unbilled);
          setSelectedItems(unbilled.map(t => t._id)); // Auto-select all
        })
        .catch(err => console.error("Error fetching treatments", err));

      // B. Fetch Clinic Procedures for Ad-Hoc additions
      api.get('/procedures')
        .then(res => {
          const activeProcedures = (res.data || []).filter(p => p.isActive !== false);
          setProceduresList(activeProcedures);
        })
        .catch(err => console.error("Error fetching procedures", err));

    } else {
      // Clean up when modal closes
      setTreatments([]);
      setSelectedItems([]);
      setDirectItems([]);
      setSelectedProcedure('');
      setDiscount(0);
      setNotes('');
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

  // 3. Handle Direct Add Item
  const handleAddDirectItem = () => {
    const proc = proceduresList.find(p => p.name === selectedProcedure);
    if (proc) {
      setDirectItems([
        ...directItems,
        { id: Date.now(), procedure: proc.name, cost: proc.price }
      ]);
      setSelectedProcedure(''); // Reset dropdown
    }
  };

  const handleRemoveDirectItem = (idToRemove) => {
    setDirectItems(directItems.filter(item => item.id !== idToRemove));
  };

  // 4. Calculate Totals (Combined)
  const selectedTreatments = treatments.filter(t => selectedItems.includes(t._id));
  const planTotal = selectedTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
  const directTotal = directItems.reduce((sum, t) => sum + (t.cost || 0), 0);
  
  const subTotal = planTotal + directTotal;
  const finalTotal = Math.max(0, subTotal - discount);

  // 5. Submit Invoice
  const handleCreateInvoice = async () => {
    if (selectedItems.length === 0 && directItems.length === 0) {
      showToast('Please add at least one item to bill', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientId,
        doctorId,
        items: [
          // Items from Charting
          ...selectedTreatments.map(t => ({
            treatmentId: t._id,
            procedureName: t.procedure,
            cost: t.cost
          })),
          // Directly added items (Consultations, Walk-ins)
          ...directItems.map(d => ({
            procedureName: d.procedure,
            cost: d.cost
          }))
        ],
        discount: Number(discount),
        notes,
        dueDate: new Date()
      };

      await invoiceService.create(payload);

      showToast('Invoice generated successfully!', 'success');
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Invoice Error:", error);
      showToast('Failed to generate invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: primaryColor }} />
          <Typography variant="h6" fontWeight="800">Generate Invoice</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 400, p: 0 }}>
        <Stack direction="row" sx={{ height: '100%', display: { xs: 'column', md: 'row' } }}>

          {/* LEFT: Treatment Selection & Direct Add */}
          <Box sx={{ flex: 2, p: 2, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* --- SECTION 1: DIRECT ADD FOR WALK-INS --- */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Directly Add Item (Walk-ins / Consults)
              </Typography>
              <Stack direction="row" spacing={1}>
                <FormControl fullWidth size="small">
                  <InputLabel id="direct-procedure-label">Select Procedure</InputLabel>
                  <Select
                    labelId="direct-procedure-label"
                    value={selectedProcedure}
                    label="Select Procedure"
                    onChange={(e) => setSelectedProcedure(e.target.value)}
                  >
                    {proceduresList.length === 0 ? (
                      <MenuItem disabled>Loading procedures...</MenuItem>
                    ) : (
                      proceduresList.map((proc) => (
                        <MenuItem key={proc._id} value={proc.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{proc.name}</Typography>
                          <Typography variant="caption" fontWeight="bold">₹{proc.price}</Typography>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  onClick={handleAddDirectItem} 
                  disabled={!selectedProcedure}
                  sx={{ minWidth: 80 }}
                >
                  Add
                </Button>
              </Stack>

              {/* List Directly Added Items */}
              {directItems.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {directItems.map((item) => (
                    <Paper key={item.id} elevation={0} sx={{ p: 1, px: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="600">{item.procedure}</Typography>
                        <Typography variant="caption" color="text.secondary">Direct Entry</Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" fontWeight="700">₹{item.cost}</Typography>
                        <IconButton size="small" color="error" onClick={() => handleRemoveDirectItem(item.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* --- SECTION 2: CHARTED TREATMENTS --- */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Charted Treatments (Unbilled)
              </Typography>

              {treatments.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #e2e8f0' }}>
                  <Typography color="text.secondary" variant="body2">No unbilled charted treatments.</Typography>
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
                        const regionLabel = row.region || row.tooth || 'General';
                        const displayLabel = clinicType === 'Dental' ? `Tooth: ${regionLabel}` : `Area: ${regionLabel}`;

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
                              <Typography variant="caption" color="text.secondary">{displayLabel}</Typography>
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

          </Box>

          {/* RIGHT: Invoice Summary Panel */}
          <Box sx={{ flex: 1, p: 3, bgcolor: '#fbfcfd' }}>
            <Typography variant="subtitle1" fontWeight="800" gutterBottom>Summary</Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Total Items ({selectedItems.length + directItems.length}):</Typography>
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
          disabled={loading || (selectedItems.length === 0 && directItems.length === 0)}
          sx={{ bgcolor: primaryColor, px: 4, fontWeight: 'bold' }}
        >
          {loading ? 'Generating...' : 'Create Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}