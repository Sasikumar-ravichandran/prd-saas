import React from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Chip, Avatar, IconButton, Stack, 
  Divider, TextField, alpha
} from '@mui/material';

// 1. IMPORT THEME HOOK
import { useColorMode } from '../../context/ThemeContext';

// Icons
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import BiotechIcon from '@mui/icons-material/Biotech';
import SaveIcon from '@mui/icons-material/Save';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

// --- MOCK DATA ---
const SCHEDULE = [
  { time: '10:00', name: 'Ravi Kumar', type: 'Root Canal (Active)', status: 'now' },
  { time: '10:45', name: 'Anita Raj', type: 'Cleaning', status: 'next' },
  { time: '11:15', name: 'Suresh B', type: 'Consultation', status: 'pending' },
  { time: '11:30', name: 'Meena K', type: 'Extraction', status: 'pending' },
];

// --- SUB-COMPONENTS ---

// 1. Vital Tag (Updated to use Primary Color for icons)
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

// 2. Timeline Card (Updated to reflect Active Status color)
const TimelineCard = ({ item, primaryColor }) => {
  const isNow = item.status === 'now';
  const isNext = item.status === 'next';

  return (
    <Box sx={{ display: 'flex', position: 'relative', mb: 0 }}>
      {/* Time Column */}
      <Box sx={{ width: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
        <Typography variant="caption" fontWeight="bold" sx={{ color: isNow ? primaryColor : '#94a3b8' }}>{item.time}</Typography>
        {/* Vertical Line */}
        <Box sx={{ width: 2, flex: 1, bgcolor: isNow ? primaryColor : '#f1f5f9', my: 0.5, borderRadius: 1 }} />
      </Box>
      
      {/* Card Content */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1, mb: 2, p: 2, borderRadius: 2.5, 
          border: '1px solid',
          borderColor: isNow ? primaryColor : isNext ? '#e2e8f0' : 'transparent',
          bgcolor: isNow ? alpha(primaryColor, 0.04) : isNext ? 'white' : 'transparent',
          opacity: item.status === 'pending' ? 0.7 : 1,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <Box>
             <Typography variant="body2" fontWeight="800" color="#0f172a">{item.name}</Typography>
             <Typography variant="caption" fontWeight="600" color="text.secondary">{item.type}</Typography>
           </Box>
           {isNow && <Chip label="In Chair" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: primaryColor, color: 'white' }} />}
           {isNext && <Chip label="Next" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: '#f1f5f9' }} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default function DoctorDashboard() {
  // 2. GET GLOBAL COLOR
  const { primaryColor } = useColorMode();

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: 'calc(100vh - 100px)', p: 3, mx: -3, my: -3 }}>
      
      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {/* Dynamic Color Title */}
          <Typography variant="h5" fontWeight="900" sx={{ color: primaryColor }}>Clinical Station</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="600">Dr. Ramesh • General Dentistry</Typography>
        </Box>
        <Button variant="outlined" startIcon={<HistoryIcon />} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
          View History
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* === LEFT: PATIENT CONTEXT === */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            
            {/* 1. ACTIVE PATIENT HERO CARD */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              
              {/* Top Section: Identity */}
              <Box sx={{ p: 3, bgcolor: 'white', display: 'flex', gap: 3 }}>
                 {/* Dynamic Avatar Color */}
                 <Avatar sx={{ width: 88, height: 88, borderRadius: 3, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontSize: 32, fontWeight: '800' }}>RK</Avatar>
                 <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <Box>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                             <Chip label="PID: 1024" size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: '700', fontSize: '0.7rem' }} />
                             <Chip label="Male, 34" size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: '700', fontSize: '0.7rem' }} />
                          </Stack>
                          <Typography variant="h3" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>Ravi Kumar</Typography>
                       </Box>
                       {/* Dynamic Action Button */}
                       <Button variant="contained" size="large" startIcon={<MedicalServicesIcon />} sx={{ bgcolor: primaryColor, px: 3, borderRadius: 2, fontWeight: 'bold' }}>
                         Start Session
                       </Button>
                    </Box>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                       <VitalTag label="ALLERGIES" value="Penicillin" alert primaryColor={primaryColor} />
                       <VitalTag label="CONDITION" value="Diabetic (Type 2)" alert primaryColor={primaryColor} />
                       <VitalTag label="BP (Today)" value="142 / 90" primaryColor={primaryColor} />
                       <VitalTag label="LAST VISIT" value="12 Oct '24" primaryColor={primaryColor} />
                    </Stack>
                 </Box>
              </Box>

              <Divider />

              {/* Bottom Section: Clinical Focus */}
              <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', gap: 4 }}>
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>CHIEF COMPLAINT</Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ mt: 1, color: '#334155', lineHeight: 1.4 }}>
                      "I have a severe throbbing pain in my lower right back tooth since last night."
                    </Typography>
                 </Box>
                 <Divider orientation="vertical" flexItem />
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>DIAGNOSIS (PROVISIONAL)</Typography>
                    {/* Dynamic Diagnosis Text */}
                    <Typography variant="h6" fontWeight="700" sx={{ mt: 1, color: primaryColor }}>
                      Irreversible Pulpitis w/ Apical Periodontitis (Tooth #46)
                    </Typography>
                 </Box>
              </Box>
            </Paper>

            {/* 2. PREVIOUS TREATMENT & LAB */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                 <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                       <Typography variant="subtitle2" fontWeight="800">Recent Treatments</Typography>
                       <Chip label="2 Records" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                    </Box>
                    <Box sx={{ p: 1.5, mb: 1.5, border: '1px solid #f1f5f9', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, width: 32, height: 32 }}><LocalPharmacyIcon fontSize="small" /></Avatar>
                          <Box>
                             <Typography variant="body2" fontWeight="700">Cleaning & Polishing</Typography>
                             <Typography variant="caption" color="text.secondary">Dr. Ramesh • Full Mouth</Typography>
                          </Box>
                       </Box>
                       <Typography variant="caption" fontWeight="700" color="text.secondary">12 Oct 2024</Typography>
                    </Box>
                 </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                 <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', bgcolor: '#fffbeb' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, color: '#b45309' }}>
                       <BiotechIcon fontSize="small" />
                       <Typography variant="subtitle2" fontWeight="800">Lab Status</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="700" color="#1e293b">Zirconia Crown (#46)</Typography>
                    <Typography variant="caption" fontWeight="600" color="#92400e">Sent: Yesterday</Typography>
                 </Paper>
              </Grid>
            </Grid>

          </Stack>
        </Grid>

        {/* === RIGHT: SIDEBAR TOOLS === */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            
            {/* 1. TIMELINE WIDGET */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                 <Typography variant="subtitle2" fontWeight="800">Today's Schedule</Typography>
                 <Chip label="4 Total" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
               </Box>
               <Box>
                 {SCHEDULE.map((item, i) => <TimelineCard key={i} item={item} primaryColor={primaryColor} />)}
               </Box>
               <Button fullWidth variant="outlined" size="small" sx={{ mt: 1, borderColor: '#e2e8f0', color: '#64748b' }}>
                 View Full Calendar
               </Button>
            </Paper>

            {/* 2. QUICK NOTES PAD */}
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