import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useColorMode } from '../../context/ThemeContext';

// CSS Imports (Make sure these are imported!)
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import {
  Box, Paper, Typography, Button, IconButton, Stack
} from '@mui/material';

// Components
// import AppointmentModal from '../../components/Calendar/AppointmentModal';
import AppointmentModal from './AppointmentModal';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import ChairIcon from '@mui/icons-material/Chair';

// --- SETUP ---
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

// --- MOCK DATA ---
const RESOURCES = [
  { id: 1, title: 'Chair 1 (Surgical)', capacity: 'Dr. Ramesh' },
  { id: 2, title: 'Chair 2 (General)', capacity: 'Dr. Priya' },
  { id: 3, title: 'Chair 3 (Hygiene)', capacity: 'Hygienist' },
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Ravi Kumar',
    type: 'Root Canal',
    start: new Date(2026, 1, 6, 10, 0), // Note: Month is 0-indexed (1 = Feb)
    end: new Date(2026, 1, 6, 11, 30),
    resourceId: 1,
    doc: 'Dr. Ramesh',
    status: 'In Chair',
    theme: 'blue'
  },
  {
    id: 2,
    title: 'Anita Raj',
    type: 'Cleaning',
    start: new Date(2026, 1, 6, 10, 30),
    end: new Date(2026, 1, 6, 11, 15),
    resourceId: 3,
    doc: 'Hygienist',
    status: 'Waiting',
    theme: 'orange'
  },
  {
    id: 3,
    title: 'Suresh B',
    type: 'Extraction',
    start: new Date(2026, 1, 6, 12, 0),
    end: new Date(2026, 1, 6, 13, 0),
    resourceId: 1,
    doc: 'Dr. Ramesh',
    status: 'Confirmed',
    theme: 'green'
  },
];

const THEMES = {
  blue: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', pill: '#bfdbfe' },
  orange: { bg: '#fff7ed', border: '#f97316', text: '#9a3412', pill: '#fed7aa' },
  green: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', pill: '#bbf7d0' },
};

// --- CUSTOM COMPONENTS ---

