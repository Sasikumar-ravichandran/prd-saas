import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack,
  CircularProgress, Alert, alpha
} from '@mui/material';
import { inventoryService } from '../../api/services/inventoryService'; //  ADD THIS
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { dashboardService } from '../../api/services/dashboardService';
import { useColorMode } from '../../context/ThemeContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { isToday, format } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StatsCardSkeleton from '../../components/Skeletons/StatsCardSkeleton';
import TableSkeleton from '../../components/Skeletons/TableSkeleton';

// --- REFINED FINCARD COMPONENT ---
const FinCard = ({ label, value, sub, color, icon, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 4,
      border: '1px solid #e2e8f0',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)'
      }
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em', display: 'block', mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', mb: 1.5, lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        {trend !== undefined && (
          <Chip
            label={`${trend > 0 ? '+' : ''}${trend}%`}
            size="small"
            sx={{
              height: 22, fontSize: '0.7rem', fontWeight: '800',
              bgcolor: trend >= 0 ? '#dcfce7' : '#fee2e2',
              color: trend >= 0 ? '#16a34a' : '#dc2626',
              borderRadius: 1.5
            }}
          />
        )}
        <Typography variant="caption" color="#64748b" fontWeight="600">{sub}</Typography>
      </Stack>
    </Box>
    <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 52, height: 52, borderRadius: 3 }}>
      {icon}
    </Avatar>
  </Paper>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { primaryColor } = useColorMode();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  //  1. ADD THIS: A separate loading state just for the appointments list
  const [apptLoading, setApptLoading] = useState(false);
  const navigate = useNavigate();

  // 2. INITIAL LOAD (Runs only once when the dashboard opens)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        //  FETCH BOTH CONCURRENTLY USING YOUR CLEAN SERVICES
        const [dashRes, invRes] = await Promise.all([
          dashboardService.getAdminData(selectedDate.toISOString()),
          inventoryService.getLowStockAlerts() //  Calls the new service
        ]);

        setData(dashRes);
        // The service already extracts the data, so we just pass invRes directly!
        setInventoryAlerts(invRes || []);
      } catch (err) {
        console.error("Dashboard Load Failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  3. BACKGROUND LOAD (Runs only when the date is changed)
  useEffect(() => {
    // Skip this if the whole page is still doing its initial load
    if (loading) return;

    const fetchAppointmentsForDate = async () => {
      try {
        setApptLoading(true); // Only show the tiny appointment spinner
        const res = await dashboardService.getAdminData(selectedDate.toISOString());

        // Silently update ONLY the appointments array in the background
        setData(prevData => ({
          ...prevData,
          appointments: res.appointments
        }));
      } catch (err) {
        console.error("Failed to fetch new date", err);
      } finally {
        setApptLoading(false);
      }
    };

    fetchAppointmentsForDate();
  }, [selectedDate]);

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
  
  if (!data) return <Box sx={{ p: 5 }}><Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load admin dashboard.</Alert></Box>;

  return (
    <Box sx={{ p: 1, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>


      {/* 1. APP HEADER */}
      <Box sx={{ px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h5" fontWeight="900" sx={{ color: primaryColor, letterSpacing: '-0.02em', mb: 0.5 }}>
            Business Overview
          </Typography>
          <Typography variant="body2" color="#64748b" fontWeight="600">
            Financial Health & Clinic Operations
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExport}
            disableElevation
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: '700', borderRadius: 2.5, px: 2.5, textTransform: 'none', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            Export CSV
          </Button>
        </Stack>
      </Box>

      {/* MAIN DASHBOARD CONTENT */}
      <Box sx={{ p: 1, maxWidth: '1600px' }}>

        {/* We use a vertical Stack to force sections to sit on top of each other */}
        <Stack spacing={4}>

          {/* 2. FINANCIAL METRICS */}
          <Box sx={{
            display: 'grid',
            // xs handles mobile & tablet (2 columns), lg handles desktop (4 columns)
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            // Slightly tighter gap on mobile so the cards fit nicely side-by-side
            gap: { xs: 1.5, lg: 3 }
          }}>
            <FinCard
              label="Monthly Revenue"
              value={`₹${(data.financials.month).toLocaleString()}`}
              trend={data.financials.growth}
              sub="Gross Income"
              color="#3b82f6"
              icon={<TrendingUpIcon />}
            />
            <FinCard
              label="Expenses"
              value={`₹${(data.financials.expenses).toLocaleString()}`}
              sub="Operational Costs"
              color="#ef4444"
              icon={<WarningAmberIcon />}
            />
            <FinCard
              label="Net Profit"
              value={`₹${(data.financials.profit).toLocaleString()}`}
              sub="Real Earnings"
              color="#10b981"
              icon={<AccountBalanceWalletIcon />}
            />
            <FinCard
              label="Active Patients"
              value={data.patients.total.toLocaleString()}
              sub={`+${data.patients.newThisMonth} New This Month`}
              color="#f59e0b"
              icon={<GroupIcon />}
            />
          </Box>

          {/* 3. FULL WIDTH TRANSACTION STREAM */}
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>

            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
              <Typography variant="h6" fontWeight="800" color="#0f172a">Recent Transactions</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />} sx={{ fontWeight: '700', textTransform: 'none', color: primaryColor }} onClick={() => navigate('/financial')}>
                View All
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: '600px', overflowY: 'auto', }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {['DETAILS', 'METHOD', 'AMOUNT', 'STATUS'].map((head, i) => (
                      <TableCell key={i} sx={{ fontWeight: '800', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem', letterSpacing: '0.05em', py: 2, borderBottom: '2px solid #e2e8f0' }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="#94a3b8" fontWeight="600">No recent transactions.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.transactions.map((row, i) => (
                      <TableRow key={i} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="800" color="#0f172a">{row.patient}</Typography>
                            {row.type === 'Expense' ? (
                              <>
                                <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
                                  {row.category}
                                </Typography>
                                <Typography variant="caption" color="#64748b" fontWeight="500" sx={{ display: 'block' }}>
                                  {row.details || 'No details provided'}
                                </Typography>
                              </>
                            ) : (
                              //  PAYMENT VIEW: Patient Title on top, 'Patient Bill' below
                              <>
                                <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
                                  {row.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Patient Bill
                                </Typography>
                              </>
                            )}

                            {/* Add the timestamp at the bottom for both */}
                            <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
                              <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
                                {new Date(row.date).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          <Typography variant="body2" color="#475569" fontWeight="600">{row.method}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          <Typography variant="body1" fontWeight="800" sx={{ color: row.type === 'Expense' ? '#ef4444' : '#10b981' }}>
                            {row.type === 'Expense' ? '-' : '+'} ₹{row.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          <Chip
                            label={row.type === 'Expense' ? 'PAID' : (row.status || 'COMPLETED')}
                            size="small"
                            sx={{
                              borderRadius: 1.5,
                              fontWeight: '800',
                              height: 26,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              bgcolor: row.type === 'Expense' ? '#fef2f2' : '#ecfdf5',
                              color: row.type === 'Expense' ? '#dc2626' : '#059669'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 4. BOTTOM ROW: OPS & ALERTS (Perfect 50/50 Split) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // Exactly 100% on mobile, exactly 50/50 on desktop
              gap: 4, // Exact same spacing as the grid above
              width: '100%'
            }}
          >

            {/* UPCOMING APPOINTMENTS (LEFT HALF) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/*  HEADER WITH DATE PICKER */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="800" color="#0f172a">Appointments</Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ position: 'relative' }}>

                    {/* 1. THE SLEEK VISUAL BUTTON */}
                    <Button
                      disableElevation
                      onClick={() => setCalendarOpen(true)}
                      startIcon={<CalendarMonthIcon sx={{ color: primaryColor }} />}
                      endIcon={<ExpandMoreIcon sx={{ color: '#94a3b8' }} />}
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: '800',
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 2,
                        py: 0.75,
                        border: '1px solid #e2e8f0',
                        '&:hover': { bgcolor: '#e2e8f0' }
                      }}
                    >
                      {/* Dynamically say "Today" or show the formatted date */}
                      {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM dd, yyyy")}
                    </Button>

                    {/* 2. THE HIDDEN ANCHOR */}
                    {/* This invisible box holds the real DatePicker so the calendar popup anchors perfectly to the button */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                      <DatePicker
                        open={calendarOpen}
                        onClose={() => setCalendarOpen(false)}
                        value={selectedDate}
                        onChange={(newValue) => {
                          if (newValue) setSelectedDate(newValue);
                          setCalendarOpen(false);
                        }}
                        slotProps={{ textField: { sx: { width: '100%', height: '100%' } } }}
                      />
                    </Box>

                  </Box>
                </LocalizationProvider>
              </Box>

              {/*  4. ADD LOCAL LOADER TO THE STACK */}
              <Stack spacing={2} sx={{ overflowY: 'auto', flex: 1, pr: 1, maxHeight: '300px' }}>
                {apptLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 150 }}>
                    <CircularProgress size={30} sx={{ color: primaryColor }} />
                  </Box>
                ) : data.appointments && data.appointments.length > 0 ? (
                  data.appointments.map((appt, i) => (
                    <Box key={i} onClick={() => {
                      if (appt.patientDisplayId || appt.patientMongoId) {
                        navigate(`/patients/${appt.patientDisplayId || appt.patientMongoId}`);
                      }
                    }} sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', cursor: (appt.patientDisplayId || appt.patientMongoId) ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      '&:hover': (appt.patientDisplayId || appt.patientMongoId) ? {
                        bgcolor: '#f1f5f9',
                        borderColor: '#e2e8f0',
                        transform: 'translateY(-1px)'
                      } : {}
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, fontWeight: '800', bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}>
                          {appt.patientName ? appt.patientName.charAt(0) : 'P'}
                        </Avatar>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
                              {appt.patientName || 'Unknown Patient'}
                            </Typography>

                            {/*  DISPLAY PATIENT ID CHIP */}
                            {appt.patientDisplayId && (
                              <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                {appt.patientDisplayId}
                              </Typography>
                            )}
                          </Stack>
                          <Typography variant="caption" color="#64748b" fontWeight="600">
                            Dr. {appt.doctorName || 'Unassigned'} • <span style={{ color: primaryColor }}>{appt.type}</span>
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="800" color="#334155">
                          {new Date(appt.date || appt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" fontWeight="700" sx={{
                          color: appt.status === 'Completed' ? '#10b981' : appt.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                        }}>
                          {appt.status || 'Scheduled'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="#64748b" fontWeight="600">
                      No appointments scheduled for this date.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* INVENTORY ALERTS (RIGHT HALF) */}
            {/* INVENTORY ALERTS (RIGHT HALF) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', height: '100%', display: 'flex', flexDirection: 'column' }}>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="800" color="#0f172a">Inventory Alerts</Typography>

                {/*  DYNAMIC STATUS CHIP */}
                <Chip
                  label={inventoryAlerts.length > 0 ? `${inventoryAlerts.length} Critical` : "Optimal"}
                  size="small"
                  sx={{
                    height: 24, fontSize: '0.7rem', fontWeight: '800', borderRadius: 1.5,
                    bgcolor: inventoryAlerts.length > 0 ? '#fee2e2' : '#dcfce7',
                    color: inventoryAlerts.length > 0 ? '#dc2626' : '#16a34a'
                  }}
                />
              </Box>

              <Stack spacing={2} sx={{ overflowY: 'auto', flex: 1, pr: 1, maxHeight: '300px' }}>
                {inventoryAlerts.length > 0 ? (
                  inventoryAlerts.map((item, i) => (
                    <Box key={i} sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fde68a' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 36, height: 36 }}>
                          <WarningAmberIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" color="#b45309">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="#d97706" fontWeight="600">
                            {item.category || 'Supplies'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="900" color="#dc2626" sx={{ lineHeight: 1 }}>
                          {item.quantity}
                        </Typography>
                        <Typography variant="caption" fontWeight="700" color="#b45309">
                          / {item.lowStockThreshold} Min
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  //  ZERO ALERTS UI (Everything is fully stocked!)
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 48, height: 48, mb: 1.5 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Typography variant="body2" color="#475569" fontWeight="700">
                      All stock levels are optimal.
                    </Typography>
                    <Typography variant="caption" color="#94a3b8" fontWeight="600">
                      No critical shortages detected.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

          </Box>
        </Stack>
      </Box>
    </Box>
  );
}