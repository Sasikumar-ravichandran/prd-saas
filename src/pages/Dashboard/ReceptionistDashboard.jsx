import React from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, IconButton, Stack,
  Divider, Checkbox, Tooltip, Badge
} from '@mui/material';

// Icons
import AddBoxIcon from '@mui/icons-material/AddBox';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';

// --- MOCK DATA ---
// 1. Live Flow (The main job)
const TODAY_APPOINTMENTS = [
  { time: '10:00 AM', name: 'Ravi Kumar', doc: 'Dr. Ramesh', status: 'In Chair', payStatus: 'Paid', amount: 500 },
  { time: '10:30 AM', name: 'Anita Raj', doc: 'Dr. Priya', status: 'Waiting', payStatus: 'Pending', amount: 1200 },
  { time: '10:45 AM', name: 'Suresh B', doc: 'Dr. Ramesh', status: 'Arrived', payStatus: 'Unbilled', amount: 0 },
  { time: '11:00 AM', name: 'Meena K', doc: 'Dr. Bench', status: 'Late', payStatus: '-', amount: 0 },
  { time: '11:15 AM', name: 'Rahul V', doc: 'Dr. Priya', status: 'Scheduled', payStatus: '-', amount: 0 },
  { time: '11:30 AM', name: 'Karthik S', doc: 'Dr. Ramesh', status: 'Scheduled', payStatus: '-', amount: 0 },
];

// 2. Doctor Status (Traffic Signals)
const CABINS = [
  { id: 1, doctor: 'Dr. Ramesh', status: 'Busy', patient: 'Ravi K', timer: '15m' },
  { id: 2, doctor: 'Dr. Priya', status: 'Available', patient: '-', timer: '-' },
  { id: 3, doctor: 'Dr. Bench', status: 'Available', patient: '-', timer: '-' },
];

// 3. Call Queue (The "Downtime" work)
const RECALL_LIST = [
  { name: 'Pooja M', reason: 'Confirm Tmrw', phone: '984...', done: false },
  { name: 'Amit S', reason: 'Payment Due', phone: '996...', done: false },
  { name: 'John D', reason: '6 Month Checkup', phone: '912...', done: true },
  { name: 'Sneha R', reason: 'Lab Report Ready', phone: '887...', done: false },
];

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
  let color = '#e0e0e0';
  let text = '#757575';
  let bg = '#f5f5f5';

  if (status === 'In Chair') { color = '#1976d2'; bg = '#e3f2fd'; text = '#1565c0'; }
  if (status === 'Waiting') { color = '#ed6c02'; bg = '#fff7ed'; text = '#c2410c'; }
  if (status === 'Arrived') { color = '#2e7d32'; bg = '#e8f5e9'; text = '#1b5e20'; }
  if (status === 'Late') { color = '#d32f2f'; bg = '#feb2b2'; text = '#c53030'; }

  return (
    <Chip
      label={status} size="small"
      sx={{ bgcolor: bg, color: text, fontWeight: 'bold', borderRadius: 1, border: `1px solid ${color}40`, height: 24 }}
    />
  );
};

