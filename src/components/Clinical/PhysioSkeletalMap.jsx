import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Divider } from '@mui/material';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import BoltIcon from '@mui/icons-material/Bolt'; // Spasm/Nerve
import PanToolIcon from '@mui/icons-material/PanTool'; // Stiffness
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'; // Pain

// Interactive Joints & Spine Segments
const HOTSPOTS = [
  { id: 'Cervical_Spine', cx: 150, cy: 80, r: 14, label: 'Neck (Cervical)' },
  { id: 'Thoracic_Spine', cx: 150, cy: 150, r: 16, label: 'Mid Back (Thoracic)' },
  { id: 'Lumbar_Spine', cx: 150, cy: 220, r: 16, label: 'Lower Back (Lumbar)' },
  
  { id: 'Left_Shoulder', cx: 90, cy: 100, r: 16, label: 'Left Shoulder' },
  { id: 'Right_Shoulder', cx: 210, cy: 100, r: 16, label: 'Right Shoulder' },
  
  { id: 'Left_Elbow', cx: 60, cy: 160, r: 14, label: 'Left Elbow' },
  { id: 'Right_Elbow', cx: 240, cy: 160, r: 14, label: 'Right Elbow' },
  
  { id: 'Left_Wrist', cx: 40, cy: 220, r: 12, label: 'Left Wrist' },
  { id: 'Right_Wrist', cx: 260, cy: 220, r: 12, label: 'Right Wrist' },
  
  { id: 'Left_Hip', cx: 130, cy: 260, r: 16, label: 'Left Hip' },
  { id: 'Right_Hip', cx: 170, cy: 260, r: 16, label: 'Right Hip' },
  
  { id: 'Left_Knee', cx: 100, cy: 350, r: 16, label: 'Left Knee' },
  { id: 'Right_Knee', cx: 200, cy: 350, r: 16, label: 'Right Knee' },
  
  { id: 'Left_Ankle', cx: 100, cy: 440, r: 14, label: 'Left Ankle' },
  { id: 'Right_Ankle', cx: 200, cy: 440, r: 14, label: 'Right Ankle' },
];

export default function PhysioSkeletalMap({ initialStates, tooltips, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleRegionClick = (e, spot) => {
    e.preventDefault();
    setSelectedRegion(spot);
    setMenuPosition({ top: e.clientY, left: e.clientX });
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRegion(null);
  };

  const handleMenuAction = (action, customValue = null) => {
    if (selectedRegion) {
      onAction(action, selectedRegion.id, customValue);
    }
    handleClose();
  };

  const getRegionColor = (regionId) => {
    const status = initialStates?.[regionId];
    if (!status) return 'rgba(255, 255, 255, 0.8)'; // Default
    
    const s = String(status).toLowerCase();
    
    // Treatment Plan Colors
    if (s === 'planned') return '#3b82f6'; 
    if (s === 'active') return '#f59e0b';  
    if (s === 'completed') return '#22c55e'; 
    
    // Physio Conditions
    if (s === 'pain') return '#ef4444'; // Red
    if (s === 'stiffness') return '#8b5cf6'; // Purple
    if (s === 'spasm') return '#eab308'; // Yellow/Orange
    
    return '#94a3b8'; 
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <svg viewBox="0 0 300 500" style={{ height: '95%', maxHeight: '550px', filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.08))' }}>
        
        {/* SKELETON BASE LINES */}
        <g stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" fill="none">
          {/* Spine */}
          <line x1="150" y1="65" x2="150" y2="240" />
          {/* Shoulders */}
          <line x1="90" y1="100" x2="210" y2="100" />
          {/* Arms */}
          <line x1="90" y1="100" x2="60" y2="160" />
          <line x1="60" y1="160" x2="40" y2="220" />
          <line x1="210" y1="100" x2="240" y2="160" />
          <line x1="240" y1="160" x2="260" y2="220" />
          {/* Legs */}
          <line x1="130" y1="260" x2="100" y2="350" />
          <line x1="100" y1="350" x2="100" y2="440" />
          <line x1="170" y1="260" x2="200" y2="350" />
          <line x1="200" y1="350" x2="200" y2="440" />
        </g>

        {/* Head & Pelvis Shapes */}
        <circle cx="150" cy="40" r="25" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
        <path d="M 120 240 Q 150 270 180 240 L 160 280 L 140 280 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" strokeLinejoin="round" />

        {/* INTERACTIVE JOINTS (HOTSPOTS) */}
        {HOTSPOTS.map((spot) => {
          const color = getRegionColor(spot.id);
          const tooltipText = tooltips?.[spot.id] || spot.label;

          return (
            <Tooltip title={tooltipText} placement="top" arrow key={spot.id}>
              <circle
                cx={spot.cx}
                cy={spot.cy}
                r={spot.r}
                fill={color}
                stroke={color === 'rgba(255, 255, 255, 0.8)' ? '#94a3b8' : 'white'}
                strokeWidth="3"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                onMouseEnter={(e) => e.target.setAttribute('r', spot.r + 3)}
                onMouseLeave={(e) => e.target.setAttribute('r', spot.r)}
                onClick={(e) => handleRegionClick(e, spot)}
              />
            </Tooltip>
          );
        })}
      </svg>

      {/* ACTION MENU */}
      <Menu
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 200, mt: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important', py: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="caption" fontWeight="800" color="text.secondary">
            {selectedRegion?.label.toUpperCase()}
          </Typography>
        </MenuItem>
        
        {/* Treatment Actions */}
        <MenuItem onClick={() => handleMenuAction('plan_treatment')} sx={{ py: 1.5 }}>
          <ListItemIcon><AddCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Plan Rehab / Tx" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('mark_completed')} sx={{ py: 1.5 }}>
          <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText primary="Mark Completed" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Physio Condition Actions */}
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Pain')} sx={{ py: 1.5 }}>
          <ListItemIcon><LocalHospitalIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Mark Pain (Red)" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Stiffness')} sx={{ py: 1.5 }}>
          <ListItemIcon><PanToolIcon fontSize="small" sx={{ color: '#8b5cf6' }} /></ListItemIcon>
          <ListItemText primary="Mark Stiffness" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Spasm')} sx={{ py: 1.5 }}>
          <ListItemIcon><BoltIcon fontSize="small" sx={{ color: '#eab308' }} /></ListItemIcon>
          <ListItemText primary="Mark Muscle Spasm" />
        </MenuItem>
        
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => handleMenuAction('clear')} sx={{ py: 1.5, color: '#ef4444' }}>
          <ListItemIcon><DeleteSweepIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Clear Condition" primaryTypographyProps={{ fontWeight: 700 }} />
        </MenuItem>
      </Menu>
    </Box>
  );
}