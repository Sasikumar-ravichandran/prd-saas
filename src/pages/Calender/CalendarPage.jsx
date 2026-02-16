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
  GlobalStyles, Card, CardContent, Avatar, Chip, Fade
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

const RESOURCES = [
  { id: 1, title: 'Chair 1 (Surgical)' },
  { id: 2, title: 'Chair 2 (General)' },
  { id: 3, title: 'Chair 3 (Hygiene)' },
];

const EVENT_COLORS = {
  default: { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' }, // Blue
  surgery: { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' }, // Red
  checkup: { bg: '#ecfdf5', border: '#10b981', text: '#064e3b' }, // Green
};

// --- 1. RICH TOOLTIP CARD ---
const RichTooltip = ({ event }) => (
  <Card sx={{ minWidth: 280, maxWidth: 320, boxShadow: '0 8px 16px rgba(0,0,0,0.15)', borderRadius: 3 }}>
    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderBottom: '1px solid #e2e8f0' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle1" fontWeight="800" color="#1e293b" lineHeight={1.2}>
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            {event.type || 'General Visit'}
          </Typography>
        </Box>
        <Chip
          label="Scheduled" size="small"
          sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 'bold', fontSize: '0.65rem', height: 20 }}
        />
      </Stack>
    </Box>
    <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Box>
          <Typography variant="body2" fontWeight="600" color="#334155">
            {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
          </Typography>
          <Typography variant="caption" color="text.secondary">Duration: {moment(event.end).diff(moment(event.start), 'minutes')} mins</Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><PersonIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155">Dr. {event.doc}</Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><LocalPhoneIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155">{event.phone}</Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 24, height: 24, bgcolor: '#f1f5f9' }}><EventSeatIcon sx={{ fontSize: 14, color: '#64748b' }} /></Avatar>
        <Typography variant="body2" color="#334155">Chair {event.resourceId}</Typography>
      </Stack>
    </CardContent>
    <Box sx={{ px: 2, pb: 2 }}>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', bgcolor: '#f8fafc', py: 0.5, borderRadius: 1 }}>
        Click to edit or reschedule
      </Typography>
    </Box>
  </Card>
);

// --- 2. MODERN EVENT COMPONENT ---
const ModernEvent = ({ event }) => {
  let style = EVENT_COLORS.default;
  if (event.title.toLowerCase().includes('surgery')) style = EVENT_COLORS.surgery;
  if (event.title.toLowerCase().includes('checkup')) style = EVENT_COLORS.checkup;

  const duration = moment(event.end).diff(moment(event.start), 'minutes');
  const isCompact = duration <= 30;

  return (
    <Tooltip
      title={<RichTooltip event={event} />} placement="right" arrow
      TransitionComponent={Fade} TransitionProps={{ timeout: 200 }}
      componentsProps={{ tooltip: { sx: { bgcolor: 'transparent', boxShadow: 'none', maxWidth: 'none', p: 0 } } }}
    >
      <Box sx={{
        height: '100%', width: '100%',
        bgcolor: style.bg, borderLeft: `4px solid ${style.border}`,
        borderRadius: '3px', px: 1, py: isCompact ? 0 : 0.5,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        cursor: 'grab', overflow: 'hidden', position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        '&:hover': { filter: 'brightness(0.97)' },
        '&:active': { cursor: 'grabbing' }
      }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ color: style.text, fontSize: '0.75rem', lineHeight: 1.2, noWrap: true }}>
          {event.title}
        </Typography>
        {!isCompact && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: style.text, opacity: 0.8, fontWeight: 600, fontSize: '0.7rem' }}>
              {moment(event.start).format('h:mm A')}
            </Typography>
          </Stack>
        )}
      </Box>
    </Tooltip>
  );
};

