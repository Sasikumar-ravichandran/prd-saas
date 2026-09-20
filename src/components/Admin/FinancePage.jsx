import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Stack, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, ToggleButtonGroup, ToggleButton,
  TablePagination
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { financialService } from '../../api/services/financialService';
import { expenseService } from '../../api/services/expenseService';
import { useToast } from '../../context/ToastContext';
import AddExpenseModal from '../../pages/modal/AddExpenseModal';
import AddIcon from '@mui/icons-material/Add';
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
  // ⚡️ Added totalCount to track pagination from the server
  const [data, setData] = useState({ transactions: [], totalCount: 0, metrics: { totalIncome: 0, totalExpense: 0, netProfit: 0 } });
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    filterType: 'All'
  });

  const loadFinancials = async () => {
    try {
      setLoading(true);
      // ⚡️ Send page and limit to the backend service
      const res = await financialService.getLedger({
        ...filters,
        page: page + 1, // MUI pages are 0-indexed, APIs are usually 1-indexed
        limit: rowsPerPage
      });
      
      // ⚡️ Save transactions, total count, and metrics directly from backend
      setData({
        transactions: res.transactions || [],
        totalCount: res.totalCount || 0,
        metrics: res.metrics || { totalIncome: 0, totalExpense: 0, netProfit: 0 }
      });
    } catch (error) {
      showToast(error?.message || "Failed to load financials", "error");
    } finally {
      setLoading(false);
    }
  };

  // ⚡️ Trigger API call whenever filters, page, or rowsPerPage change
  useEffect(() => { 
    loadFinancials(); 
    // eslint-disable-next-line
  }, [filters, page, rowsPerPage]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0); // ⚡️ Reset to page 0 when filters change
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Will automatically trigger the useEffect
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0); // Reset to page 0 when changing page size
  };

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

  if (loading && data.transactions.length === 0) {
    return (
      <Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Stack spacing={3} maxWidth="1600px" mx="auto">
          <StatsCardSkeleton count={4} />
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <TableSkeleton rowCount={5} columnCount={6} />
          </Paper>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="900" color={primaryColor} sx={{ letterSpacing: '-0.02em' }}>Financial Ledger</Typography>
            <Typography variant="body2" color="#64748b" fontWeight="600">Unified cash flow statement and transaction history.</Typography>
          </Box>
          <Button 
            variant="contained" 
            size="medium"
            startIcon={<AddIcon />} 
            onClick={() => { setExpenseToEdit(null); setModalOpen(true); }} 
            sx={{ bgcolor: primaryColor, borderRadius: 2, px: 2.5, py: 1, fontWeight: 700, textTransform: 'none' }}
          >
            Add Expense
          </Button>
        </Stack>

        {/* METRIC CARDS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          <MetricCard label="TOTAL INCOME" value={data.metrics.totalIncome} icon={<TrendingUpIcon />} color="#10b981" />
          <MetricCard label="TOTAL EXPENSE" value={data.metrics.totalExpense} icon={<TrendingDownIcon />} color="#dc2626" />
          <Box sx={{ gridColumn: { xs: 'span 2', lg: 'span 1' } }}>
            <MetricCard label="NET PROFIT" value={data.metrics.netProfit} icon={<SavingsIcon />} color={primaryColor} />
          </Box>
        </Box>

        {/* FILTER BAR */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'white' }}>
          <TextField label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} />
          <ToggleButtonGroup value={filters.filterType} exclusive onChange={(e, val) => val && handleFilterChange({ target: { name: 'filterType', value: val }})} size="small">
            <ToggleButton value="All" sx={{ px: 2.5, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="Payment" sx={{ px: 2.5, fontWeight: 700 }}>Income</ToggleButton>
            <ToggleButton value="Expense" sx={{ px: 2.5, fontWeight: 700 }}>Expense</ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* DATA TABLE CONTAINER */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
          <TableContainer sx={{ maxHeight: '360px', overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['DATE', 'TYPE', 'DETAILS', 'METHOD', 'AMOUNT', 'ACTIONS'].map(h =>
                    <TableCell key={h} sx={{ fontWeight: 800, color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.7rem', letterSpacing: '0.08em', py: 1.5 }}>{h}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
                      No transactions found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  // ⚡️ Render directly from backend data (no local slicing)
                  data.transactions.map((tx) => (
                    <TableRow key={tx._id || tx.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1.5, color: '#475569', fontWeight: 600 }}>
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip label={tx.type} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22, bgcolor: tx.type === 'Payment' || tx.type === 'Income' ? '#ecfdf5' : '#fef2f2', color: tx.type === 'Payment' || tx.type === 'Income' ? '#059669' : '#dc2626' }} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight="800" color="#0f172a">{tx.title || tx.details}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>{tx.category}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#64748b', fontWeight: 600 }}>{tx.method}</TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 800, color: tx.type === 'Expense' ? '#dc2626' : '#10b981', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {tx.type === 'Expense' ? '-' : '+'} ₹{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="center">
                        {tx.type === 'Expense' && (
                          <Stack direction="row" justifyContent="center" spacing={0.5}>
                            <IconButton size="small" onClick={() => { setExpenseToEdit(tx); setModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, id: tx._id || tx.id })}><DeleteIcon fontSize="small" /></IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <TablePagination
            component="div"
            // ⚡️ Uses totalCount returned from the backend
            count={data.totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 15, 25]}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', py: 0.5 }}
          />
        </Paper>

      </Box>

      {/* MODALS */}
      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadFinancials} expenseToEdit={expenseToEdit} />
      <DeleteConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} onConfirm={executeDelete} />
    </Box>
  );
}

const MetricCard = ({ label, value, icon, color }) => (
  <Paper elevation={0} sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" fontWeight="800" color="#94a3b8" sx={{ letterSpacing: '0.05em' }}>{label}</Typography>
      <Typography variant="h5" fontWeight="900" sx={{ color, mt: 0.2 }}>₹ {(value || 0).toLocaleString()}</Typography>
    </Box>
  </Paper>
);

const DeleteConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}><WarningAmberIcon color="error" /> Delete Expense?</DialogTitle>
    <DialogContent><Typography color="text.secondary">Are you sure you want to delete this expense? This action cannot be undone.</Typography></DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained" disableElevation sx={{ fontWeight: 700, borderRadius: 2 }}>Yes, Delete</Button>
    </DialogActions>
  </Dialog>
);