import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Stack, Button, IconButton, Grid, Avatar, InputBase, Tabs, Tab
} from '@mui/material';

// Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; 
import PaidIcon from '@mui/icons-material/Paid'; 
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// --- MOCK DATA (15+ items to test scrolling) ---
const TRANSACTIONS = [
  { id: 'INV-005', date: '08 Feb 2026', type: 'INVOICE', desc: 'Full Mouth Rehabilitation (Upper Arch)', amount: 25000, status: 'Unpaid' },
  { id: 'PAY-005', date: '06 Feb 2026', type: 'PAYMENT', desc: 'Partial Payment via UPI (Ref: 827364)', amount: 5000, status: 'Success' },
  { id: 'INV-004', date: '05 Feb 2026', type: 'INVOICE', desc: 'Zirconia Crown (Tooth 46)', amount: 8000, status: 'Paid' },
  { id: 'PAY-004', date: '05 Feb 2026', type: 'PAYMENT', desc: 'Card Settlement (HDFC Bank)', amount: 8000, status: 'Success' },
  { id: 'INV-003', date: '02 Feb 2026', type: 'INVOICE', desc: 'Root Canal Treatment (Single Sitting)', amount: 4500, status: 'Paid' },
  { id: 'PAY-003', date: '02 Feb 2026', type: 'PAYMENT', desc: 'Cash Payment', amount: 4500, status: 'Success' },
  { id: 'INV-002', date: '01 Feb 2026', type: 'INVOICE', desc: 'Consultation Fee', amount: 500, status: 'Paid' },
  { id: 'INV-001', date: '01 Feb 2026', type: 'INVOICE', desc: 'Digital X-Ray (IOPA)', amount: 300, status: 'Paid' },
  { id: 'PAY-001', date: '01 Feb 2026', type: 'PAYMENT', desc: 'UPI Payment', amount: 800, status: 'Success' },
  { id: 'INV-X01', date: '01 Jan 2026', type: 'INVOICE', desc: 'Previous Balance Carry Forward', amount: 1200, status: 'Paid' },
  { id: 'PAY-X01', date: '01 Jan 2026', type: 'PAYMENT', desc: 'Settlement', amount: 1200, status: 'Success' },
  { id: 'INV-X02', date: '12 Dec 2025', type: 'INVOICE', desc: 'Teeth Whitening', amount: 5000, status: 'Paid' },
  { id: 'PAY-X02', date: '12 Dec 2025', type: 'PAYMENT', desc: 'Cash', amount: 5000, status: 'Success' },
  { id: 'INV-X03', date: '10 Nov 2025', type: 'INVOICE', desc: 'Consultation', amount: 500, status: 'Paid' },
];

