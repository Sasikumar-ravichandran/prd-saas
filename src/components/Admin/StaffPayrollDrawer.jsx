import React, { useState } from 'react';
import { 
  Drawer, Box, Typography, IconButton, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Paper, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function StaffPayrollDrawer({ open, onClose, staffData }) {
  const [tabValue, setTabValue] = useState(0);

  if (!staffData) return null;

  const isDoctor = staffData.role.toLowerCase() === 'doctor';

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: '600px' }, bgcolor: '#f8fafc' } }}>
      
      {/* HEADER */}
      <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight="800" color="#0f172a">{staffData.name}</Typography>
            <Chip label={staffData.role} size="small" sx={{ mt: 1, fontWeight: 700, bgcolor: isDoctor ? '#e0e7ff' : '#f3e8ff', color: isDoctor ? '#4f46e5' : '#9333ea' }} />
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Paper sx={{ mt: 3, p: 2.5, bgcolor: '#0f172a', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="#94a3b8" fontWeight="700">FINAL PAYOUT DUE</Typography>
            <Typography variant="h3" fontWeight="800">₹ {staffData.payoutDue?.toLocaleString()}</Typography>
          </Box>
          <Chip label={staffData.compType} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }} />
        </Paper>
      </Box>

      {/* PAYROLL MATH (Always Visible) */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight="800" color="#64748b" mb={1.5}>PAYROLL BREAKDOWN</Typography>
        <Stack spacing={1.5} sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="#64748b" fontWeight="600">Base Salary</Typography>
            <Typography fontWeight="800" color="#0f172a">₹ {staffData.baseSalary?.toLocaleString()}</Typography>
          </Stack>
          
          {staffData.attendanceSummary?.leaveDeductions > 0 && (
            <Stack direction="row" justifyContent="space-between" sx={{ color: '#dc2626' }}>
              <Typography fontWeight="600">Leaves ({staffData.attendanceSummary.unpaidLeaves} Unpaid, {staffData.attendanceSummary.halfDays} Half)</Typography>
              <Typography fontWeight="800">- ₹ {staffData.attendanceSummary.leaveDeductions.toLocaleString()}</Typography>
            </Stack>
          )}

          {isDoctor && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="#64748b" fontWeight="600">Total Commission</Typography>
              <Typography fontWeight="800" color="#10b981">+ ₹ {staffData.totalCommission?.toLocaleString()}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* DOCTOR METRICS DASHBOARD */}
      {isDoctor && staffData.metrics && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="subtitle2" fontWeight="800" color="#64748b" mb={1.5}>PERFORMANCE & PIPELINE</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center' }}>
                <FactCheckIcon sx={{ color: '#3b82f6', mb: 1 }} />
                <Typography variant="h5" fontWeight="800" color="#0f172a">{staffData.metrics.treatmentsCompleted}</Typography>
                <Typography variant="caption" fontWeight="700" color="#64748b">TREATMENTS DONE</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center' }}>
                <EventAvailableIcon sx={{ color: '#f59e0b', mb: 1 }} />
                <Typography variant="h5" fontWeight="800" color="#0f172a">{staffData.metrics.upcomingVisits}</Typography>
                <Typography variant="caption" fontWeight="700" color="#64748b">PIPELINE (NEXT 30D)</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center', bgcolor: '#f0fdf4' }}>
                <TrendingUpIcon sx={{ color: '#10b981', mb: 1 }} />
                <Typography variant="h6" fontWeight="800" color="#166534">₹{(staffData.metrics.projectedRevenue/1000).toFixed(1)}k</Typography>
                <Typography variant="caption" fontWeight="700" color="#166534">PROJECTED REV</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TABS (Receptionists only see Attendance, Doctors see both) */}
      <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ px: 3, borderBottom: '1px solid #e2e8f0' }}>
        {isDoctor && <Tab label="Commission Ledger" sx={{ fontWeight: 700 }} />}
        <Tab label="Attendance Details" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* TAB CONTENT */}
      <Box sx={{ p: 3, flexGrow: 1, bgcolor: 'white' }}>
        
        {/* DOCTOR LEDGER VIEW */}
        {tabValue === 0 && isDoctor ? (
           staffData.ledger?.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PATIENT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>CUT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffData.ledger.map((item, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="700">{item.patientName}</Typography>
                        <Typography variant="caption" color="#64748b">{item.procedure}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>₹ {item.doctorCut.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="#64748b" textAlign="center" py={4}>No commission procedures completed this month.</Typography>
          )
        ) : (
          
          /* ⚡️ THE FIXED COMPREHENSIVE ATTENDANCE DASHBOARD */
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight="800" color="#0f172a" mb={2}>Attendance Breakdown</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                  <Typography variant="h6" fontWeight="800" color="#166534">{staffData.attendanceSummary?.presents || 0}</Typography>
                  <Typography variant="caption" fontWeight="700" color="#166534">PRESENT</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid #bae6fd', bgcolor: '#f0f9ff' }}>
                  <Typography variant="h6" fontWeight="800" color="#0369a1">{staffData.attendanceSummary?.paidLeaves || 0}</Typography>
                  <Typography variant="caption" fontWeight="700" color="#0369a1">PAID LEAVE</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
                  <Typography variant="h6" fontWeight="800" color="#991b1b">{staffData.attendanceSummary?.unpaidLeaves || 0}</Typography>
                  <Typography variant="caption" fontWeight="700" color="#991b1b">UNPAID LEAVE</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <Typography variant="h6" fontWeight="800" color="#475569">{staffData.attendanceSummary?.weeklyOffs || 0}</Typography>
                  <Typography variant="caption" fontWeight="700" color="#475569">WEEKLY OFF</Typography>
                </Paper>
              </Grid>
            </Grid>

            {staffData.attendanceSummary?.leaveDeductions > 0 && (
              <Typography variant="body2" color="#dc2626" fontWeight="600" mt={3} textAlign="center">
                * Unpaid leaves resulted in a deduction of ₹{staffData.attendanceSummary.leaveDeductions.toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}