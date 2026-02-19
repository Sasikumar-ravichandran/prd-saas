import React from 'react';
import { Box, Grid, Typography, Avatar, Chip, Stack, Button, IconButton, Divider, Paper, alpha } from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';
import PrintIcon from '@mui/icons-material/Print';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';

// Helper for Data Label-Value pairs
const DataField = ({ label, value, icon, color = 'text.primary' }) => (
  <Box>
    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Stack direction="row" alignItems="center" spacing={0.5}>
       {icon && <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>}
       <Typography variant="body2" fontWeight="700" color={color} sx={{ fontSize: '0.9rem' }}>
         {value || '-'}
       </Typography>
    </Stack>
  </Box>
);

export default function PatientHeader({ patient, onEdit }) {
  const { primaryColor } = useColorMode();
  const GenderIcon = patient.gender === 'Male' ? MaleIcon : FemaleIcon;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid #e2e8f0', 
        bgcolor: 'white',
        zIndex: 10,
        position: 'relative'
      }}
    >
      <Grid container divider={<Divider orientation="vertical" flexItem sx={{ borderColor: '#f1f5f9' }} />}>
        
        {/* COL 1: IDENTITY (30%) */}
        <Grid item xs={12} md={3.5} sx={{ p: 2.5 }}>
           <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar 
                src={patient.photo} 
                sx={{ 
                  width: 72, height: 72, 
                  bgcolor: alpha(primaryColor, 0.1), color: primaryColor,
                  fontWeight: '900', fontSize: 28,
                  border: `1px solid ${alpha(primaryColor, 0.2)}`
                }}
              >
                {patient.fullName[0]}
              </Avatar>
              <Box>
                 <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.1 }}>{patient.fullName}</Typography>
                    <IconButton size="small" onClick={onEdit} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', p: 0.5 }}>
                       <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                 </Stack>
                 <Chip 
                   label={patient.patientId} 
                   size="small" 
                   sx={{ mt: 0.8, height: 20, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                 />
                 <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Chip icon={<PhoneIcon sx={{ width: 14 }} />} label={patient.mobile} size="small" variant="outlined" sx={{ height: 24, borderRadius: 1 }} />
                    <IconButton size="small" href={`mailto:${patient.email}`}><EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></IconButton>
                 </Stack>
              </Box>
           </Box>
        </Grid>

        {/* COL 2: VITALS & DEMOGRAPHICS (25%) */}
        <Grid item xs={12} md={3} sx={{ p: 2.5 }}>
           <Grid container spacing={2}>
              <Grid item xs={6}>
                 <DataField label="Age / Gender" value={`${patient.age} Yrs / ${patient.gender}`} icon={<GenderIcon sx={{ fontSize: 16 }} />} />
              </Grid>
              <Grid item xs={6}>
                 <DataField label="Blood Group" value={patient?.bloodGroup} /> {/* Mock Data */}
              </Grid>
              <Grid item xs={6}>
                 <DataField label="Last Visit" value={patient.lastVisit} icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={6}>
                 <DataField label="Next Appointment" value="Not Scheduled" color="text.secondary" />
              </Grid>
           </Grid>
        </Grid>

        {/* COL 3: CLINICAL ALERTS (20%) */}
        <Grid item xs={12} md={2.5} sx={{ p: 2.5, bgcolor: patient.medicalConditions.length > 0 ? '#fffbfc' : 'transparent' }}>
           <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <WarningIcon color={patient.medicalConditions.length > 0 ? "error" : "disabled"} fontSize="small" />
              <Typography variant="caption" fontWeight="800" color="text.secondary">MEDICAL ALERTS</Typography>
           </Stack>
           
           <Stack spacing={0.8}>
              {patient.medicalConditions.length > 0 ? (
                 patient.medicalConditions.map((alert, i) => (
                    <Typography key={i} variant="body2" fontWeight="700" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       • {alert}
                    </Typography>
                 ))
              ) : (
                 <Typography variant="body2" color="text.secondary">No known allergies</Typography>
              )}
           </Stack>
        </Grid>

        {/* COL 4: ACTIONS & FINANCE (20%) */}
        <Grid item xs={12} md={3} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DataField label="Pending Dues" value={`₹ ${patient.balance}`} color={patient.balance > 0 ? '#c2410c' : 'success.main'} icon={<WalletIcon sx={{ fontSize: 16, color: patient.balance > 0 ? '#ea580c' : 'green' }} />} />
              <Button size="small" variant="text" sx={{ fontWeight: 'bold' }}>History</Button>
           </Box>

           <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<PrintIcon />} sx={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 700 }}>Print</Button>
              <Button fullWidth variant="contained" sx={{ bgcolor: primaryColor, fontWeight: 700 }}>Bill</Button>
           </Stack>
        </Grid>

      </Grid>
    </Paper>
  );
}