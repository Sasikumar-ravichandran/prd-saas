import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, InputAdornment, CircularProgress, Alert, Tabs, Tab, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton,
  TablePagination, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BusinessIcon from '@mui/icons-material/Business';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ stats: null, clinics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  const [selectedType, setSelectedType] = useState('ALL');
  const clinicTypes = ['ALL', 'Dental', 'Dermatology', 'Physiotherapy', 'General_Practice'];

  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedClinicToSuspend, setSelectedClinicToSuspend] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  let apiBaseURL = import.meta.env.VITE_API_URL;
  if (!apiBaseURL.endsWith('/api')) {
    apiBaseURL = `${apiBaseURL}/api`;
  }

  const saasApi = axios.create({
    baseURL: apiBaseURL,
    headers: { Authorization: `Bearer ${localStorage.getItem('saas_token')}` }
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); 
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await saasApi.get('/super-admin/dashboard-data', {
        params: {
          page: page + 1, 
          limit: rowsPerPage,
          search: debouncedSearch,
          filter: filterTab,
          clinicType: selectedType
        }
      });
      
      setData({ stats: res.data.stats, clinics: res.data.clinics });
      setTotalCount(res.data.totalCount || 0); 
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('saas_token');
        localStorage.removeItem('saas_user');
        navigate('/admin-login');
      } else {
        setError(err.response?.data?.message || 'Failed to load SaaS management data.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, filterTab, selectedType, navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    navigate('/admin-login');
  };

  const handleStatusChange = async (clinicId, newStatus, reason = '') => {
    try {
      setActionLoading(clinicId);
      await saasApi.put(`/super-admin/clinics/${clinicId}/status`, { status: newStatus, reason });
      
      setData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          pendingApproval: newStatus === 'Active' ? prev.stats.pendingApproval - 1 : prev.stats.pendingApproval,
          activeClinics: newStatus === 'Active' ? prev.stats.activeClinics + 1 : prev.stats.activeClinics - 1,
        },
        clinics: prev.clinics.map(c => c._id === clinicId ? { ...c, accountStatus: newStatus } : c)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update clinic status');
    } finally {
      setActionLoading(null);
    }
  };

  const openSuspendModal = (clinic) => {
    setSelectedClinicToSuspend(clinic);
    setSuspendReason('');
    setSuspendModalOpen(true);
  };

  const confirmSuspend = async () => {
    if (!selectedClinicToSuspend) return;
    if (!suspendReason.trim()) return alert("Please provide a reason for suspension.");
    
    await handleStatusChange(selectedClinicToSuspend._id, 'Suspended', suspendReason);
    setSuspendModalOpen(false);
    setSelectedClinicToSuspend(null);
  };

  const confirmDeleteClinic = (clinic) => {
    setSelectedClinic(clinic);
    setDeleteModalOpen(true);
  };

  const handleDeleteClinic = async () => {
    if (!selectedClinic) return;
    try {
      setActionLoading(selectedClinic._id);
      await saasApi.delete(`/super-admin/clinics/${selectedClinic._id}`);
      setDeleteModalOpen(false);
      setData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalClinics: prev.stats.totalClinics - 1,
          activeClinics: selectedClinic.accountStatus === 'Active' ? prev.stats.activeClinics - 1 : prev.stats.activeClinics,
        },
        clinics: prev.clinics.filter(c => c._id !== selectedClinic._id)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete clinic');
    } finally {
      setActionLoading(null);
      setSelectedClinic(null);
    }
  };

  if (loading && data.clinics.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    // ⚡️ STRICT 1-PAGE LAYOUT: height 100vh, hidden browser scrollbar.
    <Box sx={{ p: 2, bgcolor: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* ⚡️ TOP CONTENT: flexShrink 0 ensures it doesn't get crushed */}
      <Box sx={{ flexShrink: 0 }}>
        
        {/* Header - slightly tighter margins */}
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="800" color="#0f172a">
              KlinicHub Command Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approve registrations, monitor tenant usage, and manage platform security.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="FOUNDER PORTAL" color="primary" size="small" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
            <Button variant="outlined" size="small" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ fontWeight: 700, textTransform: 'none' }}>
              Logout
            </Button>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ================= METRICS CARDS (Tighter spacing) ================= */}
        {data.stats && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="text.secondary">TOTAL CLINICS</Typography>
                      <Typography variant="h5" fontWeight="800" color="#0f172a">{data.stats.totalClinics}</Typography>
                    </Box>
                    <BusinessIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="text.secondary">PENDING</Typography>
                      <Typography variant="h5" fontWeight="800" color="#d97706">{data.stats.pendingApproval}</Typography>
                    </Box>
                    <Chip label="Action Needed" size="small" color="warning" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="text.secondary">PATIENTS</Typography>
                      <Typography variant="h5" fontWeight="800" color="#0f172a">{data.stats.totalPatients || 0}</Typography>
                    </Box>
                    <MedicalInformationIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ================= SEARCH & FILTER ================= */}
        <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            
            <Tabs value={filterTab} onChange={(e, val) => { setFilterTab(val); setPage(0); }} textColor="primary" indicatorColor="primary" sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}>
              <Tab label="All" value="ALL" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label={`Pending (${data.stats?.pendingApproval || 0})`} value="Pending_Approval" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Active" value="Active" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Suspended" value="Suspended" sx={{ fontWeight: 600, textTransform: 'none' }} />
            </Tabs>

            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <TextField
                select
                size="small"
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
                sx={{ width: 160, '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
              >
                {clinicTypes.map(type => (
                  <MenuItem key={type} value={type} sx={{ fontSize: '0.875rem' }}>
                    {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', md: 200 }, '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                InputProps={{ startAdornment: ( <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> ) }}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* ================= CLINICS TABLE (DYNAMIC FILL) ================= */}
      {/* flexGrow: 1 tells the Paper to fill EXACTLY the rest of the 100vh screen */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Table Container scrolls internal table ONLY if absolutely necessary */}
        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* ⚡️ CRITICAL FIX: size="small" makes the rows compact so 10 rows easily fit without zooming out! */}
          <Table stickyHeader size="small"> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>CLINIC INFO</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>ADMIN</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>STAFF</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>BRANCHES</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>PATIENTS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', py: 1.5 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', bgcolor: '#f8fafc', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : data.clinics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No clinics found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.clinics.map((clinic) => {
                  const isBusy = actionLoading === clinic._id;
                  const displayType = (clinic.clinicType || 'General_Practice').replace('_', ' ');

                  return (
                    <TableRow key={clinic._id} hover>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" fontWeight="700" color="#0f172a">{clinic.name}</Typography>
                        <Chip label={clinic.clinicId} size="small" sx={{ mt: 0.5, fontWeight: 700, bgcolor: '#f1f5f9', fontSize: '0.65rem', height: 20 }} />
                      </TableCell>

                      <TableCell sx={{ py: 1 }}>
                        <Chip label={displayType} size="small" sx={{ fontWeight: 700, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', height: 22 }} />
                      </TableCell>

                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" fontWeight="600" color="#1e293b">{clinic.adminName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>{clinic.adminEmail}</Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 1 }}><Chip label={clinic.userCount} size="small" sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8', height: 22 }} /></TableCell>
                      <TableCell align="center" sx={{ py: 1 }}><Typography variant="body2" fontWeight="700">{clinic.branchCount}</Typography></TableCell>
                      <TableCell align="center" sx={{ py: 1 }}><Chip label={clinic.patientCount} size="small" sx={{ fontWeight: 800, bgcolor: '#f0fdf4', color: '#15803d', height: 22 }} /></TableCell>

                      <TableCell sx={{ py: 1 }}>
                        {clinic.accountStatus === 'Active' && <Chip label="Active" size="small" color="success" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />}
                        {clinic.accountStatus === 'Pending_Approval' && <Chip label="Pending" size="small" color="warning" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />}
                        {clinic.accountStatus === 'Suspended' && <Chip label="Suspended" size="small" color="error" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />}
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 3, py: 1 }}>
                        {isBusy ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                            {clinic.accountStatus !== 'Active' && (
                              <Button
                                size="small" variant="contained" color="success" startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                                onClick={() => handleStatusChange(clinic._id, 'Active')}
                                sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none', fontSize: '0.75rem', py: 0.25 }}
                              >
                                Approve
                              </Button>
                            )}

                            {clinic.accountStatus === 'Active' && (
                              <Button
                                size="small" variant="outlined" color="error" startIcon={<BlockIcon sx={{ fontSize: '1rem' }} />}
                                onClick={() => openSuspendModal(clinic)} 
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.25 }}
                              >
                                Suspend
                              </Button>
                            )}

                            <IconButton
                              size="small" color="error" title="Permanently Delete"
                              onClick={() => confirmDeleteClinic(clinic)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination pinned to the bottom of the paper */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ borderTop: '1px solid #e2e8f0', bgcolor: 'white', flexShrink: 0, '& .MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Paper>

      {/* ================= SUSPEND CLINIC MODAL ================= */}
      <Dialog open={suspendModalOpen} onClose={() => setSuspendModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Suspend Clinic Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            You are about to suspend <strong>{selectedClinicToSuspend?.name}</strong>. Their staff will be immediately logged out and unable to access patient records. 
            <br/><br/>
            Please provide a reason. <strong>This reason will be included in the automated email sent to the clinic administrator.</strong>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Unpaid subscription invoice for 30+ days."
            label="Reason for Suspension"
            variant="outlined"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSuspendModalOpen(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmSuspend}
            variant="contained"
            color="error"
            disabled={!suspendReason.trim()}
            sx={{ fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            Suspend Clinic
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Permanently Delete Clinic?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedClinic?.name} ({selectedClinic?.clinicId})</strong>?
            This will permanently erase their clinic profile, <strong>{selectedClinic?.userCount} staff users</strong>,
            and <strong>{selectedClinic?.patientCount} patient records</strong>. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteModalOpen(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteClinic} variant="contained" color="error" sx={{ fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
            Yes, Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}