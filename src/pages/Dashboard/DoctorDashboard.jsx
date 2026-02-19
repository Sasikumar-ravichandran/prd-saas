import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Avatar, IconButton, Stack, Chip,
  Divider, alpha, CircularProgress, Alert, Tooltip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  keyframes, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, TextField
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { dashboardService } from '../../api/services/dashboardService';
import api from '../../api/services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// --- ANIMATIONS ---
const pulseAnimation = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
`;

// --- SESSION WRAP-UP MODAL ---
const SessionWrapUpModal = ({ open, onClose, patient, appointmentId, onComplete }) => {
  const [treatments, setTreatments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const patientMongoId = patient?.patientMongoId || patient?.id;

    if (open && patientMongoId) {
      api.get(`/patients/${patientMongoId}`)
        .then(res => {
          const activeTreatments = (res.data.treatmentPlan || []).filter(t => t.status !== 'Completed');
          setTreatments(activeTreatments);

          const inProgressIds = activeTreatments.filter(t => t.status === 'In Progress').map(t => t._id);
          setSelectedIds(inProgressIds);
        })
        .catch(err => console.error("Error fetching treatments", err));
    }
  }, [open, patient]);

  const handleToggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'Completed', notes });

      if (selectedIds.length > 0) {
        const patientMongoId = patient?.patientMongoId || patient?.id;
        await api.put(`/patients/${patientMongoId}/treatments/bulk-complete`, { treatmentIds: selectedIds });
      }

      onComplete();
      onClose();
    } catch (error) {
      console.error("Wrap-up failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: '800', borderBottom: '1px solid #f1f5f9' }}>
        Complete Session: {patient?.name}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary" mb={1}>
          PROCEDURES COMPLETED TODAY
        </Typography>

        {treatments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #e2e8f0' }}>
            No pending treatments found in clinical chart.
          </Typography>
        ) : (
          <FormGroup sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0', maxHeight: 200, overflowY: 'auto' }}>
            {treatments.map(t => (
              <FormControlLabel
                key={t._id}
                control={<Checkbox checked={selectedIds.includes(t._id)} onChange={() => handleToggle(t._id)} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="700">{t.procedure}</Typography>
                    <Typography variant="caption" color="text.secondary">Tooth: {t.tooth || 'General'} • ₹{t.cost}</Typography>
                  </Box>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </FormGroup>
        )}

        <Typography variant="subtitle2" fontWeight="800" color="text.secondary" mt={3} mb={1}>
          SESSION NOTES (Optional)
        </Typography>
        <TextField
          fullWidth multiline rows={3}
          placeholder="Patient tolerated procedure well..."
          value={notes} onChange={e => setNotes(e.target.value)}
          sx={{ bgcolor: '#f8fafc' }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: '700' }}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading} sx={{ fontWeight: '700', borderRadius: 2, px: 3 }}>
          {loading ? 'Saving...' : 'Complete & Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- MAIN DASHBOARD ---
export default function DoctorDashboard() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedApptId, setSelectedApptId] = useState(null);

  const [wrapUpModalOpen, setWrapUpModalOpen] = useState(false);
  const [wrapUpApptId, setWrapUpApptId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const res = await dashboardService.getDoctorData();
      setData(res);

      if (res.schedule && res.schedule.length > 0 && !selectedApptId) {
        const inProgress = res.schedule.find(s => s.status === 'In Progress');
        const nextUp = res.schedule.find(s => s.status !== 'Completed');
        setSelectedApptId(inProgress?.id || nextUp?.id || res.schedule[0].id);
      }
    } catch (err) {
      console.error("Failed to load doctor dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStartSession = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'In Progress' });
      showToast('Treatment started. Patient is in the chair.', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to start session', 'error');
    }
  };

  const handleEndSessionTrigger = (appointmentId) => {
    setWrapUpApptId(appointmentId);
    setWrapUpModalOpen(true);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={50} sx={{ color: primaryColor }} /></Box>;
  if (!data) return <Box sx={{ p: 3 }}><Alert severity="error">Failed to load dashboard data.</Alert></Box>;

  const { schedule, doctorName } = data;

  const totalAppointments = schedule.length;
  const inChairCount = schedule.filter(s => s.status === 'In Progress').length;
  const waitingCount = schedule.filter(s => s.status === 'Scheduled' || s.status === 'pending').length;
  const completedCount = schedule.filter(s => s.status === 'Completed').length;

  const displayPatient = schedule.find(s => s.id === selectedApptId) || schedule[0];
  const paginatedSchedule = schedule.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return { bg: '#dcfce7', color: '#16a34a', border: '#86efac' };
      case 'Completed': return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe' };
      case 'Scheduled': case 'pending': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
    }
  };

  const getStatusChip = (status) => {
    const colors = getStatusColor(status);
    return (
      <Chip
        label={status === 'In Progress' ? 'IN CHAIR' : status.toUpperCase()}
        size="small"
        sx={{
          bgcolor: colors.bg, color: colors.color, fontWeight: '800',
          fontSize: '0.65rem', height: 22, border: `1px solid ${colors.border}`,
          letterSpacing: 0.5, px: 0.5
        }}
      />
    );
  };


  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', p: { xs: 2, md: 3 } }}>

      {/* HEADER SECTION */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>
              Dr. {doctorName}'s Station
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/calendar')}
            startIcon={<CalendarTodayIcon fontSize="small" />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '700', borderColor: '#cbd5e1', color: '#475569', bgcolor: 'white' }}
          >
            My Calendar
          </Button>
        </Stack>

        {/* KPI CARDS */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, pb: "16px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">APPTS TODAY</Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>{totalAppointments}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 40, height: 40 }}><EventAvailableIcon fontSize="small" /></Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, pb: "16px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">WAITING ROOM</Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#d97706' }}>{waitingCount}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 40, height: 40 }}><AssignmentIndIcon fontSize="small" /></Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, pb: "16px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">IN CHAIR</Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#16a34a' }}>{inChairCount}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 40, height: 40 }}><EventSeatIcon fontSize="small" /></Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, pb: "16px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">COMPLETED</Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#4f46e5' }}>{completedCount}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', width: 40, height: 40 }}><CheckCircleOutlineIcon fontSize="small" /></Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ⚡️ THE FIX: Fluid Grid Layout. Left is fixed max-width, Right gets all remaining space */}
      <Grid container spacing={3} alignItems="flex-start" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>

        {/* --- LEFT: PATIENT DETAILS (Narrower & Fixed) --- */}
        <Grid item xs={12} md="auto" sx={{ width: '100%', minWidth: { md: '300px' }, maxWidth: { md: '340px' }, flexShrink: 0 }}>
          <Box sx={{ position: 'sticky', top: 90 }}>
            {displayPatient ? (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: displayPatient.status === 'In Progress' ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                  boxShadow: displayPatient.status === 'In Progress' ? `0 4px 20px ${alpha(primaryColor, 0.15)}` : '0 2px 8px rgba(0,0,0,0.02)',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <Box sx={{ p: 2.5, bgcolor: displayPatient.status === 'In Progress' ? alpha(primaryColor, 0.05) : 'white', borderBottom: '1px solid #f1f5f9' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 50, height: 50,
                        bgcolor: displayPatient.status === 'In Progress' ? primaryColor : '#f1f5f9',
                        color: displayPatient.status === 'In Progress' ? 'white' : '#64748b',
                        fontSize: '1.3rem', fontWeight: '800'
                      }}
                    >
                      {displayPatient.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="800" color="#0f172a" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                        {displayPatient.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary" fontWeight="600" display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon fontSize="inherit" /> {displayPatient.time}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        {displayPatient.status === 'In Progress' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a', animation: `${pulseAnimation} 2s infinite` }} />
                            <Typography variant="caption" fontWeight="800" color="#16a34a">IN CHAIR</Typography>
                          </Box>
                        ) : getStatusChip(displayPatient.status)}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* Details */}
                <Box sx={{ p: 2.5, bgcolor: '#fbfcfd' }}>
                  <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                    APPOINTMENT REASON
                  </Typography>
                  <Typography variant="body2" fontWeight="800" color="#1e293b" mb={displayPatient.activeTreatments?.length > 0 ? 3 : 2} sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    {displayPatient.originalType || displayPatient.type || "General Consultation"}
                  </Typography>

                  <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ letterSpacing: 0.5, mb: 1, display: 'block' }}>
                    TREATMENT PLAN
                  </Typography>

                  {/* ⚡️ Smart Treatment Display */}
                  {displayPatient.activeTreatments && displayPatient.activeTreatments.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
                      {displayPatient.activeTreatments.map(t => (
                        <Chip
                          key={t._id}
                          label={`${t.procedure} ${t.tooth ? `(Tooth ${t.tooth})` : ''}`}
                          sx={{
                            bgcolor: alpha(primaryColor, 0.1),
                            color: primaryColor,
                            fontWeight: '800',
                            borderRadius: 1.5
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" fontWeight="800" color="#1e293b" mb={2} sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      No ongoing treatment for this patient.
                    </Typography>
                  )}

                  {(displayPatient.conditions?.length > 0 || displayPatient.notes) && (
                    <Box>
                      <Typography variant="caption" fontWeight="700" color="#e11d48" sx={{ letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ErrorOutlineIcon fontSize="inherit" /> MEDICAL ALERTS
                      </Typography>
                      <Alert severity="error" icon={false} sx={{ mt: 1, borderRadius: 2, py: 0, px: 1.5, '& .MuiAlert-message': { py: 1 } }}>
                        <Typography variant="caption" fontWeight="700">
                          {displayPatient.conditions?.length ? displayPatient.conditions.join(', ') : displayPatient.notes}
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #f1f5f9' }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Patient Profile">
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/patients/${displayPatient?.pid || displayPatient.id}`)}
                        sx={{ borderRadius: 2, fontWeight: '700', borderColor: '#e2e8f0', color: '#475569', minWidth: 40, px: 1 }}
                      >
                        <PersonIcon />
                      </Button>
                    </Tooltip>

                    {(displayPatient.status === 'Scheduled' || displayPatient.status === 'pending') && (
                      <Button
                        variant="contained" fullWidth
                        onClick={() => handleStartSession(displayPatient.id)}
                        startIcon={<PlayArrowIcon fontSize="small" />}
                        sx={{ borderRadius: 2, fontWeight: '700', textTransform: 'none', bgcolor: primaryColor }}
                      >
                        Start Treatment
                      </Button>
                    )}

                    {displayPatient.status === 'In Progress' && (
                      <Button
                        variant="contained" fullWidth color="success"
                        onClick={() => handleEndSessionTrigger(displayPatient.id)}
                        startIcon={<CheckCircleIcon fontSize="small" />}
                        sx={{ borderRadius: 2, fontWeight: '700', textTransform: 'none' }}
                      >
                        Complete Session
                      </Button>
                    )}

                    {displayPatient.status === 'Completed' && (
                      <Button variant="outlined" fullWidth disabled sx={{ borderRadius: 2, fontWeight: '700', textTransform: 'none' }}>
                        Session Finished
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px dashed #cbd5e1', textAlign: 'center', bgcolor: 'transparent' }}>
                <MedicalServicesIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="800" color="#475569">No Patient Selected</Typography>
                <Typography variant="caption" color="text.secondary">Select from the schedule to begin.</Typography>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* --- RIGHT: INTERACTIVE SCHEDULE TABLE (Takes all remaining width) --- */}
        <Grid item xs sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="800" color="#0f172a">
                Today's Schedule
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 450, overflowY: 'auto', overflowX: 'auto' }}>
              <Table stickyHeader size="medium" sx={{ minWidth: 600 }}> {/* Changed size to medium for better spacing */}
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>PATIENT</TableCell>
                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>TIME</TableCell>
                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>TREATMENT</TableCell>
                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>APPT REASON</TableCell>
                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f8fafc', fontWeight: '800', fontSize: '0.75rem', color: '#64748b' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSchedule.length === 0 ? (
                    /* ⚡️ EMPTY STATE UI */
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', color: '#cbd5e1', mb: 2 }}>
                            <EventAvailableIcon fontSize="large" />
                          </Avatar>
                          <Typography variant="h6" fontWeight="800" color="#475569">
                            No Appointments Today
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            You have a clear schedule for the day!
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    /* ⚡️ YOUR EXISTING MAP LOGIC */
                    paginatedSchedule.map((appt) => {
                      const isSelected = selectedApptId === appt.id;
                      return (
                        <TableRow
                          key={appt.id}
                          hover
                          onClick={() => setSelectedApptId(appt.id)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isSelected ? alpha(primaryColor, 0.04) : 'transparent',
                            position: 'relative',
                            '&::after': isSelected ? {
                              content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: primaryColor
                            } : {}
                          }}
                        >
                          <TableCell sx={{ py: 1.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: isSelected ? primaryColor : '#f1f5f9', color: isSelected ? 'white' : '#64748b', fontWeight: '700', fontSize: '0.9rem' }}>
                                {appt.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="700" color="#0f172a">{appt.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" fontWeight="600">{appt.time}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#334155" fontWeight="600">{appt?.activeTreatments.length > 0 ? appt.type || 'Consultation' : 'No active treatment'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#334155" fontWeight="600">{appt.originalType || 'Consultation'}</Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(appt.status)}</TableCell>
                          <TableCell align="right">
                            {appt.status === 'Scheduled' || appt.status === 'pending' ? (
                              <Tooltip title="Start Session">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStartSession(appt.id); }} sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}>
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : appt.status === 'In Progress' ? (
                              <Tooltip title="Complete Session">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEndSessionTrigger(appt.id); }} sx={{ bgcolor: '#dcfce7', color: '#16a34a' }}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <CheckCircleOutlineIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={schedule.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid #e2e8f0' }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Render the Modal */}
      <SessionWrapUpModal
        open={wrapUpModalOpen}
        onClose={() => setWrapUpModalOpen(false)}
        patient={displayPatient}
        appointmentId={wrapUpApptId}
        onComplete={() => {
          showToast('Session and treatments marked completed!', 'success');
          loadData();
        }}
      />
    </Box>
  );
}