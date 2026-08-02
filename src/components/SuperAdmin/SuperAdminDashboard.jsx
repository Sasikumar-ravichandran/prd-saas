import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, InputAdornment, CircularProgress, Alert, Tabs, Tab, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
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

  // Delete Dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  // Dedicated Axios instance using the saas_token
  let apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (!apiBaseURL.endsWith('/api')) {
    apiBaseURL = `${apiBaseURL}/api`;
  }

  // Dedicated Axios instance using the saas_token
  const saasApi = axios.create({
    baseURL: apiBaseURL,
    headers: { Authorization: `Bearer ${localStorage.getItem('saas_token')}` }
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await saasApi.get('/super-admin/dashboard-data');
      setData(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('saas_token');
        localStorage.removeItem('saas_user');
        navigate('/admin-portal-login');
      } else {
        setError(err.response?.data?.message || 'Failed to load SaaS management data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    navigate('/admin-portal-login');
  };

  const handleStatusChange = async (clinicId, newStatus) => {
    try {
      setActionLoading(clinicId);
      await saasApi.put(`/super-admin/clinics/${clinicId}/status`, { status: newStatus });
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

  const filteredClinics = data.clinics.filter(clinic => {
    const matchesTab = filterTab === 'ALL' || clinic.accountStatus === filterTab;
    const matchesSearch =
      clinic.name.toLowerCase().includes(search.toLowerCase()) ||
      clinic.clinicId.toLowerCase().includes(search.toLowerCase()) ||
      clinic.adminEmail.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* SaaS Admin Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="800" color="#0f172a">
            KlinicHub Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approve registrations, monitor tenant usage, and manage platform security.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label="FOUNDER PORTAL" color="primary" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* ================= METRICS CARDS ================= */}
      {data.stats && (
        <Grid container spacing={2.5} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight="700" color="text.secondary">TOTAL CLINICS</Typography>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">{data.stats.totalClinics}</Typography>
                  </Box>
                  <BusinessIcon sx={{ color: '#3b82f6', fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight="700" color="text.secondary">PENDING APPROVALS</Typography>
                    <Typography variant="h4" fontWeight="800" color="#d97706">{data.stats.pendingApproval}</Typography>
                  </Box>
                  <Chip label="Action Needed" size="small" color="warning" sx={{ fontWeight: 700 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight="700" color="text.secondary">TOTAL PATIENTS REGISTERED</Typography>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">{data.stats.totalPatients || 0}</Typography>
                  </Box>
                  <MedicalInformationIcon sx={{ color: '#10b981', fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= SEARCH & FILTER ================= */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Tabs value={filterTab} onChange={(e, val) => setFilterTab(val)} textColor="primary" indicatorColor="primary">
            <Tab label="All Clinics" value="ALL" sx={{ fontWeight: 600 }} />
            <Tab label={`Pending (${data.stats?.pendingApproval || 0})`} value="Pending_Approval" sx={{ fontWeight: 600 }} />
            <Tab label="Active" value="Active" sx={{ fontWeight: 600 }} />
            <Tab label="Suspended" value="Suspended" sx={{ fontWeight: 600 }} />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search clinic name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {/* ================= CLINICS DIRECTORY TABLE ================= */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>CLINIC ID & NAME</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>ADMINISTRATOR</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>STAFF</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>BRANCHES</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>PATIENTS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClinics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No clinics found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClinics.map((clinic) => {
                const isBusy = actionLoading === clinic._id;
                return (
                  <TableRow key={clinic._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" color="#0f172a">{clinic.name}</Typography>
                      <Chip label={clinic.clinicId} size="small" sx={{ mt: 0.5, fontWeight: 700, bgcolor: '#f1f5f9', fontSize: '0.75rem' }} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="#1e293b">{clinic.adminName}</Typography>
                      <Typography variant="caption" color="text.secondary">{clinic.adminEmail}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip label={clinic.userCount} size="small" sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="700">{clinic.branchCount}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip label={clinic.patientCount} size="small" sx={{ fontWeight: 800, bgcolor: '#f0fdf4', color: '#15803d' }} />
                    </TableCell>

                    <TableCell>
                      {clinic.accountStatus === 'Active' && <Chip label="Active" size="small" color="success" sx={{ fontWeight: 700 }} />}
                      {clinic.accountStatus === 'Pending_Approval' && <Chip label="Pending" size="small" color="warning" sx={{ fontWeight: 700 }} />}
                      {clinic.accountStatus === 'Suspended' && <Chip label="Suspended" size="small" color="error" sx={{ fontWeight: 700 }} />}
                    </TableCell>

                    <TableCell align="right">
                      {isBusy ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          {clinic.accountStatus !== 'Active' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleStatusChange(clinic._id, 'Active')}
                              sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                            >
                              Approve
                            </Button>
                          )}

                          {clinic.accountStatus === 'Active' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<BlockIcon />}
                              onClick={() => handleStatusChange(clinic._id, 'Suspended')}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                              Suspend
                            </Button>
                          )}

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => confirmDeleteClinic(clinic)}
                            title="Permanently Delete Clinic"
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
          <Button
            onClick={handleDeleteClinic}
            variant="contained"
            color="error"
            sx={{ fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            Yes, Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}