export default function PatientLedger({ onCollectPayment }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalBilled = TRANSACTIONS.filter(t => t.type === 'INVOICE').reduce((a, b) => a + b.amount, 0);
  const totalPaid = TRANSACTIONS.filter(t => t.type === 'PAYMENT').reduce((a, b) => a + b.amount, 0);
  const pendingDue = totalBilled - totalPaid;

  // Filtering
  const filteredList = TRANSACTIONS.filter(t => {
      const matchesSearch = t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filter === 'all' ? true : t.type.toLowerCase() === filter;
      return matchesSearch && matchesType;
  });

  return (
    <Box sx={{ 
        // FIX: Hard constraint on height forcing internal scroll
        // 100vh - (Header ~64px + Tabs ~48px + Padding ~48px) = ~calc(100vh - 160px)
        height: 'calc(100vh - 100px)', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f8fafc',
        p: 3, 
        gap: 2
    }}>
      
      {/* 1. TOP CARDS (Fixed Height - Won't Scroll) */}
      <Box sx={{ flexShrink: 0 }}>
        <Grid container spacing={2}>
            
            {/* Card 1: Total Invoiced */}
            <Grid item xs={12} md={4}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        bgcolor: 'white', 
                        border: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                    }}
                >
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 0.5 }}>TOTAL INVOICED</Typography>
                        <Typography variant="h6" fontWeight="800" color="#1e293b">₹ {totalBilled.toLocaleString()}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 36, height: 36 }}>
                        <ReceiptLongIcon fontSize="small" />
                    </Avatar>
                </Paper>
            </Grid>

            {/* Card 2: Total Received */}
            <Grid item xs={12} md={4}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        bgcolor: 'white', 
                        border: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                    }}
                >
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 0.5 }}>RECEIVED</Typography>
                        <Typography variant="h6" fontWeight="800" color="#10b981">₹ {totalPaid.toLocaleString()}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 36, height: 36 }}>
                        <PaidIcon fontSize="small" />
                    </Avatar>
                </Paper>
            </Grid>

            {/* Card 3: Outstanding (Compact Action Card) */}
            <Grid item xs={12} md={4}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        bgcolor: '#1e293b', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 10px rgba(30, 41, 59, 0.2)'
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>BALANCE DUE</Typography>
                        <Typography variant="h6" fontWeight="800">₹ {pendingDue.toLocaleString()}</Typography>
                    </Box>
                    
                    <Button 
                        variant="contained" 
                        size="small"
                        onClick={onCollectPayment}
                        sx={{ 
                            bgcolor: '#3b82f6', 
                            fontWeight: 'bold', 
                            borderRadius: 2, 
                            px: 2, 
                            textTransform: 'none',
                            zIndex: 2,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#2563eb' } 
                        }}
                    >
                        Collect
                    </Button>

                    {/* Decorative Circle */}
                    <Box sx={{ position: 'absolute', right: -15, top: -15, width: 70, height: 70, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
                </Paper>
            </Grid>
        </Grid>
      </Box>

      {/* 2. TRANSACTION TABLE (Takes remaining height & scrolls internally) */}
      <Paper elevation={0} sx={{ 
          flex: 1, // Fill the rest of the height
          display: 'flex', 
          flexDirection: 'column', 
          border: '1px solid #e2e8f0', 
          borderRadius: 3, 
          bgcolor: 'white',
          overflow: 'hidden', // Hide overflow on the Paper itself
          minHeight: 0 // Crucial for Flexbox scrolling
      }}>
          
          {/* TOOLBAR (Fixed at top of table) */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="800" color="#1e293b">Transactions</Typography>
                  <Tabs 
                    value={filter} 
                    onChange={(e, v) => setFilter(v)} 
                    sx={{ minHeight: 36, '& .MuiTab-root': { fontWeight: '600', minHeight: 36, textTransform: 'none', py: 0, fontSize: '0.875rem' } }}
                    indicatorColor="primary"
                  >
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

          {/* TABLE CONTAINER (The Scrollable Part) */}
          <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader sx={{ minWidth: '100%' }}> 
                  <TableHead>
                      <TableRow>
                          <TableCell width="20%" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5, pl: 3 }}>DATE & ID</TableCell>
                          <TableCell width="35%" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>DESCRIPTION</TableCell>
                          <TableCell width="15%" align="right" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>AMOUNT</TableCell>
                          <TableCell width="15%" align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>STATUS</TableCell>
                          <TableCell width="15%" align="right" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', py: 1.5, pr: 3 }}>ACTIONS</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {filteredList.map((row) => {
                          const isInv = row.type === 'INVOICE';
                          return (
                            <TableRow key={row.id} hover sx={{ '& td': { borderColor: '#f1f5f9', py: 1.5 } }}>
                                
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
                                            <Typography variant="body2" fontWeight="700" color="#334155">{row.id}</Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <CalendarTodayIcon sx={{ fontSize: 10, color: '#94a3b8' }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight="600">{row.date}</Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                
                                {/* 2. DESC */}
                                <TableCell>
                                    <Typography variant="body2" fontWeight="600" color="#475569">{row.desc}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', mt: 0.25, bgcolor: '#f1f5f9', px: 0.5, borderRadius: 0.5, fontSize: '0.7rem' }}>
                                        {isInv ? 'Clinical Service' : 'Payment Credit'}
                                    </Typography>
                                </TableCell>
                                
                                {/* 3. AMOUNT */}
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="800" color={isInv ? '#1e293b' : '#10b981'}>
                                        {isInv ? `₹ ${row.amount.toLocaleString()}` : `+ ₹ ${row.amount.toLocaleString()}`}
                                    </Typography>
                                </TableCell>
                                
                                {/* 4. STATUS */}
                                <TableCell align="center">
                                    <Chip 
                                        label={row.status} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 'bold', fontSize: '0.7rem', height: 22, borderRadius: 1, px: 0.5,
                                            bgcolor: row.status === 'Unpaid' ? '#fee2e2' : '#dcfce7',
                                            color: row.status === 'Unpaid' ? '#991b1b' : '#166534',
                                            border: '1px solid',
                                            borderColor: row.status === 'Unpaid' ? '#fecaca' : '#bbf7d0'
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