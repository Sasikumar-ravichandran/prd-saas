import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Stack, IconButton, InputBase, Grid,
  Tabs, Tab, Tooltip, CircularProgress, Alert, Container
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
import RefreshIcon from '@mui/icons-material/Refresh'; // Added Refresh Icon

import { useColorMode } from '../../context/ThemeContext';
import { patientService } from '../../api/services/patientService'; // Ensure path is correct

// Components
import AddPatientModal from '../../components/Patients/AddPatientModal';

export default function PatientList() {
  const navigate = useNavigate();
  const { primaryColor } = useColorMode();

  // --- STATE ---
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API CALL ---
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
      setError("Failed to load patient directory. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleEdit = (e, patient) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleModalSubmit = () => {
    fetchPatients(); // Refresh list after Add/Edit
    // Note: The modal closes itself, so we don't need to do it here
  };

  // --- FILTER LOGIC (Using Real Data) ---
  const filteredPatients = patients.filter(p => {
    // Safety check: ensure fields exist before calling toLowerCase()
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const phoneMatch = p.mobile?.includes(searchTerm) || false;
    
    // Status Logic (Backend might not have 'status' yet, so we default to Active)
    const status = p.isActive ? 'Active' : 'Inactive';
    
    const matchesTab = tabValue === 'all' ? true : (tabValue === 'active' ? status === 'Active' : status !== 'Active');
    
    return (nameMatch || phoneMatch) && matchesTab;
  });

  // --- RENDER LOADING STATE ---
  if (loading) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress sx={{ color: primaryColor }} />
        <Typography color="text.secondary" fontWeight="500">Loading Patient Directory...</Typography>
      </Box>
    );
  }

  // --- RENDER ERROR STATE ---
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchPatients}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* 1. HEADER & STATS */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1e293b">Patient Directory</Typography>
            <Typography variant="body2" color="text.secondary">Manage your patient records and clinical history</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
             <Button variant="outlined" onClick={fetchPatients} startIcon={<RefreshIcon />}>
                Refresh
             </Button>
             <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ bgcolor: primaryColor, borderRadius: 2, px: 3, py: 1, fontWeight: 'bold', '&:hover': { bgcolor: '#334155' } }}
            >
              Add Patient
            </Button>
          </Stack>
        </Stack>

        {/* Quick Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#eff6ff', color: primaryColor }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#1e293b">{patients.length}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL PATIENTS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#f0fdf4', color: '#16a34a' }}><ArrowOutwardIcon /></Avatar>
              <Box>
                {/* Logic to count patients created this month */}
                <Typography variant="h5" fontWeight="800" color="#1e293b">
                  {patients.filter(p => new Date(p.createdAt) > new Date(new Date().setDate(1))).length}
                </Typography>
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
            {/* <Tab label="Due for Recall" value="due" /> */}
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
            {/* <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ borderColor: '#e2e8f0', color: '#64748b', fontWeight: 'bold' }}>Filters</Button> */}
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pl: 3 }}>PATIENT NAME</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>CONTACT INFO</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>UPDATED</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>STATUS</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>BALANCE</TableCell>
                <TableCell align="right" sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((row) => (
                <TableRow
                  key={row._id} // Use MongoDB _id
                  hover
                  onClick={() => navigate(`/patients/${row.patientId}`)} // Navigate using PID
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' }, transition: '0.1s' }}
                >
                  {/* Name & Avatar */}
                  <TableCell sx={{ pl: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: row.gender === 'Female' ? '#fce7f3' : '#e0f2fe', color: row.gender === 'Female' ? '#db2777' : '#0284c7', width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
                        {row.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{row.fullName}</Typography>
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
                    <Typography variant="caption" color="text.secondary">ID: {row.patientId}</Typography>
                  </TableCell>

                  {/* Last Visit / Updated */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="600" color="#334155">
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.primaryConcern || 'General Checkup'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={row.isActive ? 'Active' : 'Archived'}
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.7rem', fontWeight: 'bold', borderRadius: 1,
                        bgcolor: row.isActive ? '#dcfce7' : '#f1f5f9',
                        color: row.isActive ? '#166534' : '#64748b'
                      }}
                    />
                  </TableCell>

                  {/* Balance (Using fallback 0 if undefined) */}
                  <TableCell>
                    {(row.walletBalance || 0) > 0 ? (
                      <Typography variant="body2" fontWeight="700" color="#dc2626">₹ {(row.walletBalance || 0).toLocaleString()}</Typography>
                    ) : (
                      <Typography variant="caption" fontWeight="bold" color="#16a34a" sx={{ bgcolor: '#dcfce7', px: 1, py: 0.5, borderRadius: 1 }}>PAID</Typography>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Stack direction="row" justifyContent="flex-end">
                      <Tooltip title="View Profile">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.patientId}`) }}>
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

              {/* Empty State */}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                       {patients.length === 0 ? "No patients yet. Click 'Add Patient' to start." : "No matching patients found."}
                    </Typography>
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
        onSubmit={handleModalSubmit} // <--- REFRESH LIST ON SAVE
        initialData={selectedPatient}
      />
    </Box>
  );
}