// --- MAIN PAGE ---
export default function CalendarPage() {
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { showToast } = useToast();
  const activeBranchId = localStorage.getItem('activeBranchId');
  const { primaryColor } = useColorMode();

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    try {
      const [patRes, userRes, apptRes] = await Promise.all([
        api.get('/patients'),
        api.get('/users'),
        api.get('/appointments')
      ]);
      setPatients(patRes.data);
      const docList = userRes.data.filter(u => u.role === 'Doctor' || u.role === 'doctor');
      setDoctors(docList);

      const branchEvents = apptRes.data.filter(evt => evt.branchId === activeBranchId);
      setEvents(branchEvents.map(evt => ({
        ...evt,
        id: evt._id,
        title: evt.title || evt.patientName || 'Appointment',
        start: new Date(evt.start),
        end: new Date(evt.end),
        doc: evt.doctorName,
        resourceId: evt.resourceId || 1,
        phone: evt.phone || 'N/A',
        type: evt.type || 'Consultation'
      })));
    } catch (err) { console.error(err); }
  }, [activeBranchId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- HANDLERS ---
  const handleSelectSlot = ({ start, end, resourceId }) => {
    setSelectedSlot({ start, end, resourceId });
    setModalOpen(true);
  };

  const onEventDrop = useCallback(({ event, start, end, resourceId }) => {
    const updatedEvent = { ...event, start, end, resourceId };
    setEvents(prev => prev.map(ev => ev.id === event.id ? updatedEvent : ev)); // UI Update

    api.put(`/appointments/${event.id}`, { start, end, resourceId })
      .then(() => showToast('Rescheduled', 'success'))
      .catch(() => {
        showToast('Move failed', 'error');
        setEvents(prev => prev.map(ev => ev.id === event.id ? event : ev)); // Revert
      });
  }, [showToast]);

  const handleSave = async (data) => {
    try {
      const payload = { ...data, branchId: activeBranchId };
      if (selectedSlot?.id) {
        await api.put(`/appointments/${selectedSlot.id}`, payload);
        setEvents(prev => prev.map(ev => ev.id === selectedSlot.id ? { ...ev, ...payload, start: new Date(payload.start), end: new Date(payload.end) } : ev));
      } else {
        await api.post('/appointments', payload);
        fetchAllData();
      }
      setModalOpen(false); showToast('Saved', 'success');
    } catch (e) { showToast('Error', 'error'); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/appointments/${id}`);
    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false); showToast('Deleted', 'success');
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 100px)',
      display: 'flex', flexDirection: 'column',
      bgcolor: '#fff', borderRadius: 3, p: 2,
      overflow: 'hidden'
    }}>

      {/* ⚡️ HIGH CONTRAST GRID STYLES ⚡️ */}
      <GlobalStyles styles={{
        // 1. SCROLLING
        '.rbc-time-content': { overflowY: 'auto !important', scrollbarWidth: 'thin' },
        '.rbc-time-view': { border: 'none !important' },

        // 2. THE RED LINE (Current Time)
        '.rbc-current-time-indicator': {
          backgroundColor: '#ef4444 !important',
          height: '2px !important',
          zIndex: 100,
          pointerEvents: 'none'
        },
        '.rbc-current-time-indicator::before': {
          content: '""', position: 'absolute', left: '-6px', top: '-3px',
          width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%',
        },

        // 3. STRONG GRID LINES (The Fix)
        // Main Hour Line (Solid Dark Grey)
        '.rbc-timeslot-group': {
          borderBottom: '1px solid #cbd5e1 !important', // Darker border for hours
          minHeight: '60px !important', // Force bigger slots for readability
        },
        // 15-Min Sub-lines (Dashed Light Grey)
        '.rbc-time-slot': {
          borderTop: '1px dashed #e2e8f0 !important'
        },
        // Vertical Column Lines (Solid)
        '.rbc-day-bg + .rbc-day-bg': {
          borderLeft: '1px solid #cbd5e1 !important'
        },
        // Header Column Lines
        '.rbc-header + .rbc-header': {
          borderLeft: '1px solid #cbd5e1 !important'
        },

        // 4. BOLD TIME LABELS
        '.rbc-label': {
          color: '#1e293b !important', // Dark text
          fontWeight: 800,
          fontSize: '0.85rem',
          paddingRight: '8px'
        },
        '.rbc-time-gutter .rbc-timeslot-group': {
          borderBottom: 'none !important', // Remove double border in gutter
          alignItems: 'center', // Center numbers vertically
          justifyContent: 'center'
        },

        // 5. HEADER STYLES
        '.rbc-header': {
          padding: '12px 0',
          borderBottom: '2px solid #94a3b8 !important', // Strong header underline
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          letterSpacing: '0.5px'
        },

        // CLEANUP
        '.rbc-event': { background: 'transparent !important', border: 'none !important', padding: '0 !important', outline: 'none !important' },
        '.rbc-event-label': { display: 'none !important' },
      }} />

      {/* Toolbar */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, row on desktop
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #e2e8f0',
        gap: 2
      }}>

        {/* LEFT SIDE: Navigation & Title (Anchored) */}
        <Stack direction="row" alignItems="center" spacing={3}>

          {/* 1. Navigation Cluster (Fixed Position) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              onClick={() => setDate(new Date())}
              variant="outlined"
              size="small"
              sx={{
                color: '#0f172a',
                borderColor: '#e2e8f0',
                fontWeight: 'bold',
                textTransform: 'none',
                minWidth: 'auto',
                px: 2
              }}
            >
              Today
            </Button>

            <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <IconButton
                onClick={() => setDate(moment(date).subtract(1, view === Views.MONTH ? 'month' : 'day').toDate())}
                size="small"
                sx={{ color: '#475569', '&:hover': { color: '#0f172a' } }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: '1px', bgcolor: '#cbd5e1', my: 1 }} /> {/* Vertical Divider */}
              <IconButton
                onClick={() => setDate(moment(date).add(1, view === Views.MONTH ? 'month' : 'day').toDate())}
                size="small"
                sx={{ color: '#475569', '&:hover': { color: '#0f172a' } }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>

          {/* 2. The Date Title (Grows to the right) */}
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {view === Views.DAY
                ? moment(date).format('MMMM Do') // "February 16th"
                : moment(date).format('MMMM YYYY')     // "February 2026"
              }
            </Typography>
            {view === Views.DAY && (
              <Typography variant="caption" fontWeight="600" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                {moment(date).format('dddd')} • {moment(date).format('YYYY')}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* RIGHT SIDE: View Switcher & Actions */}
        <Stack direction="row" alignItems="center" spacing={2}>

          {/* View Toggles (Segmented Control Style) */}
          <Box sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex' }}>
            <Button
              size="small"
              onClick={() => setView(Views.DAY)}
              sx={{
                borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', px: 2, py: 0.5,
                bgcolor: view === Views.DAY ? '#fff' : 'transparent',
                color: view === Views.DAY ? '#0f172a' : '#64748b',
                boxShadow: view === Views.DAY ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                '&:hover': { bgcolor: view === Views.DAY ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              Day
            </Button>
            <Button
              size="small"
              onClick={() => setView(Views.MONTH)}
              sx={{
                borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', px: 2, py: 0.5,
                bgcolor: view === Views.MONTH ? '#fff' : 'transparent',
                color: view === Views.MONTH ? '#0f172a' : '#64748b',
                boxShadow: view === Views.MONTH ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                '&:hover': { bgcolor: view === Views.MONTH ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            >
              Month
            </Button>
          </Box>

          {/* Primary Action */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setSelectedSlot(null); setModalOpen(true); }}
            sx={{
              bgcolor: primaryColor,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            Appointment
          </Button>
        </Stack>

      </Box>

      {/* Calendar */}
      <Box sx={{ flex: 1, mt: 2, overflow: 'hidden' }}>
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
          resources={view === Views.DAY ? RESOURCES : undefined}
          selectable
          resizable
          step={15}
          timeslots={4}
          scrollToTime={new Date(new Date().setHours(8, 0, 0, 0))}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(e) => { setSelectedSlot(e); setModalOpen(true); }}
          onEventDrop={onEventDrop}
          components={{ event: ModernEvent, toolbar: () => null }}
          style={{ height: '100%' }}
        />
      </Box>

      <AppointmentModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        initialData={selectedSlot} onSave={handleSave} onDelete={handleDelete}
        doctors={doctors} patients={patients} resources={RESOURCES}
      />
    </Box>
  );
}