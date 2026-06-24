import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, Stack, TextField, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, CircularProgress, Alert, IconButton,
  // ⚡️ IMPORT DIALOG COMPONENTS FOR THE DELETE MODAL
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { expenseService } from '../../api/services/expenseService';
import { useToast } from '../../context/ToastContext';
import AddExpenseModal from '../../pages/modal/AddExpenseModal';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // ⚡️ SaaS Touch

export default function ExpensesPage() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ expenses: [], totalAmount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null); 

  // ⚡️ STATE FOR THE DELETE DIALOG
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'All Categories'
  });

  const categories = ['All Categories', 'Office Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Dental Materials', 'Maintenance', 'Other'];

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getAll(filters);
      setData(res);
    } catch (error) {
      showToast(error || "Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, [filters.startDate, filters.endDate, filters.category]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleEdit = (expense) => {
    setExpenseToEdit(expense);
    setModalOpen(true);
  };

  // ⚡️ 1. OPEN THE DIALOG INSTEAD OF WINDOW.CONFIRM
  const triggerDelete = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  // ⚡️ 2. EXECUTE THE ACTUAL API DELETION
  const executeDelete = async () => {
    try {
      await expenseService.delete(deleteConfirm.id);
      
      showToast("Expense deleted successfully", "success");
      loadExpenses();
    } catch (error) {
      console.error("FULL DELETE ERROR:", error);
      showToast(error.response?.data?.message || "Failed to delete expense", "error");
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  return (
    <Box sx={{p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} spacing={2}>
        <Box sx={{textAlign: 'start'}}>
          <Typography variant="h5" fontWeight="800" color={primaryColor}>Expense Ledger</Typography>
          <Typography variant="body2" color="#64748b" fontWeight="600">Track and manage all clinic outflows.</Typography>
        </Box>
        <Button 
          variant="contained" startIcon={<AddIcon />} 
          onClick={() => { setExpenseToEdit(null); setModalOpen(true); }}
          sx={{ bgcolor: primaryColor, fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}
        >
          Add New Expense
        </Button>
      </Stack>

      {/* DASHBOARD CARDS */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={3} alignItems="stretch">
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px', bgcolor: 'white' }}>
          <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: 2, color: '#dc2626', display: 'flex' }}>
            <AccountBalanceWalletIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="800" color="#94a3b8">FILTERED TOTAL</Typography>
            <Typography variant="h4" fontWeight="800" color="#dc2626">₹ {data.totalAmount.toLocaleString()}</Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', flexGrow: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'white' }}>
          <TextField label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" sx={{ flexGrow: 1, minWidth: '150px' }} />
          <TextField label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" sx={{ flexGrow: 1, minWidth: '150px' }} />
          <TextField select label="Category" name="category" value={filters.category} onChange={handleFilterChange} size="small" sx={{ flexGrow: 2, minWidth: '200px' }}>
            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
        </Paper>
      </Stack>

      {/* DATA TABLE */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress sx={{ color: primaryColor }} /></Box>
        ) : data.expenses.length === 0 ? (
          <Box sx={{ p: 5 }}><Alert severity="info" sx={{ borderRadius: 2 }}>No expenses found for this date range.</Alert></Box>
        ) : (
          <TableContainer sx={{ maxHeight: '600px', overflowY: 'auto', bgcolor: 'white' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['DATE', 'CATEGORY', 'VENDOR / DETAILS', 'LOGGED BY', 'METHOD', 'AMOUNT', 'ACTIONS'].map(head => (
                    <TableCell key={head} sx={{ fontWeight: '800', color: '#64748b', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.expenses.map((expense) => (
                  <TableRow key={expense._id} hover>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#334155' }}>
                      {new Date(expense.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Chip label={expense.category} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a' }}>{expense.vendor || '-'}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', fontWeight: 500, color: '#64748b' }}>
                      {expense.recordedBy?.fullName || expense.recordedBy?.name || 'Unknown'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#475569' }}>{expense.paymentMethod}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#dc2626' }}>₹ {expense.amount.toLocaleString()}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleEdit(expense)} sx={{ color: '#3b82f6' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {/* ⚡️ TRIGGER CUSTOM MODAL */}
                        <IconButton size="small" onClick={() => triggerDelete(expense._id)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* MODALS */}
      <AddExpenseModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={loadExpenses} 
        expenseToEdit={expenseToEdit} 
      />

      {/* ⚡️ NEW: PROFESSIONAL DELETE CONFIRMATION DIALOG */}
      <Dialog 
        open={deleteConfirm.open} 
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: 3, padding: 1, minWidth: '350px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: '#0f172a' }}>
          <WarningAmberIcon color="error" /> Delete Expense?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to permanently delete this expense? This action cannot be undone and will affect your clinic's P&L reports.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, id: null })} 
            sx={{ fontWeight: 700, color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={executeDelete} 
            variant="contained" 
            color="error"
            disableElevation
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
}