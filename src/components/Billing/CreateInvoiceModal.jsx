import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Typography, Box, Stack, TextField, Divider, Paper, IconButton,
  FormControl, InputLabel, Select, MenuItem, Tooltip, Chip
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// IMPORT SERVICES
import { patientService } from '../../api/services/patientService';
import { invoiceService } from '../../api/services/invoiceService'; 
import api from '../../api/services/api'; 
import FactCheckIcon from '@mui/icons-material/FactCheck';

import { useToast } from '../../context/ToastContext';
import { useColorMode } from '../../context/ThemeContext';

export default function CreateInvoiceModal({ open, onClose, patientId, doctorId, onSuccess }) {
  const [treatments, setTreatments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Direct Item States
  const [proceduresList, setProceduresList] = useState([]);
  const [directItems, setDirectItems] = useState([]); 
  const [selectedProcedure, setSelectedProcedure] = useState('');

  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { primaryColor } = useColorMode();

  // OVERRIDE STATES
  const [overrideTarget, setOverrideTarget] = useState(null); 
  const [isOverriding, setIsOverriding] = useState(false);

  const clinicType = useSelector((state) => state.auth?.user?.clinicType) || 'General_Practice';

  // 1. Fetch Data on Open
  useEffect(() => {
    if (open && patientId) {
      // A. Fetch Unbilled Treatments for this Patient
      patientService.getById(patientId)
        .then(data => {
          // Fetch ALL unbilled treatments, regardless of status
          const unbilled = (data.treatmentPlan || []).filter(
            t => !t.billed
          );
          setTreatments(unbilled);
          
          // Only auto-select the ones that are actually 'Completed'
          const readyToBillIds = unbilled
            .filter(t => t.status === 'Completed')
            .map(t => t._id);
            
          setSelectedItems(readyToBillIds); 
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
    <>
      {/* =========================================================
          MAIN INVOICE MODAL
      ========================================================= */}
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
                          const isCompleted = row.status === 'Completed';
                          const isSelected = selectedItems.includes(row._id);

                          return (
                            <TableRow 
                              key={row._id}
                              sx={{ 
                                bgcolor: isCompleted ? 'inherit' : '#f8fafc',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              {/* CHECKBOX COLUMN */}
                              <TableCell padding="checkbox">
                                <Tooltip title={isCompleted ? "" : "Doctor must complete clinical charting first"}>
                                  <span> 
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={!isCompleted}
                                      onChange={() => handleSelect(row._id)}
                                      sx={{ 
                                        color: isCompleted ? 'primary.main' : '#cbd5e1',
                                        '&.Mui-disabled': { color: '#cbd5e1' }
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              </TableCell>
                              
                              {/* PROCEDURE DETAILS COLUMN */}
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={isCompleted ? "700" : "500"}
                                  color={isCompleted ? "#0f172a" : "#64748b"}
                                >
                                  {row.procedure}
                                </Typography>
                                
                                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                  <Chip 
                                    label={isCompleted ? "Ready to Bill" : row.status.toUpperCase()} 
                                    size="small" 
                                    sx={{ 
                                      height: 18, fontSize: '0.65rem', fontWeight: '800',
                                      bgcolor: isCompleted ? '#dcfce7' : '#f1f5f9',
                                      color: isCompleted ? '#166534' : '#64748b',
                                      border: isCompleted ? 'none' : '1px solid #cbd5e1'
                                    }} 
                                  />
                                  
                                  {/* THE HELPER TEXT & OVERRIDE BUTTON */}
                                  {!isCompleted && (
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                      <Typography variant="caption" color="error.main" fontWeight="700">
                                        • Awaiting Doctor
                                      </Typography>
                                      
                                      <Button 
                                        size="small" 
                                        variant="contained" 
                                        disableElevation
                                        startIcon={<FactCheckIcon sx={{ fontSize: '1rem !important' }} />}
                                        sx={{ 
                                          fontSize: '0.7rem', 
                                          py: 0.5, 
                                          px: 1.5,
                                          height: 28, 
                                          fontWeight: '800',
                                          bgcolor: '#fffbeb', 
                                          color: '#d97706', 
                                          border: '1px solid #fde68a',
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          transition: 'all 0.2s',
                                          '&:hover': {
                                            bgcolor: '#fef3c7',
                                            borderColor: '#fcd34d',
                                            transform: 'translateY(-1px)'
                                          }
                                        }}
                                        onClick={() => setOverrideTarget(row)}
                                      >
                                        Force Complete
                                      </Button>
                                    </Stack>
                                  )}
                                </Stack>
                              </TableCell>

                              {/* COST COLUMN */}
                              <TableCell align="right">
                                <Typography 
                                  variant="body2" 
                                  fontWeight="700"
                                  color={isCompleted ? "#0f172a" : "#94a3b8"}
                                >
                                  ₹{row.cost?.toLocaleString() || 0}
                                </Typography>
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

      {/* =========================================================
          ADMIN OVERRIDE WARNING MODAL
      ========================================================= */}
      <Dialog 
        open={Boolean(overrideTarget)} 
        onClose={() => setOverrideTarget(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚠️ Administrative Override
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
            You are about to mark <b>{overrideTarget?.procedure}</b> as completed on behalf of the doctor.
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
            <Typography variant="caption" color="#92400e" fontWeight="700">
              CLINICAL WARNING:
            </Typography>
            <Typography variant="caption" color="#92400e" display="block" sx={{ mt: 0.5 }}>
              This will update the patient's medical records and notify the doctor's dashboard that this treatment is finished. Are you sure you want to proceed without the doctor's clinical notes?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOverrideTarget(null)} sx={{ color: '#64748b', fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            disabled={isOverriding}
            sx={{ fontWeight: 'bold', boxShadow: 'none' }}
            onClick={async () => {
              setIsOverriding(true);
              try {
                // Ensure this route matches your backend! 
                await api.put(`/patients/${patientId}/treatments/${overrideTarget._id}`, {
                  status: 'Completed'
                });
                
                // 1. Instantly update the local state so the UI turns green
                setTreatments(prev => prev.map(t => 
                  t._id === overrideTarget._id ? { ...t, status: 'Completed' } : t
                ));
                
                // 2. Automatically check the box so it's ready to bill
                setSelectedItems(prev => [...prev, overrideTarget._id]);
                
                showToast('Treatment forcefully completed.', 'success');
                setOverrideTarget(null);
              } catch (err) {
                showToast('Failed to override treatment.', 'error');
              } finally {
                setIsOverriding(false);
              }
            }}
          >
            {isOverriding ? 'Updating...' : 'Yes, Force Complete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}