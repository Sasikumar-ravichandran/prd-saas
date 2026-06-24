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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
      <DialogTitle sx={{ fontWeight: '700', borderBottom: '1px solid #f1f5f9', py: 2.5 }}>
        Complete Session: {patient?.name}
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 3 }}>
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1.5} sx={{ letterSpacing: '0.05em' }}>
          PROCEDURES COMPLETED TODAY
        </Typography>

        {treatments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            No pending treatments found in clinical chart.
          </Typography>
        ) : (
          <FormGroup sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', maxHeight: 250, overflowY: 'auto' }}>
            {treatments.map(t => (
              <FormControlLabel
                key={t._id}
                control={<Checkbox checked={selectedIds.includes(t._id)} onChange={() => handleToggle(t._id)} sx={{ color: '#cbd5e1' }} />}
                label={
                  <Box sx={{ ml: 0.5 }}>
                    <Typography variant="body2" fontWeight="600" color="#0f172a">{t.procedure}</Typography>
                    <Typography variant="caption" color="text.secondary">Tooth: {t.tooth || 'General'} • ₹{t.cost}</Typography>
                  </Box>
                }
                sx={{ mb: 0.5, py: 0.5, px: 1, borderRadius: 1, '&:hover': { bgcolor: 'white' }, transition: 'background-color 0.2s' }}
              />
            ))}
          </FormGroup>
        )}

        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mt={4} mb={1.5} sx={{ letterSpacing: '0.05em' }}>
          SESSION NOTES (Optional)
        </Typography>
        <TextField
          fullWidth multiline rows={3}
          placeholder="Patient tolerated procedure well..."
          value={notes} onChange={e => setNotes(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: '600', textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation color="success" onClick={handleSubmit} disabled={loading} sx={{ fontWeight: '600', borderRadius: 2, px: 3, textTransform: 'none' }}>
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

  if (loading) return <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={40} sx={{ color: primaryColor }} /></Box>;
  if (!data) return <Box sx={{ p: 3 }}><Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load dashboard data. Please try again.</Alert></Box>;

  const { schedule, doctorName } = data;

  const totalAppointments = schedule.length;
  const inChairCount = schedule.filter(s => s.status === 'In Progress').length;
  const waitingCount = schedule.filter(s => s.status === 'Scheduled' || s.status === 'pending').length;
  const completedCount = schedule.filter(s => s.status === 'Completed').length;

  const displayPatient = schedule.find(s => s.id === selectedApptId) || schedule[0];
  const paginatedSchedule = schedule.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'Completed': return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe' };
      case 'Scheduled': case 'pending': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const getStatusChip = (status) => {
    const colors = getStatusColor(status);
    return (
      <Chip
        label={status === 'In Progress' ? 'IN CHAIR' : status.toUpperCase()}
        size="small"
        sx={{
          bgcolor: colors.bg, color: colors.color, fontWeight: '700',
          fontSize: '0.7rem', height: 24, border: `1px solid ${colors.border}`,
          letterSpacing: '0.05em', px: 0.5, borderRadius: 1.5
        }}
      />
    );
  };

  return (
    <Box sx={{p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* HEADER SECTION */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={3}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h4" fontWeight="700" sx={{ color: primaryColor, letterSpacing: '-0.02em', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
              Dr. {doctorName}'s Station
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/calendar')}
            startIcon={<CalendarTodayIcon fontSize="small" />}
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: '600',
              borderColor: '#cbd5e1', color: primaryColor, bgcolor: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              width: { xs: '100%', sm: 'auto' }, py: 1, px: 2.5
            }}
          >
            My Calendar
          </Button>
        </Stack>

        {/* KPI CARDS - Clean Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, md: 2 },
            width: '100%' // Ensures the grid takes the full width of the screen
          }}
        >
          {[
            { label: 'APPTS TODAY', count: totalAppointments, icon: <EventAvailableIcon fontSize="small" />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'WAITING ROOM', count: waitingCount, icon: <AssignmentIndIcon fontSize="small" />, color: '#d97706', bg: '#fef3c7' },
            { label: 'IN CHAIR', count: inChairCount, icon: <EventSeatIcon fontSize="small" />, color: '#16a34a', bg: '#dcfce7' },
            { label: 'COMPLETED', count: completedCount, icon: <CheckCircleOutlineIcon fontSize="small" />, color: '#4f46e5', bg: '#e0e7ff' }
          ].map((kpi, idx) => (
            <Card
              key={idx}
              elevation={0}
              sx={{
                width: '100%',
                height: '100%', // Makes sure all cards stretch to equal height
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
              }}
            >
              <CardContent sx={{
                p: { xs: 1.5, sm: 2.5 },
                pb: { xs: '12px !important', sm: '20px !important' },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Box sx={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                    <Typography
                      noWrap
                      variant="caption"
                      color="text.secondary"
                      fontWeight="700"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        letterSpacing: '0.05em',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      {kpi.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="700"
                      sx={{
                        color: '#0f172a',
                        lineHeight: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      {kpi.count}
                    </Typography>
                  </Box>

                  <Avatar sx={{
                    bgcolor: kpi.bg,
                    color: kpi.color,
                    width: { xs: 32, sm: 44 },
                    height: { xs: 32, sm: 44 },
                    borderRadius: 2,
                    flexShrink: 0
                  }}>
                    {kpi.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* MAIN CONTENT - Flex Layout for precise alignment */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'column' }, gap: 3, alignItems: 'flex-start' }}>

        {/* LEFT: PATIENT DETAILS PANEL */}
        <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>

            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="700" color="#0f172a" sx={{ fontSize: '1.1rem' }}>
                Today's Schedule
              </Typography>
            </Box>

            {/* Mobile: Card View */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, bgcolor: '#f8fafc' }}>
              <Stack spacing={2} sx={{ p: 2 }}>
                {paginatedSchedule.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'white', color: '#cbd5e1', mb: 2, mx: 'auto', border: '1px solid #e2e8f0' }}>
                      <EventAvailableIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="600" color="#475569">No Appointments Today</Typography>
                    <Typography variant="body2" color="text.secondary">You have a clear schedule!</Typography>
                  </Box>
                ) : (
                  paginatedSchedule.map((appt) => {
                    const isSelected = selectedApptId === appt.id;
                    return (
                      <Paper
                        key={appt.id}
                        elevation={isSelected ? 2 : 0}
                        onClick={() => setSelectedApptId(appt.id)}
                        sx={{
                          p: 2.5,
                          border: isSelected ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                          borderRadius: 3,
                          bgcolor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start" mb={1.5}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: isSelected ? primaryColor : '#f1f5f9', color: isSelected ? 'white' : '#64748b', fontWeight: '600' }}>
                            {appt.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight="700" color="#0f172a" mb={0.5}>{appt.name}</Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
                              <Typography variant="body2" color="text.secondary" fontWeight="500" display="flex" alignItems="center" gap={0.5}>
                                <AccessTimeIcon fontSize="small" sx={{ color: '#94a3b8' }} /> {appt.time}
                              </Typography>
                              {getStatusChip(appt.status)}
                            </Stack>
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary" fontWeight="500">
                            {appt.originalType || 'Consultation'}
                          </Typography>
                          {appt.status === 'Scheduled' || appt.status === 'pending' ? (
                            <Button size="small" onClick={(e) => { e.stopPropagation(); handleStartSession(appt.id); }} sx={{ minWidth: 'auto', p: 1, color: primaryColor, bgcolor: alpha(primaryColor, 0.1), borderRadius: 2 }}>
                              <PlayArrowIcon fontSize="small" />
                            </Button>
                          ) : appt.status === 'In Progress' ? (
                            <Button size="small" onClick={(e) => { e.stopPropagation(); handleEndSessionTrigger(appt.id); }} sx={{ minWidth: 'auto', p: 1, color: '#16a34a', bgcolor: '#dcfce7', borderRadius: 2 }}>
                              <CheckCircleIcon fontSize="small" />
                            </Button>
                          ) : (
                            <CheckCircleOutlineIcon sx={{ color: '#cbd5e1' }} />
                          )}
                        </Stack>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </Box>

            {/* Desktop: Table View */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <TableContainer sx={{ maxHeight: 500, overflowY: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      {['PATIENT', 'TIME', 'TREATMENT', 'APPT REASON', 'STATUS', 'ACTION'].map((head, i) => (
                        <TableCell key={head} align={i === 5 ? 'right' : 'left'} sx={{ bgcolor: '#f8fafc', fontWeight: '700', fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', py: 2 }}>
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSchedule.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                          <Avatar sx={{ width: 64, height: 64, bgcolor: '#f8fafc', color: '#cbd5e1', mb: 2, mx: 'auto' }}>
                            <EventAvailableIcon fontSize="large" />
                          </Avatar>
                          <Typography variant="h6" fontWeight="600" color="#475569">No Appointments Today</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>You have a clear schedule for the day!</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSchedule.map((appt) => {
                        const isSelected = selectedApptId === appt.id;
                        return (
                          <TableRow
                            key={appt.id}
                            hover
                            onClick={() => setSelectedApptId(appt.id)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: isSelected ? alpha(primaryColor, 0.04) : 'white',
                              transition: 'background-color 0.2s',
                              position: 'relative',
                              '&:hover': { bgcolor: isSelected ? alpha(primaryColor, 0.06) : '#f8fafc' },
                              '&::after': isSelected ? { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: primaryColor } : {}
                            }}
                          >
                            <TableCell sx={{ py: 2, borderBottom: '1px solid #f1f5f9' }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 40, height: 40, bgcolor: isSelected ? primaryColor : '#f1f5f9', color: isSelected ? 'white' : '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>
                                  {appt.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" fontWeight="600" color="#0f172a">{appt.name}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <Typography variant="body2" color="text.secondary" fontWeight="500">{appt.time}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <Typography variant="body2" color="#334155" fontWeight="500">{appt?.activeTreatments?.length > 0 ? appt.type || 'Consultation' : 'No active treatment'}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <Typography variant="body2" color="#334155" fontWeight="500">{appt.originalType || 'Consultation'}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>{getStatusChip(appt.status)}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              {appt.status === 'Scheduled' || appt.status === 'pending' ? (
                                <Tooltip title="Start Session">
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleStartSession(appt.id); }} sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, '&:hover': { bgcolor: alpha(primaryColor, 0.2) } }}>
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : appt.status === 'In Progress' ? (
                                <Tooltip title="Complete Session">
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleEndSessionTrigger(appt.id); }} sx={{ bgcolor: '#dcfce7', color: '#16a34a', '&:hover': { bgcolor: '#bbf7d0' } }}>
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <IconButton disabled><CheckCircleOutlineIcon sx={{ color: '#cbd5e1' }} /></IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Pagination Controls */}
            {schedule.length > 0 && (
              <Box sx={{ borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
                <TablePagination
                  component="div"
                  count={schedule.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            )}
          </Paper>
        </Box>


        {/* RIGHT: INTERACTIVE SCHEDULE TABLE */}
        <Box sx={{ width: '100%' }}>
          {displayPatient ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: displayPatient.status === 'In Progress'
                  ? `2px solid ${primaryColor}`
                  : '1px solid #e2e8f0',
                overflow: 'hidden',
                bgcolor: 'white',
                width: '100%',
              }}
            >
              {/* Header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  px: 2.5, py: 1.5,
                  bgcolor: displayPatient.status === 'In Progress' ? alpha(primaryColor, 0.06) : 'transparent',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Avatar sx={{
                  width: 48, height: 48,
                  bgcolor: displayPatient.status === 'In Progress' ? primaryColor : '#f1f5f9',
                  color: displayPatient.status === 'In Progress' ? 'white' : '#64748b',
                  fontSize: '1.2rem', fontWeight: 600, flexShrink: 0,
                }}>
                  {displayPatient.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#0f172a" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                    {displayPatient.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                      Patient ID: {displayPatient?.pid || displayPatient.id}
                    </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                      {displayPatient.time}
                    </Typography>
                    {displayPatient.status === 'In Progress' ? (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        bgcolor: '#dcfce7', px: 1, py: 0.25, borderRadius: 10
                      }}>
                        <Box sx={{
                          width: 7, height: 7, borderRadius: '50%', bgcolor: '#16a34a',
                          animation: `${pulseAnimation} 2s infinite`
                        }} />
                        <Typography variant="caption" fontWeight={600} color="#166534">In chair</Typography>
                      </Box>
                    ) : getStatusChip(displayPatient.status)}
                  </Stack>
                </Box>

                {/* Header Actions */}
                <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="View Full Profile">
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/patients/${displayPatient?.pid || displayPatient.id}`)}
                      sx={{
                        borderRadius: 2, borderColor: '#cbd5e1', color: '#475569',
                        minWidth: 36, width: 36, height: 36, p: 0,
                        '&:hover': { bgcolor: 'white', borderColor: '#94a3b8' }
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Button>
                  </Tooltip>

                  {(displayPatient.status === 'Scheduled' || displayPatient.status === 'pending') && (
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={() => handleStartSession(displayPatient.id)}
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        borderRadius: 2, fontWeight: 600, textTransform: 'none',
                        bgcolor: primaryColor, height: 36, whiteSpace: 'nowrap', px: 2
                      }}
                    >
                      Start Treatment
                    </Button>
                  )}

                  {displayPatient.status === 'In Progress' && (
                    <Button
                      variant="contained"
                      disableElevation
                      color="success"
                      onClick={() => handleEndSessionTrigger(displayPatient.id)}
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        borderRadius: 2, fontWeight: 600, textTransform: 'none',
                        height: 36, whiteSpace: 'nowrap', px: 2
                      }}
                    >
                      Complete Session
                    </Button>
                  )}

                  {displayPatient.status === 'Completed' && (
                    <Button
                      variant="outlined"
                      disabled
                      sx={{
                        borderRadius: 2, fontWeight: 600, textTransform: 'none',
                        height: 36, whiteSpace: 'nowrap', px: 2
                      }}
                    >
                      Session Finished
                    </Button>
                  )}
                </Box>
              </Stack>

              {/* Body — 3-column grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>

                {/* Appointment Reason */}
                <Box sx={{ p: 2, borderRight: { md: '1px solid #f1f5f9' }, borderBottom: { xs: '1px solid #f1f5f9', md: 'none' } }}>
                  <Typography
                    variant="caption" fontWeight={700} color="text.secondary"
                    sx={{ letterSpacing: '0.05em', display: 'block', mb: 0.75 }}
                  >
                    APPOINTMENT REASON
                  </Typography>
                  <Typography
                    variant="body2" fontWeight={500} color="#1e293b"
                    sx={{ p: 1.25, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}
                  >
                    {displayPatient.originalType || displayPatient.type || 'General Consultation'}
                  </Typography>
                </Box>

                {/* Active Treatment Plan */}
                <Box sx={{ p: 2, borderRight: { md: '1px solid #f1f5f9' }, borderBottom: { xs: '1px solid #f1f5f9', md: 'none' } }}>
                  <Typography
                    variant="caption" fontWeight={700} color="text.secondary"
                    sx={{ letterSpacing: '0.05em', display: 'block', mb: 0.75 }}
                  >
                    ACTIVE TREATMENT PLAN
                  </Typography>
                  {displayPatient.activeTreatments?.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {displayPatient.activeTreatments.map(t => (
                        <Chip
                          key={t._id}
                          label={`${t.procedure}${t.tooth ? ` (Tooth ${t.tooth})` : ''}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(primaryColor, 0.08), color: primaryColor,
                            fontWeight: 600, borderRadius: 1.5, height: 26
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="caption" color="text.secondary"
                      sx={{
                        p: 1.25, bgcolor: '#f8fafc', borderRadius: 1.5,
                        border: '1px dashed #cbd5e1', display: 'block'
                      }}
                    >
                      No ongoing treatment.
                    </Typography>
                  )}
                </Box>

                {/* Medical Alerts */}
                <Box sx={{ p: 2 }}>
                  {(displayPatient.conditions?.length > 0 || displayPatient.notes) ? (
                    <>
                      <Typography
                        variant="caption" fontWeight={700} color="#e11d48"
                        sx={{ letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}
                      >
                        <ErrorOutlineIcon sx={{ fontSize: 13 }} /> MEDICAL ALERTS
                      </Typography>
                      <Alert
                        severity="error"
                        icon={false}
                        sx={{ borderRadius: 1.5, py: 0, px: 1.5, border: '1px solid #fecdd3', bgcolor: '#fff1f2' }}
                      >
                        <Typography variant="caption" fontWeight={600} color="#be123c" sx={{ py: 0.75, display: 'block' }}>
                          {displayPatient.conditions?.length
                            ? displayPatient.conditions.join(', ')
                            : displayPatient.notes}
                        </Typography>
                      </Alert>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="caption" fontWeight={700} color="text.secondary"
                        sx={{ letterSpacing: '0.05em', display: 'block', mb: 0.75 }}
                      >
                        MEDICAL ALERTS
                      </Typography>
                      <Typography
                        variant="caption" color="text.secondary"
                        sx={{
                          p: 1.25, bgcolor: '#f8fafc', borderRadius: 1.5,
                          border: '1px dashed #cbd5e1', display: 'block'
                        }}
                      >
                        No alerts on record.
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4, borderRadius: 3, border: '2px dashed #cbd5e1',
                textAlign: 'center', bgcolor: 'transparent', width: '100%'
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" fontWeight={600} color="#475569" mb={0.5}>
                No Patient Selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select from the schedule to begin.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

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