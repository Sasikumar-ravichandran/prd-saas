import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Stack, Button, IconButton, Grid, Avatar, InputBase, Tabs, Tab, CircularProgress, Alert
} from '@mui/material';

// Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; 
import PaidIcon from '@mui/icons-material/Paid'; 
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { patientService } from '../../api/services/patientService'; 

export default function PatientLedger({ patient, onCollectPayment }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE ---
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. FETCH LEDGER DATA ---
  const fetchLedger = async () => {
    if (!patient?._id) return;
    
    try {
      setLoading(true);
      const data = await patientService.getLedger(patient._id);
      setLedgerData(data);
    } catch (err) {
      console.error("Ledger Error", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [patient]);

  // ⚡️ THE FIX: Removed the redundant frontend filter! 
  // Your backend is already filtering out proposed/deleted items, 
  // so we can trust `ledgerData` directly.

  // --- 2. CALCULATIONS ---
  const totalBilled = ledgerData
    .filter(t => t.type === 'DEBIT')
    .reduce((a, b) => a + (b.amount || 0), 0);

  const totalReceived = ledgerData
    .filter(t => t.type === 'CREDIT')
    .reduce((a, b) => a + (b.amount || 0), 0);

  // Calculate pending due based strictly on the ledger math
  const pendingDue = totalBilled - totalReceived;

  // --- 3. FILTERING LOGIC FOR THE TABLE ---
  const filteredList = ledgerData.filter(t => {
      const type = t.type === 'DEBIT' ? 'invoice' : 'payment';
      
      const matchesSearch = 
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = filter === 'all' ? true : type === filter;
      
      return matchesSearch && matchesType;
  });

  // --- 4. RENDER LOADING/ERROR ---
  if (loading && ledgerData.length === 0) {
      return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  if (error) {
      return <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;
  }

  return (
    <Box sx={{ 
        height: 'calc(100vh - 100px)', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f8fafc',
        p: 3, 
        gap: 2
    }}>
      
      {/* 1. TOP CARDS */}
      <Box sx={{ flexShrink: 0 }}>
        <Grid container spacing={2}>
            
            {/* Total Invoiced */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL INVOICED</Typography>
                        <Typography variant="h6" fontWeight="800" color="#1e293b">₹ {totalBilled.toLocaleString()}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}><ReceiptLongIcon /></Avatar>
                </Paper>
            </Grid>

            {/* Total Received */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">RECEIVED</Typography>
                        <Typography variant="h6" fontWeight="800" color="#10b981">₹ {totalReceived.toLocaleString()}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a' }}><PaidIcon /></Avatar>
                </Paper>
            </Grid>

            {/* Outstanding Balance */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ zIndex: 2 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.8 }}>BALANCE DUE</Typography>
                        <Typography variant="h6" fontWeight="800">₹ {pendingDue.toLocaleString()}</Typography>
                    </Box>
                    
                    <Button 
                        variant="contained" size="small" onClick={onCollectPayment}
                        disabled={pendingDue <= 0} 
                        sx={{ bgcolor: '#3b82f6', fontWeight: 'bold', borderRadius: 2, zIndex: 2, '&:hover': { bgcolor: '#2563eb' } }}
                    >
                        Collect
                    </Button>
                    {/* Decorative Circle */}
                    <Box sx={{ position: 'absolute', right: -15, top: -15, width: 70, height: 70, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
                </Paper>
            </Grid>
        </Grid>
      </Box>

      {/* 2. TRANSACTION TABLE */}
      <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: 'white', overflow: 'hidden', minHeight: 0 }}>
          
          {/* TOOLBAR */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="800" color="#1e293b">Transactions</Typography>
                  <Tabs value={filter} onChange={(e, v) => setFilter(v)} sx={{ minHeight: 36, '& .MuiTab-root': { fontWeight: '600', minHeight: 36, textTransform: 'none', py: 0, fontSize: '0.875rem' } }}>
                      <Tab label="All" value="all" />
                      <Tab label="Invoices" value="invoice" />
                      <Tab label="Payments" value="payment" />
                  </Tabs>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                  <Paper component="form" sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 220, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <InputBase 
                          sx={{ ml: 1, flex: 1, fontWeight: 500, fontSize: '0.85rem' }} 
                          placeholder="Search records..." 
                          value={searchTerm} 
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </Paper>
                  <Button startIcon={<PrintIcon />} size="small" variant="outlined" sx={{ fontWeight: 'bold', borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none' }}>Export</Button>
              </Stack>
          </Box>

          {/* TABLE CONTAINER */}
          <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader sx={{ minWidth: '100%' }}> 
                  <TableHead>
                      <TableRow>
                          <TableCell width="20%" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5, pl: 3 }}>DATE & ID</TableCell>
                          <TableCell width="35%" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>DESCRIPTION</TableCell>
                          <TableCell width="15%" align="right" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>AMOUNT</TableCell>
                          <TableCell width="15%" align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>TYPE</TableCell>
                          <TableCell width="15%" align="right" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5, pr: 3 }}>ACTIONS</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {filteredList.map((row) => {
                          const isInv = row.type === 'DEBIT'; 
                          const displayId = isInv ? `INV-${row._id.slice(-6)}` : (row.receiptNumber || `PAY-${row._id.slice(-6)}`);
                          
                          return (
                            <TableRow key={row._id} hover sx={{ '& td': { borderColor: '#f1f5f9', py: 1.5 } }}>
                                
                                {/* 1. DATE & ID */}
                                <TableCell sx={{ pl: 3 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Box sx={{ 
                                            width: 32, height: 32, borderRadius: 2, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            bgcolor: isInv ? '#eff6ff' : '#ecfdf5',
                                            color: isInv ? '#3b82f6' : '#10b981'
                                        }}>
                                            {isInv ? <ArrowOutwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700" color="#334155" sx={{ textTransform: 'uppercase' }}>
                                                {displayId}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <CalendarTodayIcon sx={{ fontSize: 10, color: '#94a3b8' }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                    {new Date(row.date || row.createdAt || new Date()).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                
                                {/* 2. DESC */}
                                <TableCell>
                                    <Typography variant="body2" fontWeight="600" color="#475569">{row.description}</Typography>
                                    {row.tooth && (
                                        <Chip label={`Tooth: ${row.tooth}`} size="small" sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }} />
                                    )}
                                </TableCell>
                                
                                {/* 3. AMOUNT */}
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="800" color={isInv ? '#1e293b' : '#10b981'}>
                                        {isInv ? `₹ ${row.amount.toLocaleString()}` : `+ ₹ ${row.amount.toLocaleString()}`}
                                    </Typography>
                                </TableCell>
                                
                                {/* 4. TYPE/STATUS */}
                                <TableCell align="center">
                                    <Chip 
                                        label={isInv ? 'BILLED' : 'SUCCESS'} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 'bold', fontSize: '0.7rem', height: 22, borderRadius: 1, px: 0.5,
                                            bgcolor: isInv ? '#f1f5f9' : '#dcfce7',
                                            color: isInv ? '#64748b' : '#166534'
                                        }} 
                                    />
                                </TableCell>
                                
                                {/* 5. ACTION */}
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <IconButton size="small" sx={{ color: '#94a3b8' }}><MoreHorizIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                          );
                      })}
                      
                      {filteredList.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                  <FilterListIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1 }} />
                                  <Typography variant="subtitle2" fontWeight="bold" color="#94a3b8">No records found</Typography>
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </TableContainer>
      </Paper>
    </Box>
  );
}