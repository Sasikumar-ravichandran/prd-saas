import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Stack, IconButton, InputBase, Grid,
  Tabs, Tab, Tooltip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, TablePagination, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; 
import FilterListIcon from '@mui/icons-material/FilterList';

import { useColorMode } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext'; 
import { patientService } from '../../api/services/patientService';
import api from '../../api/services/api'; // ⚡️ Import API for fetching doctors

import AddPatientModal from '../../components/Patients/AddPatientModal';

export default function PatientList() {
  const navigate = useNavigate();
  const { primaryColor } = useColorMode();
  const { showToast } = useToast(); 

  // --- UI STATE ---
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // --- DATA STATE ---
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]); // ⚡️ State for real doctors
  
  // ⚡️ Separate counts for pagination vs global dashboard stats
  const [totalCount, setTotalCount] = useState(0); 
  const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0 }); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FILTER & PAGINATION STATE ---
  const [tabValue, setTabValue] = useState('all');
  const [searchInput, setSearchInput] = useState(''); 
  const [debouncedSearch, setDebouncedSearch] = useState(''); 
  const [doctorFilter, setDoctorFilter] = useState('');
  
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- FETCH DOCTORS ON MOUNT ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Adjust this endpoint if your user/staff route is different!
        const res = await api.get('/users?role=Doctor'); 
        setDoctorsList(res.data || []);
      } catch (err) {
        console.error("Failed to load doctors list", err);
      }
    };
    fetchDoctors();
  }, []);

  // --- ⚡️ SMART DEBOUNCE (3 Characters) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only search if they typed 3+ letters OR cleared the box completely
      if (searchInput.length >= 3 || searchInput.length === 0) {
        setDebouncedSearch(searchInput);
        setPage(0); // Reset to page 1
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- FETCH PATIENTS ---
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
          page: page + 1, 
          limit: rowsPerPage,
          search: debouncedSearch,
          filter: tabValue,
          doctor: doctorFilter
      };

      const data = await patientService.getAll(params);
      
      setPatients(data.patients || []);
      setTotalCount(data.totalCount || 0);
      
      // Update global stats from backend
      setGlobalStats({
          total: data.globalTotal || 0,
          pending: data.globalPending || 0
      });
      
    } catch (err) {
      console.error("Failed to fetch patients", err);
      setError("Failed to load patient directory.");
      showToast('Failed to load patient directory.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, tabValue, doctorFilter, showToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // --- HANDLERS ---
  const handlePageChange = (event, newPage) => setPage(newPage);
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
      setPage(0); 
  };

  const handleDoctorChange = (event) => {
      setDoctorFilter(event.target.value);
      setPage(0);
  };

  const handleAddNew = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleEdit = (e, patient) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleModalSubmit = () => fetchPatients();

  // --- DELETE LOGIC ---
  const handleDeleteClick = (e, patientId) => {
    e.stopPropagation(); 
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await patientService.delete(patientToDelete);
      showToast('Patient record deleted successfully', 'success');
      fetchPatients(); 
    } catch (err) {
      showToast('Failed to delete patient record', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  // --- RENDERING ---
  if (error) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 2 }, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* 1. HEADER */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="900" color={primaryColor}  sx={{ letterSpacing: -0.5 }}>Patient Directory</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">Manage your patient records and clinical files</Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={fetchPatients} startIcon={<RefreshIcon />} sx={{ bgcolor: 'white', color: '#475569', borderColor: '#cbd5e1', fontWeight: 'bold' }}>Refresh</Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ bgcolor: primaryColor, borderRadius: 2, px: 3, fontWeight: 'bold', boxShadow: 'none' }}
            >
              Add Patient
            </Button>
          </Stack>
        </Stack>

        {/* ⚡️ GLOBAL STATS CARDS */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#eff6ff', color: primaryColor, width: 48, height: 48 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#1e293b">{globalStats.total}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL PATIENTS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 48, height: 48 }}><WarningAmberIcon /></Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#1e293b">{globalStats.pending}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">PAYMENTS PENDING</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 2. TABLE WORKSPACE */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>

        {/* Toolbar: Tabs & Filters */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ minHeight: 40, '& .MuiTab-root': { fontWeight: '700', minHeight: 40, textTransform: 'none', fontSize: '0.9rem' } }}
          >
            <Tab label="All Patients" value="all" />
            <Tab label="Pending Dues" value="due" />
            <Tab label="Active Only" value="active" />
          </Tabs>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* ⚡️ REAL Doctor Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Assigned Doctor</InputLabel>
              <Select
                value={doctorFilter}
                label="Assigned Doctor"
                onChange={handleDoctorChange}
                sx={{ borderRadius: 2, bgcolor: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f1f5f9' } }}
              >
                <MenuItem value=""><em>All Doctors</em></MenuItem>
                {doctorsList.map(doc => (
                    <MenuItem key={doc._id} value={doc.fullName}>{doc.fullName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Bar */}
            <Paper component="form" elevation={0} sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              <InputBase
                sx={{ ml: 1, flex: 1, fontWeight: 500, fontSize: '0.9rem' }}
                placeholder="Search name, phone, ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Paper>
          </Stack>
        </Box>

        <TableContainer sx={{ flex: 1, maxHeight: '60vh', overflowY: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2, pl: 3 }}>PATIENT NAME</TableCell>
                <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2 }}>CONTACT</TableCell>
                <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2 }}>LAST VISIT</TableCell>
                <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2 }}>ASSIGNED TO</TableCell>
                <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2 }}>PAYMENT STATUS</TableCell>
                <TableCell align="right" sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <CircularProgress sx={{ color: primaryColor }} />
                    </TableCell>
                 </TableRow>
              ) : patients.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <FilterListIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                        <Typography variant="h6" color="#64748b" fontWeight="700">No Patients Found</Typography>
                        <Typography variant="body2" color="text.secondary">Try adjusting your search or filters.</Typography>
                    </TableCell>
                 </TableRow>
              ) : patients.map((row) => {

                const cost = row.totalCost || 0;
                const paid = row.totalPaid || 0;
                const dueAmount = cost - paid;

                return (
                  <TableRow
                    key={row._id}
                    hover
                    onClick={() => navigate(`/patients/${row.patientId || row._id}`)}
                    sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: (primaryColor, 0.03) } }}
                  >
                    {/* Name */}
                    <TableCell sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: row.gender === 'Female' ? '#fce7f3' : '#e0f2fe', color: row.gender === 'Female' ? '#db2777' : '#0284c7', width: 40, height: 40, fontWeight: 'bold' }}>
                          {row.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" color="#0f172a">{row.fullName}</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {row.gender === 'Female' ? <FemaleIcon sx={{ fontSize: 14, color: '#ec4899' }} /> : <MaleIcon sx={{ fontSize: 14, color: primaryColor }} />}
                            <Typography variant="caption" color="text.secondary" fontWeight="600">{row.age} yrs</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" color="#334155">{row.mobile}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">{row.patientId}</Typography>
                    </TableCell>

                    {/* Last Visit */}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <Typography variant="body2" fontWeight="600" color="#475569">
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Assigned Doctor */}
                    <TableCell>
                       <Chip label={row.assignedDoctor || 'Unassigned'} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: '700', borderRadius: 1.5 }} />
                    </TableCell>

                    {/* PAYMENT STATUS */}
                    <TableCell>
                      {(() => {
                        if (cost === 0 && paid === 0) {
                          return <Chip label="No Bill" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: '700', height: 24 }} />;
                        }
                        if (dueAmount > 0) {
                          return <Chip label={`Due: ₹${dueAmount.toLocaleString()}`} size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: '800', border: '1px solid #fecaca', height: 24 }} />;
                        }
                        if (dueAmount < 0) {
                          return <Chip label={`Credit: ₹${Math.abs(dueAmount).toLocaleString()}`} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: '800', height: 24 }} />;
                        }
                        return <Chip label="Settled" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: '800', height: 24 }} />;
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="View Profile">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.patientId || row._id}`) }}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Patient">
                          <IconButton size="small" onClick={(e) => handleEdit(e, row)}>
                            <EditIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Patient">
                          <IconButton size="small" onClick={(e) => handleDeleteClick(e, row._id)} sx={{ '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}>
                            <DeleteOutlineIcon fontSize="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 3. SERVER-SIDE PAGINATION */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}
        />
      </Paper>

      {/* Modals */}
      <AddPatientModal open={openModal} onClose={() => setOpenModal(false)} onSubmit={handleModalSubmit} initialData={selectedPatient} />
      
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: '800', color: '#1e293b' }}>Delete Patient Record?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>
            Are you sure you want to permanently delete this patient? <br /><br />
            <strong>This action cannot be undone.</strong> All associated treatment history, notes, and billing data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ fontWeight: 'bold', color: '#64748b' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}