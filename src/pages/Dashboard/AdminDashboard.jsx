import React from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Avatar, IconButton, Stack, 
  LinearProgress, Divider
} from '@mui/material';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// --- MOCK DATA ---
const TRANSACTIONS = [
  { id: 'INV-001', patient: 'Ravi Kumar', doc: 'Dr. Ramesh', amount: '₹ 5,000', method: 'UPI', status: 'Paid', time: '10:15 AM' },
  { id: 'INV-002', patient: 'Anita Raj', doc: 'Dr. Priya', amount: '₹ 1,500', method: 'Cash', status: 'Paid', time: '10:45 AM' },
  { id: 'INV-003', patient: 'Suresh B', doc: 'Dr. Ramesh', amount: '₹ 500', method: 'Card', status: 'Paid', time: '11:00 AM' },
  { id: 'EXP-001', patient: 'Vendor: Dental Depot', doc: 'Admin', amount: '- ₹ 2,200', method: 'Bank', status: 'Expense', time: '09:30 AM' },
  { id: 'INV-004', patient: 'Meena K', doc: 'Dr. Bench', amount: '₹ 800', method: '-', status: 'Pending', time: '11:15 AM' },
];

const INVENTORY_ALERTS = [
  { item: 'Local Anesthesia (Lignox)', stock: '3 Vials', status: 'Critical' },
  { item: 'Gloves (Medium)', stock: '2 Boxes', status: 'Low' },
  { item: 'Composite Kit', stock: '1 Unit', status: 'Low' },
];

const STAFF_ATTENDANCE = [
  { name: 'Dr. Ramesh', role: 'Doctor', inTime: '09:55 AM', status: 'On Time' },
  { name: 'Dr. Priya', role: 'Doctor', inTime: '10:10 AM', status: 'Late' },
  { name: 'Divya (Rec)', role: 'Staff', inTime: '09:30 AM', status: 'On Time' },
];

// --- COMPONENTS ---
const FinCard = ({ label, value, sub, color, icon }) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <Box>
       <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
       <Typography variant="h4" fontWeight="800" sx={{ color: '#111827', my: 0.5 }}>{value}</Typography>
       <Chip label={sub} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: `${color}15`, color: color }} />
     </Box>
     <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48, borderRadius: 2 }}>{icon}</Avatar>
  </Paper>
);

export default function AdminDashboard() {
  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', p: 3, mx: -3, my: -3 }}>
      
      {/* 1. HEADER (Business Focus) */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="900" color="#1a2027">Business Overview</Typography>
          <Typography variant="body2" color="text.secondary">Financial Health & Operations</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
           <Button startIcon={<DownloadIcon />} sx={{ bgcolor: 'white', color: 'text.secondary', border: '1px solid #ddd', borderRadius: 2 }}>
             Export Report
           </Button>
           <Button variant="contained" sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', bgcolor: '#111827' }}>
             Add Expense
           </Button>
        </Stack>
      </Box>

      {/* 2. FINANCIAL METRICS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FinCard label="Today's Revenue" value="₹ 24.5k" sub="+12% vs Avg" color="#2e7d32" icon={<CurrencyRupeeIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FinCard label="Net Profit (MoM)" value="₹ 1.2L" sub="Healthy Margin" color="#1976d2" icon={<TrendingUpIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FinCard label="Active Patients" value="142" sub="+8 New this week" color="#ed6c02" icon={<GroupIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FinCard label="Inventory Value" value="₹ 85k" sub="3 Alerts" color="#d32f2f" icon={<Inventory2Icon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        
        {/* --- LEFT: TRANSACTION STREAM (66%) --- */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid #eaecf0', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="800">Recent Transactions</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />}>View All</Button>
            </Box>
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>DOCTOR / USER</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TRANSACTIONS.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                         <Typography variant="body2" fontWeight="700">{row.patient}</Typography>
                         <Typography variant="caption" color="text.secondary">{row.id} • {row.time}</Typography>
                      </TableCell>
                      <TableCell>{row.doc}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: row.status === 'Expense' ? 'error.main' : 'success.main' }}>
                          {row.amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{row.method}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} size="small" 
                          sx={{ 
                            borderRadius: 1, fontWeight: 'bold', height: 24, fontSize: '0.7rem',
                            bgcolor: row.status === 'Paid' ? '#e8f5e9' : row.status === 'Pending' ? '#fff3e0' : '#ffebee',
                            color: row.status === 'Paid' ? '#2e7d32' : row.status === 'Pending' ? '#e65100' : '#c62828'
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* --- RIGHT: OPS & ALERTS (33%) --- */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            
            {/* 1. INVENTORY ALERTS (Critical) */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="subtitle2" fontWeight="800">Low Stock Alerts</Typography>
                 <Chip label="Action Needed" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
               </Box>
               <Stack spacing={1.5}>
                 {INVENTORY_ALERTS.map((item, i) => (
                   <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#fff5f5', borderRadius: 2, border: '1px dashed #feb2b2' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WarningAmberIcon color="error" fontSize="small" />
                        <Box>
                           <Typography variant="body2" fontWeight="bold">{item.item}</Typography>
                           <Typography variant="caption" color="error">{item.stock} Remaining</Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="outlined" color="error" sx={{ bgcolor: 'white' }}>Order</Button>
                   </Box>
                 ))}
               </Stack>
            </Paper>

            {/* 2. REVENUE GOAL TRACKER */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0' }}>
               <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2 }}>Monthly Revenue Goal</Typography>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="caption" fontWeight="bold">Current: ₹ 3.2L</Typography>
                 <Typography variant="caption" fontWeight="bold">Goal: ₹ 5.0L</Typography>
               </Box>
               <LinearProgress variant="determinate" value={64} sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: '#f0f0f0' }} color="primary" />
               <Typography variant="caption" color="text.secondary">64% Achieved • 12 Days remaining</Typography>
            </Paper>

            {/* 3. STAFF ATTENDANCE */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0', flexGrow: 1 }}>
               <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2 }}>Staff Attendance</Typography>
               <Stack spacing={2}>
                 {STAFF_ATTENDANCE.map((staff, i) => (
                   <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{staff.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{staff.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{staff.role}</Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={staff.inTime} size="small" 
                        icon={staff.status === 'On Time' ? <CheckCircleIcon /> : <WarningAmberIcon />}
                        sx={{ 
                          bgcolor: 'white', border: '1px solid #eee', fontWeight: 'bold',
                          color: staff.status === 'On Time' ? 'success.main' : 'warning.main'
                        }} 
                      />
                   </Box>
                 ))}
               </Stack>
            </Paper>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}