// 1. Column Header (Shows Chair Name + Doctor)
const CustomResourceHeader = ({ label }) => {
  const resource = RESOURCES.find(r => r.title === label) || { title: label, capacity: 'Open' };

  return (
    <Box sx={{ textAlign: 'center', py: 0.5 }}>
      <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#111827', fontSize: '0.9rem' }}>
        {resource.title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <ChairIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          {resource.capacity}
        </Typography>
      </Box>
    </Box>
  );
};

// 2. Event Card (The actual appointment block)
const CustomEvent = ({ event }) => {
  const theme = THEMES[event.theme] || THEMES.blue;

  return (
    <Box sx={{
      height: '100%',
      p: 1,
      bgcolor: theme.bg,
      borderLeft: `4px solid ${theme.border}`,
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      cursor: 'pointer',
      fontSize: '0.75rem',
      lineHeight: 1.2
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#1f2937', fontSize: '0.8rem', noWrap: true }}>
          {event.title}
        </Typography>
      </Box>

      <Typography variant="caption" fontWeight="600" sx={{ color: theme.text, mb: 'auto' }}>
        {event.type}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 'bold' }}>
          {moment(event.start).format('h:mm')} - {moment(event.end).format('h:mm A')}
        </Typography>
      </Box>
    </Box>
  );
};

// 3. Toolbar (Date Nav + Buttons)
const CustomToolbar = ({ date, onNavigate, onView, view, onBook }) => {
  const dateLabel = moment(date).format('dddd, D MMMM YYYY');
  const { primaryColor } = useColorMode();

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2 }}>

      {/* Date Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <IconButton size="small" onClick={() => onNavigate('PREV')}><ChevronLeftIcon /></IconButton>
          <Button onClick={() => onNavigate('TODAY')} sx={{ fontWeight: 'bold', color: '#374151', minWidth: 60, textTransform: 'none', fontSize: '0.85rem' }}>Today</Button>
          <IconButton size="small" onClick={() => onNavigate('NEXT')}><ChevronRightIcon /></IconButton>
        </Paper>
        <Typography variant="h6" fontWeight="800" color="#111827">
          {dateLabel}
        </Typography>
      </Box>

      {/* View Switcher & Actions */}
      <Stack direction="row" spacing={2}>
        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, display: 'flex', overflow: 'hidden' }}>
          <Button
            onClick={() => onView(Views.DAY)}
            sx={{ borderRadius: 0, bgcolor: view === Views.DAY ? '#f3f4f6' : 'transparent', color: view === Views.DAY ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}
          >
            Day
          </Button>
          <Button
            onClick={() => onView(Views.WEEK)}
            sx={{ borderRadius: 0, bgcolor: view === Views.WEEK ? '#f3f4f6' : 'transparent', color: view === Views.WEEK ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}
          >
            Week
          </Button>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onBook}
          sx={{ bgcolor: primaryColor, borderRadius: 2, px: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
        >
          Book Appointment
        </Button>
      </Stack>
    </Box>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CalendarPage() {
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date(2026, 1, 6)); // Default to Feb 6, 2026
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 1. OPEN EMPTY MODAL (Button Click)
  const handleOpenBooking = () => {
    setSelectedSlot(null);
    setModalOpen(true);
  };

  // 2. OPEN FROM SLOT CLICK (Empty Grid)
  const handleSelectSlot = useCallback(({ start, end, resourceId }) => {
    setSelectedSlot({ start, end, resourceId });
    setModalOpen(true);
  }, []);

  // 3. OPEN FROM EVENT CLICK (Edit Existing)
  const handleSelectEvent = useCallback((event) => {
    setSelectedSlot(event);
    setModalOpen(true);
  }, []);

  // 4. DRAG & DROP HANDLER
  const moveEvent = useCallback(({ event, start, end, resourceId }) => {
    setEvents((prev) => {
      const existing = prev.find((ev) => ev.id === event.id);
      const filtered = prev.filter((ev) => ev.id !== event.id);
      return [...filtered, { ...existing, start, end, resourceId }];
    });
  }, []);

  // 5. RESIZE HANDLER
  const resizeEvent = useCallback(({ event, start, end }) => {
    setEvents((prev) => {
      const existing = prev.find((ev) => ev.id === event.id);
      const filtered = prev.filter((ev) => ev.id !== event.id);
      return [...filtered, { ...existing, start, end }];
    });
  }, []);

  // 6. SAVE FROM MODAL
  const handleSaveAppointment = (data) => {
    if (selectedSlot?.id) {
      // UPDATE EXISTING
      setEvents(prev => prev.map(ev => ev.id === selectedSlot.id ? { ...ev, ...data } : ev));
    } else {
      // CREATE NEW
      const newEvent = {
        id: Date.now(),
        ...data,
        doc: RESOURCES.find(r => r.id === data.resourceId)?.capacity || 'Unknown',
        status: 'Scheduled',
        theme: 'blue' // Default theme
      };
      setEvents([...events, newEvent]);
    }
    setModalOpen(false);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* THE CALENDAR */}
      <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.DAY}
          view={view}
          onView={setView} // Hook up view switcher
          date={date}
          onNavigate={setDate} // Hook up date navigator

          resources={RESOURCES}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"

          // Interaction
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={moveEvent}
          onEventResize={resizeEvent}
          resizable

          // Config
          step={15} // 15 min slots for precision
          timeslots={4} // 4 slots per hour (matches 15 min step)
          min={new Date(0, 0, 0, 9, 0, 0)} // Start 9 AM
          max={new Date(0, 0, 0, 19, 0, 0)} // End 7 PM

          // Custom UI
          components={{
            event: CustomEvent,
            resourceHeader: CustomResourceHeader,
            toolbar: (props) => <CustomToolbar {...props} onBook={handleOpenBooking} />
          }}

          style={{ height: '100%' }}
        />
      </Box>

      {/* THE MODAL */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={selectedSlot}
        resources={RESOURCES}
        onSave={handleSaveAppointment}
      />
    </Box>
  );
}