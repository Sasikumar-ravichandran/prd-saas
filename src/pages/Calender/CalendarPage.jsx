import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useColorMode } from '../../context/ThemeContext';
import api from '../../api/services/api'; 
import { useToast } from '../../context/ToastContext'; 

// CSS Imports
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Material UI
import { Box, Paper, Typography, Button, IconButton, Stack, Tooltip, Zoom, Divider, GlobalStyles } from '@mui/material';

// Components
import AppointmentModal from './AppointmentModal';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventSeatIcon from '@mui/icons-material/EventSeat';

// --- SETUP ---
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const RESOURCES = [
  { id: 1, title: 'Chair 1 (Surgical)', capacity: 'Dr. Ramesh' },
  { id: 2, title: 'Chair 2 (General)', capacity: 'Dr. Priya' },
  { id: 3, title: 'Chair 3 (Hygiene)', capacity: 'Hygienist' },
];

const THEMES = {
  blue: { bg: '#2563eb', border: '#1e40af', text: '#ffffff' }, 
  orange: { bg: '#f97316', border: '#c2410c', text: '#ffffff' },
  green: { bg: '#16a34a', border: '#15803d', text: '#ffffff' },
};

// --- CUSTOM COMPONENTS ---

// 1. TOOLTIP CONTENT (Shows ALL details even for small slots)
const EventTooltip = ({ event }) => (
  <Box sx={{ p: 1.5, minWidth: 240 }}>
    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#fff', mb: 0.5, lineHeight: 1.2 }}>
      {event.title}
    </Typography>
    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
    
    <Stack spacing={1.2}>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccessTimeIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
          <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
            {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
          </Typography>
       </Box>

       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MedicalServicesIcon sx={{ fontSize: 18, color: '#f87171' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {event.type}
          </Typography>
       </Box>

       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ fontSize: 18, color: '#4ade80' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
             Dr. {event.doc || 'Unknown'}
          </Typography>
       </Box>

       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalPhoneIcon sx={{ fontSize: 18, color: '#60a5fa' }} />
          <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
            {event.phone || 'No Phone'}
          </Typography>
       </Box>

       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EventSeatIcon sx={{ fontSize: 18, color: '#a78bfa' }} />
          <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
            Chair {event.resourceId}
          </Typography>
       </Box>
    </Stack>
  </Box>
);

// 2. EVENT CARD (Fixed for 15-min slots)
const CustomEvent = ({ event }) => {
  const theme = THEMES[event.theme] || THEMES.blue;
  
  // Detect if appointment is small (<= 30 mins)
  const duration = moment(event.end).diff(moment(event.start), 'minutes');
  const isCompact = duration <= 30; 

  return (
    <Tooltip 
      title={<EventTooltip event={event} />} 
      arrow 
      TransitionComponent={Zoom}
      placement="right" 
      disablePortal={false} 
      componentsProps={{
        tooltip: {
            sx: {
                bgcolor: '#0f172a', 
                color: 'white',
                '& .MuiTooltip-arrow': { color: '#0f172a' },
                boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)'
            }
        }
      }}
    >
      <Box sx={{
        height: '100%',
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        // If Compact: Center the name vertically so it's visible
        justifyContent: isCompact ? 'center' : 'flex-start',
        // If Compact: Remove padding so text doesn't get pushed out
        p: isCompact ? 0 : 0.5, 
        
        bgcolor: theme.bg,
        borderLeft: isCompact ? 'none' : `4px solid ${theme.border}`,
        borderRadius: '3px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        
        // HOVER MAGIC
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'auto', 
        transition: 'all 0.1s ease-in-out',
        '&:hover': { 
            filter: 'brightness(1.1)', 
            transform: 'scale(1.02)',
            zIndex: 999 
        }
      }}>
        {/* Title / Name */}
        <Typography 
            variant="subtitle2" fontWeight="700" 
            sx={{ 
                color: theme.text, fontSize: isCompact ? '0.7rem' : '0.8rem', lineHeight: 1,
                textAlign: isCompact ? 'center' : 'left', // Center text for tiny slots
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                px: isCompact ? 0.5 : 0 
            }}
        >
          {event.title}
        </Typography>

        {/* ONLY show details if slot is big enough (> 30 mins) */}
        {!isCompact && (
          <>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', mt: 0.5, lineHeight: 1 }}>
              {event.type}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', mt: 'auto' }}>
              {moment(event.start).format('h:mm')} - {moment(event.end).format('h:mm')}
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
};

// 3. TOOLBAR
const CustomToolbar = ({ date, onNavigate, onView, view, onBook }) => {
  const dateLabel = moment(date).format('dddd, D MMMM YYYY');
  const { primaryColor } = useColorMode();
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <IconButton size="small" onClick={() => onNavigate('PREV')}><ChevronLeftIcon /></IconButton>
          <Button onClick={() => onNavigate('TODAY')} sx={{ fontWeight: 'bold', textTransform: 'none' }}>Today</Button>
          <IconButton size="small" onClick={() => onNavigate('NEXT')}><ChevronRightIcon /></IconButton>
        </Paper>
        <Typography variant="h6" fontWeight="800" color="#111827">{dateLabel}</Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, display: 'flex', overflow: 'hidden' }}>
          <Button onClick={() => onView(Views.DAY)} sx={{ bgcolor: view === Views.DAY ? '#f3f4f6' : 'transparent', color: view === Views.DAY ? 'primary.main' : 'text.secondary' }}>Day</Button>
          <Button onClick={() => onView(Views.WEEK)} sx={{ bgcolor: view === Views.WEEK ? '#f3f4f6' : 'transparent', color: view === Views.WEEK ? 'primary.main' : 'text.secondary' }}>Week</Button>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onBook} sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>Book Appointment</Button>
      </Stack>
    </Box>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CalendarPage() {
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { showToast } = useToast(); 

  // --- 1. FETCH ALL DATA ---
  const fetchAllData = useCallback(async () => {
    try {
      const [patRes, userRes] = await Promise.all([
         api.get('/patients'),
         api.get('/users')
      ]);
      setPatients(patRes.data);
      const docList = userRes.data.filter(u => u.role === 'Doctor' || u.role === 'doctor');
      setDoctors(docList);

      const apptRes = await api.get('/appointments'); 
      
      const formattedEvents = apptRes.data.map(evt => ({
        ...evt,
        id: evt._id, 
        // --- Map Backend 'doctorId' to Frontend 'docId' for dropdown ---
        docId: evt.doctorId, 
        doc: evt.doctorName, 
        start: new Date(evt.start),
        end: new Date(evt.end),
        theme: 'blue' 
      }));

      setEvents(formattedEvents);

    } catch (err) {
      console.error("Failed to fetch calendar data", err);
      showToast('Error loading schedule.', 'error'); 
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handlers
  const handleOpenBooking = () => {
    setSelectedSlot(null);
    setModalOpen(true);
  };

  const handleSelectSlot = useCallback(({ start, end, resourceId }) => {
    setSelectedSlot({ start, end, resourceId });
    setModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedSlot(event);
    setModalOpen(true);
  }, []);

  // --- 2. SAVE APPOINTMENT ---
  const handleSaveAppointment = async (data) => {
    try {
      if (selectedSlot?.id) {
        // UPDATE
        await api.put(`/appointments/${selectedSlot.id}`, data);
        
        setEvents(prev => prev.map(ev => ev.id === selectedSlot.id ? { 
            ...ev, ...data, start: new Date(data.start), end: new Date(data.end) 
        } : ev));
        
        showToast('Appointment updated successfully!', 'success');

      } else {
        // CREATE
        const res = await api.post('/appointments', data);
        const savedEvent = res.data;

        const newEvent = { 
            ...savedEvent, 
            id: savedEvent._id,
            docId: savedEvent.doctorId, // Ensure mapping
            doc: savedEvent.doctorName,
            start: new Date(savedEvent.start), 
            end: new Date(savedEvent.end),
            status: 'Scheduled', 
            theme: 'blue' 
        };
        setEvents(prev => [...prev, newEvent]);
        
        showToast('Appointment booked successfully!', 'success');
      }
      
      setModalOpen(false);
    } catch (error) {
        console.error("Error saving appointment", error);
        showToast('Failed to save appointment.', 'error');
    }
  };

  // --- 3. DRAG & DROP ---
  const moveEvent = useCallback(async ({ event, start, end, resourceId }) => {
    setEvents((prev) => {
      const existing = prev.find((ev) => ev.id === event.id);
      const filtered = prev.filter((ev) => ev.id !== event.id);
      return [...filtered, { ...existing, start, end, resourceId }];
    });

    try {
        await api.put(`/appointments/${event.id}`, {
            start, end, resourceId
        });
        showToast('Appointment moved.', 'success'); 
    } catch (error) {
        console.error("Failed to move event", error);
        showToast('Failed to move appointment.', 'error');
        fetchAllData(); 
    }
  }, [showToast, fetchAllData]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL OVERRIDE: Force Calendar Events to Allow Pointer Events */}
      <GlobalStyles styles={{
        '.rbc-event': { pointerEvents: 'initial !important' },
        '.rbc-event-content': { pointerEvents: 'initial !important' }
      }} />

      <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.DAY}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          resources={RESOURCES}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={moveEvent}
          resizable
          step={15}
          timeslots={4}
          
          components={{
            event: CustomEvent, 
            toolbar: (props) => <CustomToolbar {...props} onBook={handleOpenBooking} />
          }}
          style={{ height: '100%' }}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
          }}
        />
      </Box>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={selectedSlot}
        onSave={handleSaveAppointment}
        doctors={doctors}  
        patients={patients} 
        resources={RESOURCES}
      />
    </Box>
  );
}