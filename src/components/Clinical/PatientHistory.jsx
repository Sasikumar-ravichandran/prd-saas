import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Chip, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, IconButton, 
  CircularProgress, MenuItem
} from '@mui/material';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HealingIcon from '@mui/icons-material/Healing';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import moment from 'moment';
import { useToast } from '../../context/ToastContext';
import { clinicalNoteService } from '../../api/services/clinicalNoteService'; // ⚡️ Import Service

// --- 1. MEDICAL ALERTS CARD (Connected) ---
const MedicalAlerts = ({ patient, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [conditions, setConditions] = useState(patient?.medicalConditions || []);
  const [allergies, setAllergies] = useState(patient?.allergies || "");
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
        await clinicalNoteService.updateAlerts(patient._id, { 
            medicalConditions: conditions, 
            allergies 
        });
        showToast('Medical alerts updated', 'success');
        onUpdate(); // Refresh parent data
        setEditing(false);
    } catch(e) { 
        showToast('Failed to update alerts', 'error');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fff5f5' }}>
       <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
             <WarningAmberIcon color="error" />
             <Typography variant="h6" fontWeight="800" color="#991b1b">Medical Alerts</Typography>
          </Stack>
          <IconButton size="small" onClick={() => setEditing(!editing)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' } }}>
             <EditIcon fontSize="small" color="error" />
          </IconButton>
       </Stack>

       {editing ? (
         <Stack spacing={2}>
            <TextField 
              label="Medical Conditions (Comma separated)" 
              fullWidth size="small" 
              value={conditions.join(', ')} 
              onChange={(e) => setConditions(e.target.value.split(','))} 
              helperText="e.g. Diabetes, High BP, Asthma"
              sx={{ bgcolor: 'white' }}
            />
            <TextField 
              label="Allergies" 
              fullWidth size="small" 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)} 
              sx={{ bgcolor: 'white' }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="contained" color="error" size="small" onClick={handleSave}>Save Alerts</Button>
            </Stack>
         </Stack>
       ) : (
         <>
           <Box mb={2}>
             <Typography variant="caption" fontWeight="bold" color="#7f1d1d" display="block" mb={0.5}>CONDITIONS</Typography>
             <Stack direction="row" spacing={1} flexWrap="wrap">
                {conditions.length > 0 && conditions[0] !== 'None' && conditions[0] !== '' ? (
                    conditions.map((c, i) => <Chip key={i} label={c.trim()} sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold', border: '1px solid #fca5a5' }} size="small" />)
                ) : <Typography variant="body2" color="text.secondary">No known conditions.</Typography>}
             </Stack>
           </Box>
           <Box>
             <Typography variant="caption" fontWeight="bold" color="#7f1d1d" display="block" mb={0.5}>ALLERGIES</Typography>
             <Typography variant="body2" fontWeight="600" color="#ef4444">{allergies || "No known allergies"}</Typography>
           </Box>
         </>
       )}
    </Paper>
  );
};

// --- 2. VISIT TIMELINE (Connected) ---
export default function PatientHistory({ patient, onRefresh }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const { showToast } = useToast();

  // Fetch Clinical Notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
        const data = await clinicalNoteService.getNotesByPatient(patient._id);
        setNotes(data);
    } catch (error) {
        showToast('Could not load history', 'error');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { 
      if(patient?._id) fetchNotes(); 
  }, [patient]);

  const handleNoteAdded = () => {
      fetchNotes(); // Reload timeline
      setOpenNoteModal(false);
  };

  const handleDeleteNote = async (id) => {
      if(!window.confirm("Delete this clinical note?")) return;
      try {
          await clinicalNoteService.deleteNote(id);
          setNotes(prev => prev.filter(n => n._id !== id));
          showToast('Note deleted', 'success');
      } catch (error) {
          showToast('Failed to delete', 'error');
      }
  }

  // Helper to choose icon color based on note type
  const getTypeColor = (type) => {
      switch(type) {
          case 'Procedure': return '#3b82f6'; // Blue
          case 'Emergency': return '#ef4444'; // Red
          case 'Follow-up': return '#10b981'; // Green
          default: return '#64748b'; // Gray
      }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 3, alignItems: 'flex-start' }}>
       
       {/* LEFT COLUMN: Alerts & Summary */}
       <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
          <MedicalAlerts patient={patient} onUpdate={onRefresh} />
          
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
             <Typography variant="subtitle2" fontWeight="800" mb={2} color="#0f172a">Quick Stats</Typography>
             <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                   <Typography variant="body2" color="text.secondary">First Visit</Typography>
                   <Typography variant="body2" fontWeight="600">
                       {notes.length > 0 ? moment(notes[notes.length-1].visitDate).format('MMM D, YYYY') : 'N/A'}
                   </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                   <Typography variant="body2" color="text.secondary">Last Visit</Typography>
                   <Typography variant="body2" fontWeight="600">{moment().format('MMM D, YYYY')}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                   <Typography variant="body2" color="text.secondary">Total Notes</Typography>
                   <Typography variant="body2" fontWeight="600">{notes.length}</Typography>
                </Stack>
             </Stack>
          </Paper>
       </Box>

       {/* RIGHT COLUMN: The Timeline */}
       <Box sx={{ flex: 1, width: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6" fontWeight="800" color="#0f172a">Clinical Timeline</Typography>
             <Button 
                startIcon={<NoteAddIcon />} 
                variant="contained" 
                onClick={() => setOpenNoteModal(true)}
                sx={{ bgcolor: '#0f172a', fontWeight: 'bold', borderRadius: 2 }}
             >
                Add Note
             </Button>
          </Stack>

          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
          ) : notes.length === 0 ? (
             <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                 <Typography color="text.secondary">No clinical notes recorded yet.</Typography>
             </Paper>
          ) : (
             <Timeline position="right" sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }}>
                {notes.map((note) => (
                    <TimelineItem key={note._id}>
                    <TimelineSeparator>
                        <TimelineDot sx={{ bgcolor: getTypeColor(note.type), boxShadow: 'none' }}>
                            {note.type === 'Emergency' ? <HealingIcon sx={{ fontSize: 16 }} /> : 
                             note.type === 'Procedure' ? <LocalHospitalIcon sx={{ fontSize: 16 }} /> : 
                             <MedicalServicesIcon sx={{ fontSize: 16 }} />}
                        </TimelineDot>
                        <TimelineConnector sx={{ bgcolor: '#e2e8f0' }} />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', '&:hover .delete-btn': { opacity: 1 } }}>
                            <Stack direction="row" justifyContent="space-between" mb={1} alignItems="flex-start">
                                <Box>
                                <Typography variant="subtitle2" fontWeight="800" color="#1e293b">
                                    {moment(note.visitDate).format('MMMM Do, YYYY')}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        Dr. {note.doctorName || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: getTypeColor(note.type), bgcolor: `${getTypeColor(note.type)}15`, px: 0.8, py: 0.2, borderRadius: 1, fontWeight: 'bold' }}>
                                        {note.type}
                                    </Typography>
                                </Stack>
                                </Box>
                                
                                <Stack direction="row" spacing={1}>
                                    {note.tags && note.tags.map(t => <Chip key={t} label={t} size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: 600, height: 20, fontSize: '0.65rem' }} />)}
                                    <IconButton size="small" className="delete-btn" sx={{ opacity: 0, transition: '0.2s', color: '#cbd5e1', '&:hover': { color: '#ef4444' } }} onClick={() => handleDeleteNote(note._id)}>
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                            <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                {note.content}
                            </Typography>
                        </Paper>
                    </TimelineContent>
                    </TimelineItem>
                ))}
             </Timeline>
          )}
       </Box>

       {/* ADD NOTE MODAL */}
       <AddNoteModal 
         open={openNoteModal} 
         onClose={() => setOpenNoteModal(false)} 
         patientId={patient._id} 
         onSuccess={handleNoteAdded} 
       />
    </Box>
  );
}

