import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Stack, IconButton, InputBase, Grid,
  Tabs, Tab, Tooltip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // <--- Import Delete Icon

import { useColorMode } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext'; // <--- Import Toast
import { patientService } from '../../api/services/patientService';

// Components
import AddPatientModal from '../../components/Patients/AddPatientModal';

export default function PatientList() {
  const navigate = useNavigate();
  const { primaryColor } = useColorMode();
  const { showToast } = useToast(); // <--- Initialize Toast

  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
      setError("Failed to load patient directory.");
      showToast('Failed to load patient directory.', 'error')
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddNew = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleEdit = (e, patient) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleDeleteClick = (e, patientId) => {
    e.stopPropagation(); // Stop row click navigation
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await patientService.delete(patientToDelete);
      showToast('Patient record deleted successfully', 'success');
      fetchPatients(); // Refresh list
    } catch (err) {
      console.error("Delete failed", err);
      showToast('Failed to delete patient record', 'error');
    } finally {
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleModalSubmit = () => {
    fetchPatients();
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter(p => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const phoneMatch = p.mobile?.includes(searchTerm) || false;

    // Calculate Due Amount dynamically
    const cost = p.totalCost || 0;
    const paid = p.totalPaid || 0;
    const dueAmount = cost - paid;

    if (tabValue === 'due') return dueAmount > 0;
    if (tabValue === 'active') return p.isActive;

    return (nameMatch || phoneMatch);
  });

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* 1. HEADER */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="800" color={primaryColor}>Patient Directory</Typography>
            <Typography variant="body2" color="text.secondary">Manage your patient records and finances</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={fetchPatients} startIcon={<RefreshIcon />}>Refresh</Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ bgcolor: primaryColor, borderRadius: 2, px: 3, fontWeight: 'bold' }}
            >
              Add Patient
            </Button>
          </Stack>
        </Stack>

        {/* Stats */}
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
              <Avatar variant="rounded" sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}><WarningAmberIcon /></Avatar>
              <Box>
                {/* Calculate pending count dynamically */}
                <Typography variant="h5" fontWeight="800" color="#1e293b">
                  {patients.filter(p => ((p.totalCost || 0) - (p.totalPaid || 0)) > 0).length}
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">PAYMENT PENDING</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 2. TABLE */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Toolbar */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ minHeight: 40, '& .MuiTab-root': { fontWeight: 'bold', minHeight: 40, textTransform: 'none' } }}
          >
            <Tab label="All Patients" value="all" />
            <Tab label="Pending Dues" value="due" />
            <Tab label="Active Only" value="active" />
          </Tabs>

          <Paper component="form" sx={{ p: '2px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <SearchIcon sx={{ color: '#94a3b8' }} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontWeight: 600, fontSize: '0.9rem' }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pl: 3 }}>PATIENT NAME</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>CONTACT</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>LAST VISIT</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>PAYMENT STATUS</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((row) => {

                const cost = row.totalCost || 0;
                const paid = row.totalPaid || 0;
                const dueAmount = cost - paid;

                return (
                  <TableRow
                    key={row._id}
                    hover
                    onClick={() => navigate(`/patients/${row.patientId}`)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                  >
                    {/* Name */}
                    <TableCell sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: row.gender === 'Female' ? '#fce7f3' : '#e0f2fe', color: row.gender === 'Female' ? '#db2777' : '#0284c7', width: 36, height: 36, fontSize: 14 }}>
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
                      <Typography variant="caption" color="text.secondary">{row.patientId}</Typography>
                    </TableCell>

                    {/* Last Visit */}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="body2" fontWeight="600" color="#334155">
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* PAYMENT STATUS */}
                    <TableCell>
                      {(() => {
                        // 1. CASE: No Billable Work Yet (Total Cost is 0)
                        // This handles new patients or patients with only "Proposed" plans
                        if (cost === 0 && paid === 0) {
                          return (
                            <Chip
                              label="No Active Bill"
                              size="small"
                              sx={{
                                bgcolor: '#f1f5f9', // Neutral Grey
                                color: '#64748b',
                                fontWeight: '600',
                                height: 24,
                                fontSize: '0.75rem'
                              }}
                            />
                          );
                        }

                        // 2. CASE: Patient Owes Money (Due > 0)
                        if (dueAmount > 0) {
                          return (
                            <Chip
                              label={`Due: ₹${dueAmount.toLocaleString()}`}
                              size="small"
                              sx={{
                                bgcolor: '#fef2f2',
                                color: '#dc2626',
                                fontWeight: 'bold',
                                border: '1px solid #fecaca',
                                height: 24
                              }}
                            />
                          );
                        }

                        // 3. CASE: Patient has Credit/Advance (Due < 0)
                        if (dueAmount < 0) {
                          return (
                            <Chip
                              label={`Credit: ₹${Math.abs(dueAmount).toLocaleString()}`}
                              size="small"
                              sx={{
                                bgcolor: '#eff6ff',
                                color: '#2563eb',
                                fontWeight: 'bold',
                                height: 24
                              }}
                            />
                          );
                        }

                        // 4. CASE: Settled (Cost > 0 AND Due == 0)
                        return (
                          <Chip
                            label="Settled"
                            size="small"
                            sx={{
                              bgcolor: '#f0fdf4',
                              color: '#16a34a',
                              fontWeight: 'bold',
                              height: 24
                            }}
                          />
                        );
                      })()}
                    </TableCell>

                    {/*Status */}
                    <TableCell>
                      {row.isActive ? (
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            bgcolor: '#dcfce7', // Light Green Background
                            color: '#15803d',   // Dark Green Text
                            fontWeight: 'bold',
                            height: 24
                          }}
                        />
                      ) : (
                        <Chip
                          label="Inactive"
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9', // Light Grey Background
                            color: '#64748b',   // Slate Grey Text
                            fontWeight: 'bold',
                            height: 24
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="View Profile">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.patientId}`) }}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Patient">
                          <IconButton size="small" onClick={(e) => handleEdit(e, row)}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {/* DELETE BUTTON */}
                        <Tooltip title="Delete Patient">
                          <IconButton size="small" onClick={(e) => handleDeleteClick(e, row.patientId)} sx={{ '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}>
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
      </Paper>

      <AddPatientModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedPatient}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: '800', color: '#1e293b' }}>
          Delete Patient Record?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#64748b' }}>
            Are you sure you want to permanently delete this patient?
            <br /><br />
            <strong>This action cannot be undone.</strong> All associated treatment history, notes, and billing data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ fontWeight: 'bold', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}