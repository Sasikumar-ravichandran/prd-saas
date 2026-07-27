import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';
import { useColorMode } from '../../context/ThemeContext';

// CSS Imports
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Material UI
import {
  Box, Typography, Button, IconButton, Stack, Tooltip, Zoom,
  GlobalStyles, Card, CardContent, Avatar, Chip, Fade, useMediaQuery, useTheme, Tabs, Tab,
  CircularProgress
} from '@mui/material';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PersonIcon from '@mui/icons-material/Person';
import EventSeatIcon from '@mui/icons-material/EventSeat';

import AppointmentModal from './AppointmentModal';

// --- CONFIG ---
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const EVENT_COLORS = {
  default: { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
  surgery: { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' },
  checkup: { bg: '#ecfdf5', border: '#10b981', text: '#064e3b' },
};

// --- 1. RICH TOOLTIP CARD ( Memoized & Optimized) ---
const RichTooltip = React.memo(({ event }) => (
  <Card sx={{ minWidth: { xs: 260, sm: 280 }, maxWidth: { xs: 300, sm: 320 }, boxShadow: '0 8px 16px rgba(0,0,0,0.15)', borderRadius: 3 }}>
    <Box sx={{ bgcolor: '#f8fafc', p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid #e2e8f0' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle1" fontWeight="800" color="#1e293b" lineHeight={1.2} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            {event.type || 'General Visit'}
          </Typography>
        </Box>
        <Chip
          label="Scheduled" size="small"
          sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 'bold', fontSize: '0.65rem', height: 20 }}
        />
      </Stack>
    </Box>
    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: '12px !important', sm: '16px !important' }, display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Box>
          <Typography variant="body2" fontWeight="600" color="#334155" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {event.formattedTimeRange} {/*  Reads pre-calculated string */}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            Duration: {event.durationMins} mins {/*  Reads pre-calculated number */}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><PersonIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Dr. {event.doc}</Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><LocalPhoneIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{event.phone}</Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><EventSeatIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Chair {event.resourceId}</Typography>
      </Stack>
    </CardContent>
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', bgcolor: '#f8fafc', py: 0.5, borderRadius: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
        Click to edit or reschedule
      </Typography>
    </Box>
  </Card>
));

// --- 2. MODERN EVENT COMPONENT ( Memoized & Optimized) ---
const ModernEvent = React.memo(({ event }) => {
  let style = EVENT_COLORS.default;
  if (event.title.toLowerCase().includes('surgery')) style = EVENT_COLORS.surgery;
  if (event.title.toLowerCase().includes('checkup')) style = EVENT_COLORS.checkup;

  const isCompact = event.durationMins <= 30; // Uses pre-calculated data

  return (
    <Tooltip
      title={<RichTooltip event={event} />} placement="right" arrow
      TransitionComponent={Fade} TransitionProps={{ timeout: 200 }}
      componentsProps={{ tooltip: { sx: { bgcolor: 'transparent', boxShadow: 'none', maxWidth: 'none', p: 0 } } }}
    >
      <Box sx={{
        height: '100%', width: '100%',
        bgcolor: style.bg, borderLeft: `4px solid ${style.border}`,
        borderRadius: '3px', px: { xs: 0.5, sm: 1 }, py: isCompact ? 0 : 0.5,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        cursor: 'grab', overflow: 'hidden', position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        '&:hover': { filter: 'brightness(0.97)' },
        '&:active': { cursor: 'grabbing' }
      }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ color: style.text, fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2, noWrap: true }}>
          {event.title}
        </Typography>
        {!isCompact && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: style.text, opacity: 0.8, fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
              {event.formattedTime} {/*  Reads pre-calculated string */}
            </Typography>
          </Stack>
        )}
      </Box>
    </Tooltip>
  );
});

