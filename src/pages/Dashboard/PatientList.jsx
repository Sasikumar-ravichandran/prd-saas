import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Stack, IconButton, InputBase, Grid,
  Tabs, Tab, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import PersonIcon from '@mui/icons-material/Person';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { useColorMode } from '../../context/ThemeContext';

// Components
import AddPatientModal from '../../components/Patients/AddPatientModal';

// --- MOCK DATA ---
const MOCK_PATIENTS = [
  { id: 'P-101', name: 'Ravi Kumar', age: 34, gender: 'Male', mobile: '9840012345', lastVisit: '12 Oct 2024', concern: 'Tooth Pain (RCT)', status: 'Treatment Due', balance: 4500 },
  { id: 'P-102', name: 'Anita Raj', age: 28, gender: 'Female', mobile: '9900054321', lastVisit: '05 Feb 2026', concern: 'Routine Cleaning', status: 'Active', balance: 0 },
  { id: 'P-103', name: 'Suresh Menon', age: 45, gender: 'Male', mobile: '9876543210', lastVisit: '01 Feb 2026', concern: 'Implant Consultation', status: 'New', balance: 0 },
  { id: 'P-104', name: 'Meera N.', age: 22, gender: 'Female', mobile: '9123456789', lastVisit: '20 Jan 2026', concern: 'Braces Adjustment', status: 'Active', balance: 1500 },
  { id: 'P-105', name: 'Arjun Das', age: 50, gender: 'Male', mobile: '9988776655', lastVisit: '10 Dec 2025', concern: 'Denture Checkup', status: 'Follow-up', balance: 0 },
];

export default function PatientList() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { primaryColor } = useColorMode();

  // 1. Handle "Add New"
  const handleAddNew = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  // 2. Edit Action
  const handleEdit = (e, patient) => {
    e.stopPropagation(); // Prevent row click
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  // 3. Filter Logic
  const filteredPatients = MOCK_PATIENTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm);
    const matchesTab = tabValue === 'all' ? true : (tabValue === 'active' ? p.status === 'Active' : p.status !== 'Active');
    return matchesSearch && matchesTab;
  });

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* 1. HEADER & STATS */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1e293b">Patient Directory</Typography>
            <Typography variant="body2" color="text.secondary">Manage your patient records and clinical history</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ bgcolor: primaryColor, borderRadius: 2, px: 3, py: 1, fontWeight: 'bold', '&:hover': { bgcolor: '#334155' } }}
          >
            Add Patient
          </Button>
        </Stack>

        {/* Quick Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#eff6ff', color: primaryColor }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#1e293b">{MOCK_PATIENTS.length}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL PATIENTS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#f0fdf4', color: '#16a34a' }}><ArrowOutwardIcon /></Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#1e293b">12</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">NEW THIS MONTH</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 2. MAIN TABLE CARD */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Toolbar */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ minHeight: 40, '& .MuiTab-root': { fontWeight: 'bold', minHeight: 40, textTransform: 'none' } }}
          >
            <Tab label="All Patients" value="all" />
            <Tab label="Active Treatment" value="active" />
            <Tab label="Due for Recall" value="due" />
          </Tabs>

          <Stack direction="row" spacing={2}>
            <Paper component="form" sx={{ p: '2px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <SearchIcon sx={{ color: '#94a3b8' }} />
              <InputBase
                sx={{ ml: 1, flex: 1, fontWeight: 600, fontSize: '0.9rem' }}
                placeholder="Search name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Paper>
            <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ borderColor: '#e2e8f0', color: '#64748b', fontWeight: 'bold' }}>Filters</Button>
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pl: 3 }}>PATIENT NAME</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>CONTACT INFO</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>LAST VISIT</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>STATUS</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>BALANCE</TableCell>
                <TableCell align="right" sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => navigate(`/patients/${row.id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' }, transition: '0.1s' }}
                >
                  {/* Name & Avatar */}
                  <TableCell sx={{ pl: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: row.gender === 'Female' ? '#fce7f3' : '#e0f2fe', color: row.gender === 'Female' ? '#db2777' : '#0284c7', width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
                        {row.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{row.name}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {row.gender === 'Female' ? <FemaleIcon sx={{ fontSize: 12, color: '#ec4899' }} /> : <MaleIcon sx={{ fontSize: 12, color: primaryColor }} />}
                          <Typography variant="caption" color="text.secondary">{row.age} yrs</Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="#334155">{row.mobile}</Typography>
                    <Typography variant="caption" color="text.secondary">ID: {row.id}</Typography>
                  </TableCell>

                  {/* Last Visit */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="600" color="#334155">{row.lastVisit}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.concern}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.7rem', fontWeight: 'bold', borderRadius: 1,
                        bgcolor: row.status === 'Active' ? '#dcfce7' : (row.status === 'New' ? '#eff6ff' : '#ffedd5'),
                        color: row.status === 'Active' ? '#166534' : (row.status === 'New' ? '#1d4ed8' : '#9a3412')
                      }}
                    />
                  </TableCell>

                  {/* Balance */}
                  <TableCell>
                    {row.balance > 0 ? (
                      <Typography variant="body2" fontWeight="700" color="#dc2626">₹ {row.balance.toLocaleString()}</Typography>
                    ) : (
                      <Typography variant="caption" fontWeight="bold" color="#16a34a" sx={{ bgcolor: '#dcfce7', px: 1, py: 0.5, borderRadius: 1 }}>PAID</Typography>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Stack direction="row" justifyContent="flex-end">
                      <Tooltip title="View Profile">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.id}`) }}>
                          <VisibilityIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton size="small" onClick={(e) => handleEdit(e, row)}>
                          <MoreHorizIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}

              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No patients found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 3. The Modal */}
      <AddPatientModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(data) => console.log("Saved:", data)}
        initialData={selectedPatient}
      />
    </Box>
  );
}