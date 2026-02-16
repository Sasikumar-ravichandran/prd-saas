import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Chip, Avatar, IconButton, Stack, 
  Divider, TextField, alpha, CircularProgress, Alert
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { dashboardService } from '../../api/services/dashboardService'; // API Service
import { useNavigate } from 'react-router-dom';

// Icons
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import SaveIcon from '@mui/icons-material/Save';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// --- SUB-COMPONENTS ---

const VitalTag = ({ label, value, alert, primaryColor }) => (
  <Box sx={{ 
    display: 'flex', alignItems: 'center', gap: 1.5, 
    px: 2, py: 1.5, borderRadius: 2, 
    bgcolor: alert ? '#fef2f2' : '#f8fafc', 
    border: '1px solid', borderColor: alert ? '#fecaca' : '#e2e8f0'
  }}>
    <Box sx={{ color: alert ? '#ef4444' : primaryColor }}>
      {alert ? <WarningIcon fontSize="small" /> : <MonitorHeartIcon fontSize="small" />}
    </Box>
    <Box>
      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ lineHeight: 1, display: 'block' }}>{label}</Typography>
      <Typography variant="body2" fontWeight="800" color={alert ? '#b91c1c' : '#0f172a'}>{value}</Typography>
    </Box>
  </Box>
);

const TimelineCard = ({ item, primaryColor }) => {
  const isNow = item.status === 'now';
  return (
    <Box sx={{ display: 'flex', position: 'relative', mb: 0 }}>
      <Box sx={{ width: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
        <Typography variant="caption" fontWeight="bold" sx={{ color: isNow ? primaryColor : '#94a3b8' }}>{item.time}</Typography>
        <Box sx={{ width: 2, flex: 1, bgcolor: isNow ? primaryColor : '#f1f5f9', my: 0.5, borderRadius: 1 }} />
      </Box>
      
      <Paper elevation={0} sx={{ 
          flex: 1, mb: 2, p: 2, borderRadius: 2.5, 
          border: '1px solid',
          borderColor: isNow ? primaryColor : '#e2e8f0',
          bgcolor: isNow ? alpha(primaryColor, 0.04) : 'white',
          opacity: item.status === 'pending' ? 0.7 : 1
        }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <Box>
             <Typography variant="body2" fontWeight="800" color="#0f172a">{item.name}</Typography>
             <Typography variant="caption" fontWeight="600" color="text.secondary">{item.type}</Typography>
           </Box>
           {isNow && <Chip label="In Chair" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: primaryColor, color: 'white' }} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default function DoctorDashboard() {
  const { primaryColor } = useColorMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // 1. Fetch Real Data
  useEffect(() => {
    const loadData = async () => {
        try {
            const res = await dashboardService.getDoctorData();
            setData(res);
        } catch (err) {
            console.error("Failed to load doctor dashboard");
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const handlePatientClick = () => {
      if (data?.activePatient?.id) {
          navigate(`/patients/${data.activePatient.id}`);
      }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!data) return <Box sx={{ p: 5 }}><Alert severity="error">Failed to load station.</Alert></Box>;

  const { activePatient, viewMode } = data;

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: 'calc(100vh - 100px)', p: 3 }}>
      
      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: primaryColor }}>Clinical Station</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="600">Dr. {data.doctorName} • General Dentistry</Typography>
        </Box>
        <Button variant="outlined" startIcon={<HistoryIcon />} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
          My History
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* === LEFT: PATIENT CONTEXT === */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            
            {/* 1. ACTIVE PATIENT HERO CARD */}
            {activePatient ? (
                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 3, bgcolor: 'white', display: 'flex', gap: 3 }}>
                    <Avatar sx={{ width: 88, height: 88, borderRadius: 3, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontSize: 32, fontWeight: '800' }}>
                        {activePatient.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    <Chip label={activePatient.pid} size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: '700', fontSize: '0.7rem' }} />
                                    <Chip label={`${activePatient.gender}, ${activePatient.age}`} size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: '700', fontSize: '0.7rem' }} />
                                    {viewMode === 'idle' && <Chip label="UP NEXT" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />}
                                </Stack>
                                <Typography variant="h3" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>{activePatient.name}</Typography>
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={handlePatientClick}
                                startIcon={<MedicalServicesIcon />} 
                                sx={{ bgcolor: primaryColor, px: 3, borderRadius: 2, fontWeight: 'bold' }}
                            >
                                {viewMode === 'active' ? 'Open Chart' : 'Start Session'}
                            </Button>
                        </Box>
                        
                        <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
                            {activePatient.conditions.length > 0 ? (
                                <VitalTag label="CONDITIONS" value={activePatient.conditions.join(', ')} alert primaryColor={primaryColor} />
                            ) : (
                                <VitalTag label="CONDITIONS" value="None" primaryColor={primaryColor} />
                            )}
                            <VitalTag label="VISIT TYPE" value={viewMode === 'active' ? 'Treatment' : 'Consultation'} primaryColor={primaryColor} />
                        </Stack>
                    </Box>
                </Box>

                <Divider />

                {/* Clinical Focus */}
                <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>CHIEF COMPLAINT</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ mt: 1, color: '#334155', lineHeight: 1.4 }}>
                        {activePatient.complaint || "No primary concern recorded."}
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>NOTES</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ mt: 1, color: primaryColor, fontSize: '1rem' }}>
                        {activePatient.notes}
                        </Typography>
                    </Box>
                </Box>
                </Paper>
            ) : (
                <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                    <AccessTimeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">No Active Patients</Typography>
                    <Typography variant="body2" color="text.secondary">You have no appointments scheduled right now.</Typography>
                </Paper>
            )}

            {/* 2. RECENT HISTORY */}
            {data.history && data.history.length > 0 && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" fontWeight="800" mb={2}>Recent History</Typography>
                    {data.history.map((h, i) => (
                        <Box key={i} sx={{ p: 1.5, mb: 1, border: '1px solid #f1f5f9', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="700">{h.procedure}</Typography>
                            <Typography variant="caption" fontWeight="700" color="text.secondary">
                                {new Date(h.date).toLocaleDateString()}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            )}

          </Stack>
        </Grid>

        {/* === RIGHT: SIDEBAR === */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            
            {/* 1. TIMELINE */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                 <Typography variant="subtitle2" fontWeight="800">Today's Schedule</Typography>
                 <Chip label={`${data.schedule.length} Total`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
               </Box>
               <Box>
                 {data.schedule.length === 0 && <Typography variant="caption" color="text.secondary">No appointments.</Typography>}
                 {data.schedule.map((item, i) => <TimelineCard key={i} item={item} primaryColor={primaryColor} />)}
               </Box>
            </Paper>

            {/* 2. SCRATCHPAD */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#fefce8' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                 <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#854d0e' }}>Scratchpad</Typography>
                 <IconButton size="small"><SaveIcon fontSize="small" sx={{ color: '#854d0e' }} /></IconButton>
               </Box>
               <TextField 
                 fullWidth multiline rows={4} 
                 placeholder="Type quick notes here..." 
                 variant="standard" 
                 InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem', lineHeight: 1.4 } }}
               />
            </Paper>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}