export default function ReceptionistDashboard() {
  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', p: 3, mx: -3, my: -3 }}>

      {/* 1. HEADER (Operational Focus) */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="900" color="#1a2027">Front Desk Ops</Typography>
          <Typography variant="body2" color="text.secondary">
            Today's Flow • {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<SearchIcon />} sx={{ bgcolor: 'white', color: 'text.secondary', border: '1px solid #ddd', borderRadius: 2 }}>
            Find Patient (Cmd+K)
          </Button>
          <Button variant="contained" startIcon={<AddBoxIcon />} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}>
            Walk-in Register
          </Button>
        </Stack>
      </Box>

      {/* 2. TRAFFIC SIGNALS (Doctor Availability) - Placed Top for Instant Visibility */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {CABINS.map((cabin) => (
          <Grid item xs={12} md={4} key={cabin.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2, borderRadius: 2, border: '1px solid',
                borderColor: cabin.status === 'Busy' ? '#ffcdd2' : '#c8e6c9',
                bgcolor: cabin.status === 'Busy' ? '#fff5f5' : '#f1f8e9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'white', color: cabin.status === 'Busy' ? '#d32f2f' : '#2e7d32', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.1)' }}>
                  {cabin.id}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{cabin.doctor}</Typography>
                  <Typography variant="caption" fontWeight="600" sx={{ color: cabin.status === 'Busy' ? '#c62828' : '#2e7d32' }}>
                    {cabin.status === 'Busy' ? `Busy (${cabin.patient})` : 'AVAILABLE'}
                  </Typography>
                </Box>
              </Box>
              {cabin.status === 'Busy' && (
                <Chip label={cabin.timer} size="small" icon={<AccessTimeIcon />} sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} alignItems="stretch">

        {/* --- LEFT: APPOINTMENT FLOW & BILLING (The Queue) --- */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>

            {/* Toolbar */}
            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6" fontWeight="800">Today's Appointments</Typography>
                <Chip label="2 Waiting" size="small" color="warning" sx={{ borderRadius: 1, fontWeight: 'bold' }} />
              </Stack>
            </Box>

            {/* Table */}
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>TIME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>PATIENT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>BILLING</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: '#f9fafb' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TODAY_APPOINTMENTS.map((row, i) => (
                    <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 2 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#111827' }}>{row.time}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="700">{row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.doc}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                      <TableCell>
                        {row.payStatus === 'Paid' && <Chip label="Paid" size="small" color="success" variant="outlined" sx={{ fontWeight: 'bold', height: 20 }} />}
                        {row.payStatus === 'Pending' && <Chip label="₹ 1200 Due" size="small" color="error" sx={{ fontWeight: 'bold', height: 20 }} />}
                        {row.payStatus === 'Unbilled' && <Typography variant="caption" color="text.secondary">Not Created</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        {row.status === 'Waiting' && (
                          <Button size="small" variant="contained" endIcon={<PlayCircleFilledWhiteIcon />} sx={{ borderRadius: 1, textTransform: 'none' }}>
                            Check In
                          </Button>
                        )}
                        {row.status === 'In Chair' && (
                          <Button size="small" variant="outlined" startIcon={<CurrencyRupeeIcon />} sx={{ borderRadius: 1, textTransform: 'none' }}>
                            Create Bill
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

        {/* --- RIGHT: TASKS & COMMUNICATIONS (The "To-Do" List) --- */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ height: '100%' }}>

            {/* 1. CALL QUEUE (High Priority for Reception) */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="800">Call Queue / Reminders</Typography>
                <Chip label="3 Left" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
              </Box>

              <Stack spacing={0}>
                {RECALL_LIST.map((task, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px dashed #eee', opacity: task.done ? 0.5 : 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox size="small" checked={task.done} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{task.reason}</Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="success" sx={{ border: '1px solid #a5d6a7' }}><PhoneInTalkIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="success" sx={{ border: '1px solid #a5d6a7' }}><WhatsAppIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth size="small" sx={{ mt: 2, color: 'text.secondary' }}>View All Reminders</Button>
            </Paper>

            {/* 2. CASH DRAWER STATUS (Simple Finance) */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase' }}>Cash Drawer (Today)</Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                <Typography variant="h3" fontWeight="800" color="#2e7d32">₹ 4,500</Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">Cash Collected</Typography>
              </Box>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" fontWeight="bold">UPI / GPay</Typography>
                  <Typography variant="caption" fontWeight="bold">₹ 8,200</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" fontWeight="bold" color="error">Pending Collections</Typography>
                  <Typography variant="caption" fontWeight="bold" color="error">₹ 2,400</Typography>
                </Box>
              </Stack>

              <Button fullWidth variant="contained" color="success" startIcon={<CurrencyRupeeIcon />} sx={{ mt: 2, borderRadius: 2, fontWeight: 'bold' }}>
                Day End Closing
              </Button>
            </Paper>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}