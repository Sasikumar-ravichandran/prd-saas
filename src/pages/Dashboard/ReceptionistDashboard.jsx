import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Avatar, IconButton, Stack, Chip,
  Divider, CircularProgress, Alert, Tooltip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, alpha
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { dashboardService } from '../../api/services/dashboardService';
import { inventoryService } from '../../api/services/inventoryService';
import api from '../../api/services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AddExpenseModal from '../../pages/modal/AddExpenseModal'; // Adjust path where you saved it

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

import StatsCardSkeleton from '../../components/Skeletons/StatsCardSkeleton';
import TableSkeleton from '../../components/Skeletons/TableSkeleton';


export default function ReceptionistDashboard() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, invRes] = await Promise.all([
        dashboardService.getReceptionData(),
        inventoryService.getLowStockAlerts()
      ]);
      setData({
        ...dashRes,
        lowInventory: invRes || []
      });
    } catch (err) {
      console.error(err.message || "Failed to load receptionist dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusUpdate = async (apptId, newStatus) => {
    try {
      await api.put(`/appointments/${apptId}`, { status: newStatus });
      showToast(`Appointment moved to ${newStatus}`, 'success');
      loadData();
    } catch (error) {
      showToast(error?.message || 'Failed to update status', 'error');
    }
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

  if (!data) return <Box sx={{ p: 3 }}><Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load dashboard data. Please try again.</Alert></Box>;

  const { todayFlow = [], cashDrawer = {}, lowInventory = [], doctorStatus = [] } = data;

  const totalAppointments = todayFlow.length;
  const waitingCount = todayFlow.filter(s => s.status === 'Scheduled' || s.status === 'Pending').length;
  const paginatedSchedule = todayFlow.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'Completed': return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe' };
      case 'Scheduled': case 'Pending': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const getStatusChip = (status) => {
    const colors = getStatusColor(status);
    return (
      <Chip
        label={status === 'In Progress' ? 'IN CHAIR' : status.toUpperCase()}
        size="small"
        sx={{
          bgcolor: colors.bg, color: colors.color, fontWeight: '700',
          fontSize: '0.65rem', height: 20, border: `1px solid ${colors.border}`,
          letterSpacing: '0.05em', px: 0.5, borderRadius: 1
        }}
      />
    );
  };

  return (
    <Box sx={{p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* HEADER SECTION */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} spacing={{ xs: 2, sm: 0 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h4" fontWeight="700" sx={{ color: primaryColor, letterSpacing: '-0.02em', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
              Front Desk Operations
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate('/calendar')} startIcon={<CalendarTodayIcon fontSize="small" />} sx={{ width: { xs: '100%', sm: 'auto' }, borderRadius: 2, textTransform: 'none', fontWeight: '600', bgcolor: primaryColor, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', py: 1, px: 2.5 }}>
            New Appointment
          </Button>
        </Stack>

        {/* FULL WIDTH INVENTORY ALERT */}
        {lowInventory?.length > 0 && (
          <Alert
            severity="error"
            icon={<WarningAmberIcon fontSize="inherit" />}
            sx={{ mb: 3, borderRadius: 2, border: '1px solid #fecaca', alignItems: 'center' }}
          >
            <Typography variant="body2" fontWeight="700" color="#991b1b">
              Low Stock Alert: You have {lowInventory.length} items running extremely low ({lowInventory.map(i => i.name).slice(0, 3).join(', ')}{lowInventory.length > 3 ? '...' : ''}). Please restock soon!
            </Typography>
          </Alert>
        )}

        {/* KPI CARDS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 }, width: '100%', mb: 3 }}>
          {[
            { label: 'TOTAL QUEUE', count: totalAppointments, icon: <AssignmentIndIcon fontSize="small" />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'WAITING NOW', count: waitingCount, icon: <EventSeatIcon fontSize="small" />, color: '#d97706', bg: '#fef3c7' },
            { label: 'CASH TODAY', count: `₹${cashDrawer?.total?.toLocaleString() || 0}`, icon: <AccountBalanceWalletIcon fontSize="small" />, color: '#16a34a', bg: '#dcfce7' },
            { label: 'STOCK ALERTS', count: lowInventory.length, icon: <InventoryIcon fontSize="small" />, color: lowInventory.length > 0 ? '#e11d48' : '#64748b', bg: lowInventory.length > 0 ? '#ffe4e6' : '#f1f5f9' }
          ].map((kpi, idx) => (
            <Card key={idx} elevation={0} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, pb: { xs: '12px !important', sm: '20px !important' }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Box sx={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                    <Typography noWrap variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>{kpi.label}</Typography>
                    <Typography variant="h5" fontWeight="700" sx={{ color: '#0f172a', lineHeight: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{kpi.count}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: { xs: 32, sm: 44 }, height: { xs: 32, sm: 44 }, borderRadius: 2, flexShrink: 0 }}>{kpi.icon}</Avatar>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* ROW 1: 100% WIDTH TABLE (WITH MOBILE RESPONSIVE CARDS) */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', bgcolor: 'white' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="700" color="#0f172a" sx={{ fontSize: '1.1rem' }}>Today's Flow</Typography>
          </Box>

          {/* MOBILE VIEW */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#f8fafc', p: 2 }}>
            {paginatedSchedule.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: '#cbd5e1', mb: 2, mx: 'auto', border: '1px solid #e2e8f0' }}><AssignmentIndIcon /></Avatar>
                <Typography variant="subtitle2" fontWeight="700" color="#475569">Queue is Empty</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {paginatedSchedule.map((appt) => (
                  <Paper key={appt._id} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white' }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="800" color="#334155" display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} /> {appt.time}
                      </Typography>
                      {getStatusChip(appt.status)}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="800" sx={{ cursor: 'pointer', color: primaryColor, mb: 0.25 }} onClick={() => navigate(`/patients/${appt.patientId}`)}>
                        {appt.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">
                        Dr. {appt.doc}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
                      <Box>
                        {appt.payStatus === 'Paid' && <Typography variant="caption" fontWeight="800" color="#16a34a">PAID</Typography>}
                        {appt.payStatus === 'Pending' && <Typography variant="caption" fontWeight="800" color="#dc2626">₹{appt.dueAmount} DUE</Typography>}
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" sx={{ color: '#25D366', bgcolor: '#dcfce7' }}>
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                        {appt.status === 'Scheduled' && (
                          <Button size="small" variant="contained" onClick={() => handleStatusUpdate(appt._id, 'In Progress')} sx={{ bgcolor: primaryColor, borderRadius: 1.5, fontWeight: 700, textTransform: 'none', px: 2, boxShadow: 'none' }}>Check In</Button>
                        )}
                        {appt.status === 'In Progress' && (
                          <Button size="small" variant="outlined" color="success" onClick={() => handleStatusUpdate(appt._id, 'Completed')} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', px: 2 }}>Finish</Button>
                        )}
                        {appt.status === 'Completed' && (
                          <Button size="small" variant="outlined" color="inherit" onClick={() => navigate(`/patients/${appt.patientId}`)} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', color: '#475569', borderColor: '#cbd5e1', px: 2 }}>Bill</Button>
                        )}
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          {/* DESKTOP VIEW */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 700, '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    {['TIME', 'PATIENT & DOCTOR', 'STATUS', 'BILLING', 'ACTION'].map((head, i) => (
                      <TableCell key={head} align={i === 4 ? 'right' : 'left'} sx={{ bgcolor: '#f8fafc', fontWeight: '700', fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>{head}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSchedule.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f8fafc', color: '#cbd5e1', mb: 2, mx: 'auto' }}><AssignmentIndIcon fontSize="large" /></Avatar>
                        <Typography variant="h6" fontWeight="600" color="#475569">Queue is Empty</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSchedule.map((appt) => (
                      <TableRow key={appt._id} hover sx={{ transition: 'background-color 0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9', width: '120px' }}>
                          <Typography variant="body2" fontWeight="600" color="#334155" display="flex" alignItems="center" gap={0.5}><AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} /> {appt.time}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          <Typography variant="body2" fontWeight="700" sx={{ cursor: 'pointer', color: '#0f172a', '&:hover': { color: primaryColor }, lineHeight: 1.2 }} onClick={() => navigate(`/patients/${appt.patientId}`)}>{appt.name}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight="500">Dr. {appt.doc}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>{getStatusChip(appt.status)}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          {appt.payStatus === 'Paid' && <Typography variant="caption" fontWeight="700" color="#16a34a">PAID</Typography>}
                          {appt.payStatus === 'Pending' && <Typography variant="caption" fontWeight="700" color="#dc2626">₹{appt.dueAmount} DUE</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="WhatsApp Patient">
                              <IconButton size="small" sx={{ color: '#25D366', bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' }, p: 0.5 }}><WhatsAppIcon sx={{ fontSize: '1.1rem' }} /></IconButton>
                            </Tooltip>
                            {appt.status === 'Scheduled' && (
                              <Button size="small" variant="contained" onClick={() => handleStatusUpdate(appt._id, 'In Progress')} sx={{ bgcolor: primaryColor, minWidth: 0, px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}><PlayArrowIcon fontSize="small" sx={{ mr: 0.25 }} /> Check In</Button>
                            )}
                            {appt.status === 'In Progress' && (
                              <Button size="small" variant="outlined" color="success" onClick={() => handleStatusUpdate(appt._id, 'Completed')} sx={{ minWidth: 0, px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}><CheckCircleIcon fontSize="small" sx={{ mr: 0.25 }} /> Finish</Button>
                            )}
                            {appt.status === 'Completed' && (
                              <Button size="small" variant="outlined" color="inherit" onClick={() => navigate(`/patients/${appt.patientId}`)} sx={{ minWidth: 0, px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: '#475569', borderColor: '#cbd5e1' }}><PointOfSaleIcon fontSize="small" sx={{ mr: 0.25 }} /> Bill</Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {todayFlow.length > 0 && (
            <Box sx={{ borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <TablePagination component="div" count={todayFlow.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10, 25, 50]} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
            </Box>
          )}
        </Paper>
      </Box>

      {/* ROW 2: BOTTOM WIDGETS (PERFECT CSS GRID) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        width: '100%',
        alignItems: 'stretch',
        height: { md: '450px' } // Forces equal height limit on desktop to trigger internal scrolling
      }}>

        {/* LEFT SIDE: Quick Actions & Doctor Status */}
        <Stack spacing={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* QUICK ACTIONS PAD */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', bgcolor: 'white', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight="700" color="#0f172a" mb={2}>Quick Actions</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2
            }}>
              {[
                { label: "New Patient", icon: <PersonAddIcon />, color: "#4f46e5", bg: "#e0e7ff", link: "/patients/new" },
                { label: "Walk-In", icon: <DirectionsRunIcon />, color: "#d97706", bg: "#fef3c7", link: "/calendar" },
                { label: "Add Expense", icon: <RequestQuoteIcon />, color: "#dc2626", bg: "#fee2e2", actionType: "modal", target: "expense" },
                { label: "Restock", icon: <InventoryIcon />, color: "#059669", bg: "#d1fae5", link: "/inventory" }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  fullWidth
                  onClick={() => action.actionType === "modal" ? setExpenseModalOpen(true) : navigate(action.target)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2,
                    borderRadius: 2, bgcolor: action.bg, color: action.color, height: '100%',
                    textTransform: 'none', '&:hover': { bgcolor: alpha(action.color, 0.2) }
                  }}
                >
                  {action.icon}
                  <Typography variant="caption" fontWeight="700" sx={{ mt: 1 }}>{action.label}</Typography>
                </Button>
              ))}
            </Box>
          </Paper>

          {/* DOCTOR STATUS (SCROLLABLE) */}
          <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', bgcolor: 'white' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <Typography variant="subtitle2" fontWeight="700" color="#0f172a">Doctor Status</Typography>
            </Box>

            {/* Scrollable Container */}
            <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
              <Stack spacing={1.5}>
                {doctorStatus.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}><Typography variant="body2" color="text.secondary" fontWeight="500">No doctors clocked in.</Typography></Box>
                ) : (
                  doctorStatus.map((cabin, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: cabin.status === 'Busy' ? '#fef2f2' : '#f0fdf4', borderRadius: 2, border: '1px solid', borderColor: cabin.status === 'Busy' ? '#fecaca' : '#bbf7d0' }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'white', color: cabin.status === 'Busy' ? '#dc2626' : '#16a34a', fontWeight: 'bold', fontSize: '1rem', border: '1px solid rgba(0,0,0,0.1)', mr: 2 }}>{cabin.doctor ? cabin.doctor.charAt(0) : '?'}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="700" color="#0f172a" lineHeight={1.1}>{cabin.doctor}</Typography>
                        <Typography variant="caption" fontWeight="700" sx={{ color: cabin.status === 'Busy' ? '#dc2626' : '#16a34a' }}>{cabin.status === 'Busy' ? `With ${cabin.patient}` : 'AVAILABLE'}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>
          </Paper>

        </Stack>

        {/* RIGHT SIDE: Operations & Financials */}
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', bgcolor: 'white' }}>

          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight="700" color="#0f172a">Operations & Financials</Typography>
          </Box>

          <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
            <Typography variant="caption" fontWeight="800" color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Day End Drawer</Typography>
            <Typography variant="h4" fontWeight="800" color="#15803d" sx={{ mb: 2, mt: 0.5 }}>₹ {cashDrawer?.total?.toLocaleString() || 0}</Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="#64748b" fontWeight="600" display="block">Cash</Typography>
                <Typography variant="body1" fontWeight="700" color="#0f172a">₹ {cashDrawer?.cash?.toLocaleString() || 0}</Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="#64748b" fontWeight="600" display="block">UPI/Online</Typography>
                {/*  BUG FIX: Changed 'upi' to 'online' based on your backend response */}
                <Typography variant="body1" fontWeight="700" color="#0f172a">₹ {cashDrawer?.online?.toLocaleString() || 0}</Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ flexShrink: 0 }} />

          {/* INVENTORY SUMMARY (SCROLLABLE) */}
          <Box sx={{ p: 3, pt: 2, bgcolor: '#fafafa', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
              <Typography variant="caption" fontWeight="800" color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Inventory Summary</Typography>
            </Box>

            {lowInventory?.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: '1.2rem' }} />
                <Typography variant="body2" fontWeight="600" color="#166534">All inventory items are well stocked.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {lowInventory.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderLeft: '4px solid #ef4444', bgcolor: 'white', borderRadius: '0 6px 6px 0', border: '1px solid #fecaca', borderLeftWidth: '4px', flexShrink: 0 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="#0f172a" sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                      <Typography variant="caption" fontWeight="600" color="#dc2626">Only {item.quantity} left</Typography>
                    </Box>
                    <WarningAmberIcon color="error" fontSize="small" />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

      </Box>
      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSuccess={loadData} // This triggers the dashboard to refresh the Cash Drawer math instantly!
      />
    </Box>
  );
}