// --- 3. ADD NOTE MODAL (Connected) ---
const AddNoteModal = ({ open, onClose, patientId, onSuccess }) => {
    const [formData, setFormData] = useState({ type: 'Consultation', content: '', tags: '' });
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if(!formData.content.trim()) return;
        
        setSubmitting(true);
        try {
            await clinicalNoteService.createNote({
                patientId,
                content: formData.content,
                type: formData.type,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                visitDate: new Date()
            });
            showToast('Note added', 'success');
            setFormData({ type: 'Consultation', content: '', tags: '' }); // Reset
            onSuccess();
        } catch (error) {
            showToast('Failed to add note', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #f1f5f9' }}>Add Clinical Note</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={2} mt={1}>
                    <TextField 
                        select 
                        label="Visit Type" 
                        size="small" 
                        fullWidth 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        {['Consultation', 'Procedure', 'Follow-up', 'Emergency'].map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </TextField>

                    <TextField 
                        label="Clinical Observations / Procedure Notes" 
                        multiline 
                        rows={4} 
                        fullWidth 
                        placeholder="e.g. Patient complained of sensitivity in upper right quadrant..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />

                    <TextField 
                        label="Tags (comma separated)" 
                        fullWidth 
                        size="small" 
                        placeholder="e.g. Scaling, Pain, Rx" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={submitting || !formData.content}
                    sx={{ bgcolor: '#0f172a', fontWeight: 'bold' }}
                >
                    {submitting ? 'Saving...' : 'Save Note'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}