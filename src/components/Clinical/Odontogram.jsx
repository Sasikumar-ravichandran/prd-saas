import React, { useState } from 'react';
import { Box, Typography, Stack, Popover, Button, Divider } from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';

// Icons
import CoronavirusIcon from '@mui/icons-material/Coronavirus'; 
import EngineeringIcon from '@mui/icons-material/Engineering'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; 
import ClearIcon from '@mui/icons-material/Clear';

// --- CONSTANTS ---
const Q1 = [18, 17, 16, 15, 14, 13, 12, 11]; 
const Q2 = [21, 22, 23, 24, 25, 26, 27, 28];
const Q4 = [48, 47, 46, 45, 44, 43, 42, 41];
const Q3 = [31, 32, 33, 34, 35, 36, 37, 38];

const STATUS_CONFIG = {
  healthy:   { border: '#e2e8f0', bg: 'white', icon: null },
  decayed:   { border: '#ef4444', bg: '#fef2f2', icon: <CoronavirusIcon sx={{ fontSize: 14, color: '#ef4444' }} /> },
  planned:   { border: '#3b82f6', bg: '#eff6ff', icon: <EngineeringIcon sx={{ fontSize: 14, color: '#3b82f6' }} /> },
  completed: { border: '#22c55e', bg: '#f0fdf4', icon: <CheckCircleIcon sx={{ fontSize: 14, color: '#22c55e' }} /> },
  missing:   { border: '#cbd5e1', bg: '#f1f5f9', icon: <VisibilityOffIcon sx={{ fontSize: 14, color: '#94a3b8' }} />, opacity: 0.5 },
};

const Tooth = ({ id, status = 'healthy', onClick, primaryColor, jaw }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;
  const isMissing = status === 'missing';

  return (
    <Box 
      onClick={(e) => onClick(e, id)}
      sx={{
        width: { xs: 35, md: 48 }, height: { xs: 45, md: 65 }, 
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        bgcolor: config.bg,
        border: isMissing ? `1px dashed ${config.border}` : `1px solid ${config.border}`,
        borderBottomWidth: jaw === 'upper' ? 4 : 1, borderTopWidth: jaw === 'lower' ? 4 : 1,
        borderRadius: jaw === 'upper' ? '6px 6px 20px 20px' : '20px 20px 6px 6px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'transform 0.2s', opacity: isMissing ? 0.6 : 1,
        '&:hover': { transform: 'scale(1.1)', borderColor: primaryColor, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
      }}
    >
      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{id}</Typography>
      {config.icon && (<Box sx={{ position: 'absolute', bottom: jaw === 'upper' ? 6 : 'auto', top: jaw === 'lower' ? 6 : 'auto' }}>{config.icon}</Box>)}
    </Box>
  );
};

// --- UPDATED COMPONENT ---
export default function Odontogram({ initialStates = {}, onAction }) { // Changed prop to onAction
  const { primaryColor } = useColorMode();
  
  // Local state for Visuals
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTooth, setActiveTooth] = useState(null);

  const handleToothClick = (event, id) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveTooth(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveTooth(null);
  };

  // --- SMART ACTION HANDLER ---
  const handleMenuAction = (actionType) => {
    if (activeTooth && onAction) {
        // Send the event to the parent (PatientProfile)
        onAction(actionType, activeTooth);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);

  const renderQuadrant = (teeth, jaw) => (
    <Stack direction="row" spacing={0.5}> 
      {teeth.map(id => (
        <Tooth 
            key={id} id={id} 
            status={initialStates[id]} // Use props for state now, controlled by parent
            onClick={handleToothClick} primaryColor={primaryColor} jaw={jaw} 
        />
      ))}
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, px: 10 }}>
      
      <Box sx={{ mb: 6, position: 'relative' }}> 
          <Typography variant="overline" sx={{ position: 'absolute', left: -80, top: '40%', color: '#94a3b8', fontWeight: 'bold', display: { xs: 'none', lg: 'block' } }}>MAXILLARY</Typography>
          <Stack direction="row" spacing={6} justifyContent="center"> 
              <Box sx={{ textAlign: 'right' }}>{renderQuadrant(Q1, 'upper')}</Box>
              <Box>{renderQuadrant(Q2, 'upper')}</Box>
          </Stack>
      </Box>

      <Box sx={{ mt: 2, position: 'relative' }}>
          <Typography variant="overline" sx={{ position: 'absolute', left: -90, top: '40%', color: '#94a3b8', fontWeight: 'bold', display: { xs: 'none', lg: 'block' } }}>MANDIBULAR</Typography>
          <Stack direction="row" spacing={6} justifyContent="center">
              <Box sx={{ textAlign: 'right' }}>{renderQuadrant(Q4, 'lower')}</Box>
              <Box>{renderQuadrant(Q3, 'lower')}</Box>
          </Stack>
      </Box>

      <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'center', horizontal: 'center' }} transformOrigin={{ vertical: 'center', horizontal: 'center' }} PaperProps={{ sx: { p: 1, width: 180, borderRadius: 3 } }}>
        <Typography variant="caption" align="center" display="block" color="text.secondary" fontWeight="bold" sx={{ mb: 1 }}>TOOTH #{activeTooth}</Typography>
        <Stack spacing={1}>
            {/* ACTIONS EMIT EVENTS NOW */}
            <Button size="small" variant="outlined" color="primary" startIcon={<EngineeringIcon />} onClick={() => handleMenuAction('plan_treatment')} sx={{ justifyContent: 'flex-start' }}>Plan Treatment</Button>
            <Button size="small" variant="outlined" color="error" startIcon={<CoronavirusIcon />} onClick={() => handleMenuAction('mark_decay')} sx={{ justifyContent: 'flex-start' }}>Mark Decay</Button>
            <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleMenuAction('mark_completed')} sx={{ justifyContent: 'flex-start' }}>Mark Completed</Button>
            <Button size="small" variant="outlined" color="inherit" startIcon={<VisibilityOffIcon />} onClick={() => handleMenuAction('mark_missing')} sx={{ justifyContent: 'flex-start', color: 'text.secondary', borderColor: '#e2e8f0' }}>Missing</Button>
            <Divider />
            <Button size="small" color="inherit" startIcon={<ClearIcon />} onClick={() => handleMenuAction('clear')} sx={{ justifyContent: 'flex-start', color: '#64748b' }}>Clear Status</Button>
        </Stack>
      </Popover>

    </Box>
  );
}