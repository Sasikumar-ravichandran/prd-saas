import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack, 
  LinearProgress, CircularProgress, Alert
} from '@mui/material';
import { dashboardService } from '../../api/services/dashboardService';
import { useColorMode } from '../../context/ThemeContext';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';


// --- COMPONENTS ---
const FinCard = ({ label, value, sub, color, icon, trend }) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <Box>
       <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
       <Typography variant="h4" fontWeight="800" sx={{ color: '#111827', my: 0.5 }}>{value}</Typography>
       
       <Stack direction="row" spacing={1} alignItems="center">
         {trend && (
             <Chip 
                label={`${trend > 0 ? '+' : ''}${trend}%`} 
                size="small" 
                sx={{ 
                    height: 20, fontSize: '0.65rem', fontWeight: 'bold', 
                    bgcolor: trend >= 0 ? '#dcfce7' : '#fee2e2', 
                    color: trend >= 0 ? '#166534' : '#991b1b' 
                }} 
             />
         )}
         <Typography variant="caption" color="text.secondary" fontWeight="600">{sub}</Typography>
       </Stack>
     </Box>
     <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48, borderRadius: 2 }}>{icon}</Avatar>
  </Paper>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { primaryColor } = useColorMode();

  // 1. Fetch Real Data
  useEffect(() => {
    const loadData = async () => {
        try {
            const res = await dashboardService.getAdminData();
            setData(res);
        } catch (err) {
            console.error("Admin Load Failed", err);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  // 2. Export Function (CSV)
  const handleExport = () => {
    if (!data?.transactions) return;
    
    // Create CSV Content
    const headers = ["ID,Details,Amount,Method,Type,Date\n"];
    const rows = data.transactions.map(t => 
        `${t.id},"${t.patient}",${t.amount},${t.method},${t.type},${new Date(t.date).toLocaleDateString()}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!data) return <Box sx={{ p: 5 }}><Alert severity="error">Failed to load admin dashboard.</Alert></Box>;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', p: 3 }}>
      
      {/* 1. HEADER */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="900" color={primaryColor}>Business Overview</Typography>
          <Typography variant="body2" color="text.secondary">Financial Health & Operations</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
           <Button startIcon={<DownloadIcon />} onClick={handleExport} sx={{ bgcolor: 'white', color: 'text.secondary', border: '1px solid #ddd', borderRadius: 2 }}>
             Export CSV
           </Button>
           <Button variant="contained" sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', bgcolor: primaryColor }}>
             Add Expense
           </Button>
        </Stack>
      </Box>

      {/* 2. FINANCIAL METRICS (UPDATED) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        
        {/* Card 1: Monthly Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <FinCard 
            label="Monthly Revenue" 
            value={`₹ ${data.financials.month.toLocaleString()}`} 
            trend={data.financials.growth}
            sub="Gross Income" 
            color="#1976d2" 
            icon={<TrendingUpIcon />} 
          />
        </Grid>

        {/* Card 2: Expenses (Red) */}
        <Grid item xs={12} sm={6} md={3}>
          <FinCard 
            label="Expenses" 
            value={`₹ ${data.financials.expenses.toLocaleString()}`} 
            sub="Operational Costs" 
            color="#d32f2f" 
            icon={<WarningAmberIcon />} 
          />
        </Grid>

        {/* Card 3: Net Profit (Green) */}
        <Grid item xs={12} sm={6} md={3}>
          <FinCard 
            label="Net Profit" 
            value={`₹ ${data.financials.profit.toLocaleString()}`} 
            sub="Real Earnings" 
            color="#2e7d32" 
            icon={<AccountBalanceWalletIcon />} 
          />
        </Grid>

        {/* Card 4: Active Patients */}
        <Grid item xs={12} sm={6} md={3}>
          <FinCard 
            label="Active Patients" 
            value={data.patients.total} 
            sub={`+${data.patients.newThisMonth} New (Month)`} 
            color="#ed6c02" 
            icon={<GroupIcon />} 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        
        {/* --- LEFT: TRANSACTION STREAM --- */}
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
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>METHOD</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transactions.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{py: 4, color: 'text.secondary'}}>No recent transactions.</TableCell></TableRow>
                  )}
                  {data.transactions.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                          <Typography variant="body2" fontWeight="700">{row.patient}</Typography>
                          <Typography variant="caption" color="text.secondary">
                             {row.type === 'Expense' ? 'Vendor / Category' : 'Patient Bill'} • {new Date(row.date).toLocaleTimeString()}
                          </Typography>
                      </TableCell>
                      <TableCell>{row.method}</TableCell>
                      <TableCell>
                        <Typography 
                            variant="body2" 
                            fontWeight="bold" 
                            sx={{ color: row.type === 'Expense' ? 'error.main' : 'success.main' }}
                        >
                          {row.type === 'Expense' ? '-' : '+'} ₹ {row.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} size="small" 
                          sx={{ 
                              borderRadius: 1, fontWeight: 'bold', height: 24, fontSize: '0.7rem', 
                              bgcolor: row.type === 'Expense' ? '#fff5f5' : '#e8f5e9', 
                              color: row.type === 'Expense' ? '#c62828' : '#2e7d32' 
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

        {/* --- RIGHT: OPS & ALERTS --- */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            
            {/* 1. DOCTOR PERFORMANCE */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="subtitle2" fontWeight="800">Top Performing Doctors</Typography>
                 <Chip label="This Month" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
               </Box>
               <Stack spacing={1.5}>
                 {data.performance.map((doc, i) => (
                   <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: '#f3f4f6', color: '#374151' }}>
                            {doc._id ? doc._id.charAt(0) : '?'}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">{doc._id || 'Unknown'}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          {doc.count} Completed
                      </Typography>
                   </Box>
                 ))}
                 {data.performance.length === 0 && <Typography variant="caption">No data yet.</Typography>}
               </Stack>
            </Paper>

            {/* 2. REVENUE GOAL TRACKER */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0' }}>
               <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2 }}>Monthly Revenue Goal</Typography>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="caption" fontWeight="bold">Current: ₹ {(data.financials.month / 1000).toFixed(1)}k</Typography>
                 <Typography variant="caption" fontWeight="bold">Goal: ₹ 5.0L</Typography>
               </Box>
               <LinearProgress variant="determinate" value={Math.min((data.financials.month / 500000) * 100, 100)} sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: '#f0f0f0' }} color="primary" />
               <Typography variant="caption" color="text.secondary">
                   {Math.round((data.financials.month / 500000) * 100)}% Achieved
               </Typography>
            </Paper>

            {/* 3. INVENTORY PLACEHOLDER */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eaecf0', flexGrow: 1 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="subtitle2" fontWeight="800">Inventory Alerts</Typography>
                 <Chip label="Coming Soon" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
               </Box>
               <Stack spacing={1.5} sx={{ opacity: 0.6 }}>
                   <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                       <WarningAmberIcon color="warning" fontSize="small" />
                       <Typography variant="body2">Stock tracking module not enabled.</Typography>
                   </Box>
               </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}