// --- MAIN PAGE ---
export default function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isLoading, setIsLoading] = useState(true); // NEW LOADING STATE
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Dynamic Resources
  const [resources, setResources] = useState([]);
  const [selectedMobileChair, setSelectedMobileChair] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { showToast } = useToast();
  const activeBranchId = localStorage.getItem('activeBranchId');
  const { primaryColor } = useColorMode();

  const fetchAllData = useCallback(async () => {
    setIsLoading(true); //  START LOADING
    try {
      const [patRes, userRes, apptRes, branchRes] = await Promise.all([
        api.get('/patients'),
        api.get('/users'),
        api.get('/appointments'),
        api.get('/branches')
      ]);

      setPatients(patRes.data);
      setDoctors(userRes.data.users.filter(u => u.role === 'Doctor' || u.role === 'doctor'));

      const branches = branchRes.data;
      const currentBranch = branches.find(b => b._id === activeBranchId);
      const chairCount = currentBranch?.chairCount || 1;

      const dynamicChairs = Array.from({ length: chairCount }, (_, i) => ({
        id: i + 1,
        title: `Chair ${i + 1}`
      }));
      setResources(dynamicChairs);

      const branchEvents = apptRes.data.filter(evt => evt.branchId === activeBranchId);
      setEvents(branchEvents.map(evt => {
        const start = new Date(evt.start);
        const end = new Date(evt.end);

        // PRE-CALCULATING EXPENSIVE MATH ONCE DURING FETCH
        return {
          ...evt,
          id: evt._id,
          title: evt.title || evt.patientName || 'Appointment',
          start,
          end,
          doc: evt.doctorName,
          resourceId: evt.resourceId || 1,
          phone: evt.phone || 'N/A',
          type: evt.type || 'Consultation',
          durationMins: moment(end).diff(moment(start), 'minutes'),
          formattedTime: moment(start).format('h:mm A'),
          formattedTimeRange: `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`
        };
      }));
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false); //  STOP LOADING
    }
  }, [activeBranchId, showToast]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleSelectSlot = ({ start, end, resourceId }) => {
    const assignedResource = resourceId || selectedMobileChair;
    setSelectedSlot({ start, end, resourceId: assignedResource });
    setModalOpen(true);
  };

  const onEventDrop = useCallback(({ event, start, end, resourceId }) => {
    //  UPDATE THE PRE-CALCULATED MATH ON DROP
    const updatedEvent = {
      ...event,
      start,
      end,
      resourceId,
      durationMins: moment(end).diff(moment(start), 'minutes'),
      formattedTime: moment(start).format('h:mm A'),
      formattedTimeRange: `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`
    };

    setEvents(prev => prev.map(ev => ev.id === event.id ? updatedEvent : ev));

    api.put(`/appointments/${event.id}`, { start, end, resourceId })
      .then(() => showToast('Rescheduled', 'success'))
      .catch(() => {
        showToast('Move failed', 'error');
        setEvents(prev => prev.map(ev => ev.id === event.id ? event : ev));
      });
  }, [showToast]);

  const handleSave = async (data) => {
    try {
      const payload = { ...data, branchId: activeBranchId };
      if (selectedSlot?.id) {
        await api.put(`/appointments/${selectedSlot.id}`, payload);
        fetchAllData(); // Refresh to recalculate math easily
      } else {
        await api.post('/appointments', payload);
        fetchAllData();
      }
      setModalOpen(false); showToast('Saved', 'success');
    } catch (e) { showToast(e || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/appointments/${id}`);
    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false); showToast('Deleted', 'success');
  };

  let displayResources = undefined;
  if (view === Views.DAY) {
    if (isMobile) displayResources = resources.filter(r => r.id === selectedMobileChair);
    else displayResources = resources;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2 }, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <GlobalStyles styles={{
        '.rbc-time-content': { overflowY: 'auto !important', scrollbarWidth: 'thin' },
        '.rbc-time-view': { border: 'none !important' },
        '.rbc-current-time-indicator': { backgroundColor: '#ef4444 !important', height: '2px !important', zIndex: 100, pointerEvents: 'none' },
        '.rbc-current-time-indicator::before': { content: '""', position: 'absolute', left: '-6px', top: '-3px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' },
        '.rbc-timeslot-group': { borderBottom: '1px solid #cbd5e1 !important', minHeight: isMobile ? '50px !important' : '60px !important' },
        '.rbc-time-slot': { borderTop: '1px dashed #e2e8f0 !important' },
        '.rbc-day-bg + .rbc-day-bg': { borderLeft: '1px solid #cbd5e1 !important' },
        '.rbc-header + .rbc-header': { borderLeft: '1px solid #cbd5e1 !important' },
        '.rbc-label': { color: '#1e293b !important', fontWeight: 800, fontSize: isMobile ? '0.7rem' : '0.85rem', paddingRight: isSmallMobile ? '4px' : '8px' },
        '.rbc-time-gutter .rbc-timeslot-group': { borderBottom: 'none !important', alignItems: 'center', justifyContent: 'center' },
        '.rbc-header': { padding: isMobile ? '8px 0' : '12px 0', borderBottom: '2px solid #94a3b8 !important', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: isMobile ? '0.7rem' : '0.8rem', letterSpacing: '0.5px' },
        '.rbc-month-view': { fontSize: isSmallMobile ? '0.7rem' : '0.85rem' },
        '.rbc-date-cell': { padding: isSmallMobile ? '2px !important' : '4px !important', fontSize: isSmallMobile ? '0.7rem' : '0.85rem' },
        '.rbc-event-content': { fontSize: isSmallMobile ? '0.65rem' : '0.75rem' },
        '.rbc-time-gutter': { width: isSmallMobile ? '45px !important' : isMobile ? '55px !important' : '70px !important' },
        '.rbc-event': { background: 'transparent !important', border: 'none !important', padding: '0 !important', outline: 'none !important' },
        '.rbc-event-label': { display: 'none !important' },
      }} />

      {/* Toolbar */}
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row' },
        justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' },
        px: { xs: 2, sm: 0 }, py: { xs: 1.5, sm: 0 }, pb: { sm: 2 },
        borderBottom: '1px solid #e2e8f0', gap: { xs: 1.5, sm: 2 }
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 1.5, sm: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
            <Button
              onClick={() => setDate(new Date())} variant="outlined"
              sx={{ color: '#0f172a', borderColor: '#e2e8f0', fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 0.5, sm: 0.75 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Today
            </Button>
            <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <IconButton onClick={() => setDate(moment(date).subtract(1, view === Views.MONTH ? 'month' : 'day').toDate())} size="small" sx={{ color: '#475569' }}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: '1px', bgcolor: '#cbd5e1', my: 1 }} />
              <IconButton onClick={() => setDate(moment(date).add(1, view === Views.MONTH ? 'month' : 'day').toDate())} size="small" sx={{ color: '#475569' }}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
              {view === Views.DAY ? moment(date).format('MMMM Do') : moment(date).format('MMMM YYYY')}
            </Typography>
            {view === Views.DAY && (
              <Typography variant="caption" fontWeight="600" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {moment(date).format('dddd')} • {moment(date).format('YYYY')}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction={{ xs: 'row', sm: 'row' }} alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
          <Box sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex' }}>
            <Button
              onClick={() => setView(Views.DAY)}
              sx={{
                borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', px: { xs: 1.5, sm: 2 }, py: { xs: 0.4, sm: 0.5 },
                bgcolor: view === Views.DAY ? '#fff' : 'transparent', color: view === Views.DAY ? '#0f172a' : '#64748b',
                boxShadow: view === Views.DAY ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 50, sm: 'auto' }
              }}
            >
              Day
            </Button>
            <Button
              onClick={() => setView(Views.MONTH)}
              sx={{
                borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', px: { xs: 1.5, sm: 2 }, py: { xs: 0.4, sm: 0.5 },
                bgcolor: view === Views.MONTH ? '#fff' : 'transparent', color: view === Views.MONTH ? '#0f172a' : '#64748b',
                boxShadow: view === Views.MONTH ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 50, sm: 'auto' }
              }}
            >
              Month
            </Button>
          </Box>
          <Button
            variant="contained" startIcon={!isSmallMobile && <AddIcon />}
            onClick={() => { setSelectedSlot(null); setModalOpen(true); }}
            sx={{
              bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 'bold',
              px: { xs: 2, sm: 2 }, py: { xs: 0.75, sm: 1 }, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            {isSmallMobile ? <AddIcon fontSize="small" /> : 'Appointment'}
          </Button>
        </Stack>
      </Box>

      {/* MOBILE CHAIR SWITCHER */}
      {isMobile && view === Views.DAY && resources.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', px: { xs: 2, sm: 0 } }}>
          <Tabs
            value={selectedMobileChair}
            onChange={(e, newValue) => setSelectedMobileChair(newValue)}
            variant="scrollable" scrollButtons="auto"
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0, textTransform: 'none', fontWeight: '700', fontSize: '0.85rem' }, '& .Mui-selected': { color: primaryColor } }}
          >
            {resources.map(res => (
              <Tab key={res.id} label={res.title} value={res.id} />
            ))}
          </Tabs>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: { xs: 400, sm: 500, md: 'auto' }, position: 'relative' }}>

        <Fade in={isLoading} unmountOnExit>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CircularProgress size={40} sx={{ color: primaryColor }} />
          </Box>
        </Fade>

        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.DAY}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"
          resources={displayResources}
          selectable
          resizable={!isMobile}
          step={15}
          timeslots={4}
          scrollToTime={moment().subtract(1, 'hours').toDate()}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(e) => { setSelectedSlot(e); setModalOpen(true); }}
          onEventDrop={isMobile ? undefined : onEventDrop}
          components={{ event: ModernEvent, toolbar: () => null }}
          style={{ height: '100%', width: '100%' }}
        />
      </Box>

      <AppointmentModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        initialData={selectedSlot} onSave={handleSave} onDelete={handleDelete}
        doctors={doctors} patients={patients} resources={resources}
      />
    </Box>
  );
}