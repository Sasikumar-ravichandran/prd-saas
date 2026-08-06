import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Stack, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, ToggleButtonGroup, ToggleButton,
  TablePagination, Grid
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { financialService } from '../../api/services/financialService';
import { expenseService } from '../../api/services/expenseService';
import { useToast } from '../../context/ToastContext';
import AddExpenseModal from '../../pages/modal/AddExpenseModal';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import StatsCardSkeleton from '../../components/Skeletons/StatsCardSkeleton';
import TableSkeleton from '../../components/Skeletons/TableSkeleton';


export default function FinancialLedgerPage() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], metrics: { totalIncome: 0, totalExpense: 0, netProfit: 0 } });
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    filterType: 'All'
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const res = await financialService.getLedger(filters);
      setData(res);
      setPage(0); // Reset to first page on filter change
    } catch (error) {
      showToast(error?.message || "Failed to load financials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFinancials(); }, [filters]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const executeDelete = async () => {
    try {
      await expenseService.delete(deleteConfirm.id);
      showToast("Expense deleted", "success");
      loadFinancials();
    } catch (error) {
      showToast(error?.message || "Failed to delete", "error");
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  // Pagination Logic
  const paginatedData = data.transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ p: 1, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

        <Box sx={{ p: 1, maxWidth: '1600px' }}>
          <Stack spacing={4}>
            <StatsCardSkeleton count={4} />
            
            <Box sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <TableSkeleton rowCount={5} columnCount={4} />
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* HEADER */}
      <Stack direction="row"
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
      >
        <Box sx={{ textAlign: 'start' }}>
          <Typography variant="h5" fontWeight="800" color={primaryColor}>Financial Ledger</Typography>
          <Typography variant="body2" color="#64748b" fontWeight="600">Unified cash flow statement.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => { setExpenseToEdit(null); setModalOpen(true); }} 
          sx={{ bgcolor: primaryColor, borderRadius: 2, px: { xs: 2, sm: 3 } }}
        >
          Add Expense
        </Button>
      </Stack>

      {/* METRIC CARDS */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(3, 1fr)' }, 
          gap: 2, 
          mb: 1 
        }}
      >
        <MetricCard label="TOTAL INCOME" value={data.metrics.totalIncome} icon={<TrendingUpIcon />} color="#10b981" />
        
        <MetricCard label="TOTAL EXPENSE" value={data.metrics.totalExpense} icon={<TrendingDownIcon />} color="#dc2626" />
        
        <Box sx={{ gridColumn: { xs: 'span 2', lg: 'span 1' } }}>
          <MetricCard label="NET PROFIT" value={data.metrics.netProfit} icon={<SavingsIcon />} color={primaryColor} />
        </Box>
      </Box>

      {/* FILTER BAR */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} />
        <ToggleButtonGroup value={filters.filterType} exclusive onChange={(e, val) => val && setFilters({ ...filters, filterType: val })} size="small">
          <ToggleButton value="All" sx={{ px: 2 }}>All</ToggleButton>
          <ToggleButton value="Payment" sx={{ px: 2 }}>Income</ToggleButton>
          <ToggleButton value="Expense" sx={{ px: 2 }}>Expense</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* DATA TABLE */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['DATE', 'TYPE', 'DETAILS', 'METHOD', 'AMOUNT', 'ACTIONS'].map(h =>
                    <TableCell key={h} sx={{ fontWeight: 800, color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.7rem', letterSpacing: '0.1em' }}>{h}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                      No transactions found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((tx) => (
                    <TableRow key={tx._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 2, color: '#475569', fontWeight: 600 }}>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell>
                        <Chip label={tx.type} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: tx.type === 'Payment' ? '#ecfdf5' : '#fef2f2', color: tx.type === 'Payment' ? '#059669' : '#dc2626' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="800" color="#0f172a">{tx.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{tx.category}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>{tx.method}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: tx.type === 'Expense' ? '#dc2626' : '#10b981', fontFamily: 'monospace', fontSize: '1rem' }}>
                        {tx.type === 'Expense' ? '-' : '+'} ₹{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        {tx.type === 'Expense' && (
                          <Stack direction="row">
                            <IconButton size="small" onClick={() => { setExpenseToEdit(tx); setModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, id: tx._id })}><DeleteIcon fontSize="small" /></IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* PAGINATION */}
            <TablePagination
              component="div"
              count={data.transactions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </TableContainer>
        )}
      </Paper>

      {/* MODALS */}
      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadFinancials} expenseToEdit={expenseToEdit} />
      <DeleteConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} onConfirm={executeDelete} />
    </Box>
  );
}

const MetricCard = ({ label, value, icon, color }) => (
  <Paper elevation={0} sx={{ p: 3, flex: 1, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color }}>{icon}</Box>
    <Box>
      <Typography variant="caption" fontWeight="800" color="#94a3b8">{label}</Typography>
      <Typography variant="h4" fontWeight="800" sx={{ color }}>₹ {value.toLocaleString()}</Typography>
    </Box>
  </Paper>
);

const DeleteConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmberIcon color="error" /> Delete Expense?</DialogTitle>
    <DialogContent><Typography>Are you sure? This action cannot be undone.</Typography></DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained" disableElevation>Yes, Delete</Button>
    </DialogActions>
  </Dialog>
);