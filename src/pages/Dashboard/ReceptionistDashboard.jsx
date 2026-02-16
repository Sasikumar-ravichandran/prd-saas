import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack,
  CircularProgress, Alert, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/services/dashboardService'; // Ensure this path is correct
import api from '../../api/services/api';

// Icons
import AddBoxIcon from '@mui/icons-material/AddBox';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useColorMode } from '../../context/ThemeContext';

// --- COMPONENTS ---
const StatusBadge = ({ status }) => {
  let color = '#757575'; let bg = '#f5f5f5';
  let label = status || 'Unknown';

  if (status === 'In Progress') { color = '#1976d2'; bg = '#e3f2fd'; label = 'In Chair'; }
  else if (status === 'Scheduled') { color = '#ed6c02'; bg = '#fff7ed'; label = 'Waiting'; }
  else if (status === 'Completed') { color = '#2e7d32'; bg = '#e8f5e9'; }
  else if (status === 'Cancelled') { color = '#d32f2f'; bg = '#feb2b2'; }
  return (
    <Chip label={label} size="small" sx={{ bgcolor: bg, color: color, fontWeight: 'bold', borderRadius: 1, height: 24 }} />
  );
};

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { primaryColor } = useColorMode()

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getReceptionData();
      setData(res);
    } catch (err) {
      console.error("Dashboard failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Action Handlers
  const handleStatusUpdate = async (apptId, newStatus) => {
    try {
      await api.put(`/appointments/${apptId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleBillClick = (patientId) => {
    if (patientId) navigate(`/patients/${patientId}`);
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!data) return <Box sx={{ p: 5 }}><Alert severity="error">Failed to load data</Alert></Box>;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', p: 3 }}>

      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="900" color="#1a2027">Front Desk Ops</Typography>
          <Typography variant="body2" color="text.secondary">
            Today's Flow • {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<RefreshIcon />} onClick={fetchData} sx={{ bgcolor: 'white', color: 'text.secondary', border: '1px solid #ddd' }}>
            Refresh
          </Button>
          <Button startIcon={<SearchIcon />} onClick={() => navigate('/patients')} sx={{ bgcolor: 'white', color: 'text.secondary', border: '1px solid #ddd' }}>
            Find Patient
          </Button>
          <Button variant="contained" startIcon={<AddBoxIcon />} onClick={() => navigate('/calendar')} sx={{ fontWeight: 'bold', bgcolor: primaryColor }}>
            New Appt
          </Button>
        </Stack>
      </Box>

      {/* 2. DOCTOR TRAFFIC LIGHTS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {data.doctorStatus?.map((cabin) => (
          <Grid item xs={12} md={4} key={cabin.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2, borderRadius: 3, border: '1px solid',
                borderColor: cabin.status === 'Busy' ? '#ffcdd2' : '#c8e6c9',
                bgcolor: cabin.status === 'Busy' ? '#fff5f5' : '#f1f8e9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'white', color: cabin.status === 'Busy' ? '#d32f2f' : '#2e7d32', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {cabin.doctor ? cabin.doctor.charAt(0) : '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{cabin.doctor}</Typography>
                  <Typography variant="caption" fontWeight="800" sx={{ color: cabin.status === 'Busy' ? '#c62828' : '#2e7d32', textTransform: 'uppercase' }}>
                    {cabin.status === 'Busy' ? `Busy (${cabin.patient})` : 'AVAILABLE'}
                  </Typography>
                </Box>
              </Box>
              {cabin.status === 'Busy' && (
                <Chip label="Active" size="small" icon={<AccessTimeIcon />} sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
              )}
            </Paper>
          </Grid>
        ))}
        {(!data.doctorStatus || data.doctorStatus.length === 0) && (
          <Grid item xs={12}><Alert severity="info">No doctors found for this clinic.</Alert></Grid>
        )}
      </Grid>

      <Grid container spacing={3} alignItems="stretch">

        {/* --- LEFT: APPOINTMENT FLOW (The Queue) --- */}
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6" fontWeight="800" color="#1e293b">Today's Appointments</Typography>
                <Chip label={`${data.todayFlow?.length || 0} Total`} size="small" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }} />
              </Stack>
            </Box>

            <TableContainer sx={{ flexGrow: 1 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem' }}>TIME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem' }}>PATIENT DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem' }}>BILLING</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b', bgcolor: '#f8fafc', fontSize: '0.75rem' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!data.todayFlow || data.todayFlow.length === 0) && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No appointments scheduled for today.</TableCell></TableRow>
                  )}
                  {data.todayFlow?.map((row) => (
                    <TableRow key={row._id} hover sx={{ '& td': { borderBottom: '1px solid #f1f5f9', py: 2 } }}>

                      {/* 1. Time */}
                      <TableCell sx={{ fontWeight: 700, color: '#334155' }}>{row.time}</TableCell>

                      {/* 2. Patient & Doctor (Fixed Mapping) */}
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="700"
                            sx={{ cursor: 'pointer', color: '#0f172a', '&:hover': { color: '#2563eb' } }}
                            onClick={() => handleBillClick(row.patientId)}
                          >
                            {row.name || 'Unknown Patient'}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" color="text.secondary">Dr. {row.doc || 'Unassigned'}</Typography>
                          </Stack>
                        </Box>
                      </TableCell>

                      {/* 3. Status */}
                      <TableCell><StatusBadge status={row.status} /></TableCell>

                      {/* 4. Billing */}
                      <TableCell>
                        {row.payStatus === 'Paid' && <Chip label="Paid" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold', height: 22 }} />}
                        {row.payStatus === 'Pending' && <Chip label={`₹${row.dueAmount} Due`} size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold', height: 22 }} />}
                        {row.payStatus === 'Unbilled' && <Typography variant="caption" color="text.secondary" fontWeight="600">No Active Bill</Typography>}
                      </TableCell>

                      {/* 5. Actions */}
                      <TableCell align="right">
                        {row.status === 'Scheduled' && (
                          <Button size="small" variant="contained" onClick={() => handleStatusUpdate(row._id, 'In Progress')} endIcon={<PlayCircleFilledWhiteIcon />} sx={{ borderRadius: 1.5, textTransform: 'none', bgcolor: '#3b82f6' }}>
                            Check In
                          </Button>
                        )}
                        {row.status === 'In Progress' && (
                          <Button size="small" variant="outlined" color="success" onClick={() => handleStatusUpdate(row._id, 'Completed')} startIcon={<CheckCircleIcon />} sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                            Finish
                          </Button>
                        )}
                        {row.status === 'Completed' && (
                          <Button size="small" variant="outlined" color="inherit" startIcon={<CurrencyRupeeIcon />} onClick={() => handleBillClick(row.patientId)} sx={{ borderRadius: 1.5, textTransform: 'none', color: '#64748b', borderColor: '#cbd5e1' }}>
                            Bill
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* --- RIGHT: CASH DRAWER & TASKS --- */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* 1. CASH DRAWER */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Cash Drawer (Today)
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
              <Typography variant="h3" fontWeight="800" color="#15803d">
                ₹ {data.cashDrawer?.total?.toLocaleString() || 0}
              </Typography>
              <Chip label="Total Collected" size="small" sx={{ fontWeight: 'bold', bgcolor: '#dcfce7', color: '#15803d' }} />
            </Box>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" color="#64748b">Cash</Typography>
                <Typography variant="body2" fontWeight="700" color="#0f172a">₹ {data.cashDrawer?.cash?.toLocaleString() || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" color="#64748b">UPI / GPay</Typography>
                <Typography variant="body2" fontWeight="700" color="#0f172a">₹ {data.cashDrawer?.upi?.toLocaleString() || 0}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="error">Pending from Queue</Typography>
                <Typography variant="caption" fontWeight="bold" color="error">
                  ₹ {data.todayFlow?.reduce((acc, curr) => acc + (curr.dueAmount > 0 ? curr.dueAmount : 0), 0).toLocaleString()}
                </Typography>
              </Box>
            </Stack>

            <Button fullWidth variant="contained" sx={{ mt: 3, borderRadius: 2, fontWeight: 'bold', bgcolor: '#15803d', py: 1 }} startIcon={<CurrencyRupeeIcon />}>
              Day End Closing Report
            </Button>
          </Paper>

          {/* 2. REMINDERS (Filling the remaining space properly) */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0e0e0', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="800" color="#1e293b">Task List & Reminders</Typography>
              <Chip label="0 Pending" size="small" sx={{ fontWeight: 'bold' }} />
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6, gap: 1 }}>
              <NotificationsActiveIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
              <Typography variant="body2" fontWeight="600" color="#64748b">No reminders due today.</Typography>
            </Box>

            <Button fullWidth size="small" variant="outlined" sx={{ mt: 2, color: 'text.secondary', borderColor: '#e2e8f0' }}>View All Tasks</Button>
          </Paper>

        </Grid>
      </Grid>
    </Box>
  );
}