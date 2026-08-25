import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Divider, Button, Stack } from '@mui/material';

// Icons for the Menu
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HealingIcon from '@mui/icons-material/Healing';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// Expanded Hotspots covering the FULL BODY
const FULL_BODY_HOTSPOTS = [
  // Head & Neck
  { id: 'Forehead', cx: 150, cy: 35, r: 14, view: 'front' },
  { id: 'Face_Cheeks', cx: 150, cy: 70, r: 16, view: 'front' },
  { id: 'Chin', cx: 150, cy: 100, r: 12, view: 'front' },
  { id: 'Neck', cx: 150, cy: 125, r: 14, view: 'front' },

  // Upper Torso (Front)
  { id: 'Chest', cx: 150, cy: 175, r: 22, view: 'front' },
  { id: 'Abdomen', cx: 150, cy: 235, r: 22, view: 'front' },

  // Upper Limbs (Front)
  { id: 'Left_Shoulder', cx: 95, cy: 150, r: 16, view: 'front' },
  { id: 'Right_Shoulder', cx: 205, cy: 150, r: 16, view: 'front' },
  { id: 'Left_Arm', cx: 75, cy: 210, r: 16, view: 'front' },
  { id: 'Right_Arm', cx: 225, cy: 210, r: 16, view: 'front' },
  { id: 'Left_Hand', cx: 60, cy: 290, r: 14, view: 'front' },
  { id: 'Right_Hand', cx: 240, cy: 290, r: 14, view: 'front' },

  // Lower Limbs (Front)
  { id: 'Left_Thigh', cx: 130, cy: 320, r: 18, view: 'front' },
  { id: 'Right_Thigh', cx: 170, cy: 320, r: 18, view: 'front' },
  { id: 'Left_Knee_Shin', cx: 130, cy: 390, r: 16, view: 'front' },
  { id: 'Right_Knee_Shin', cx: 170, cy: 390, r: 16, view: 'front' },
  { id: 'Left_Foot', cx: 125, cy: 465, r: 14, view: 'front' },
  { id: 'Right_Foot', cx: 175, cy: 465, r: 14, view: 'front' },

  // Back View Hotspots
  { id: 'Upper_Back', cx: 150, cy: 175, r: 24, view: 'back' },
  { id: 'Lower_Back', cx: 150, cy: 235, r: 22, view: 'back' },
  { id: 'Back_of_Head_Neck', cx: 150, cy: 60, r: 18, view: 'back' },
  { id: 'Left_Back_Arm', cx: 75, cy: 210, r: 16, view: 'back' },
  { id: 'Right_Back_Arm', cx: 225, cy: 210, r: 16, view: 'back' },
  { id: 'Left_Glute', cx: 130, cy: 300, r: 18, view: 'back' },
  { id: 'Right_Glute', cx: 170, cy: 300, r: 18, view: 'back' },
  { id: 'Left_Calf', cx: 130, cy: 390, r: 16, view: 'back' },
  { id: 'Right_Calf', cx: 170, cy: 390, r: 16, view: 'back' }
];

export default function DermaBodyMap({ initialStates, tooltips, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [currentView, setCurrentView] = useState('front'); // 'front' or 'back'
  
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleRegionClick = (e, regionId) => {
    e.preventDefault();
    setSelectedRegion(regionId);
    setMenuPosition({ top: e.clientY, left: e.clientX });
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRegion(null);
  };

  const handleMenuAction = (action, customValue = null) => {
    if (selectedRegion) {
      onAction(action, selectedRegion, customValue);
    }
    handleClose();
  };

  const getRegionColor = (regionId) => {
    const status = initialStates?.[regionId];
    if (!status) return 'rgba(255, 255, 255, 0.5)'; 
    
    const s = String(status).toLowerCase();
    
    if (s === 'planned') return '#3b82f6'; // Blue
    if (s === 'active') return '#f59e0b';  // Orange
    if (s === 'completed') return '#22c55e'; // Green
    if (s === 'acne') return '#ef4444'; // Red
    if (s === 'pigmentation') return '#8b5cf6'; // Purple
    if (s === 'lesion') return '#be123c'; // Dark Red
    
    return '#94a3b8'; 
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Front / Back Toggle Switch */}
      <Stack direction="row" spacing={1} mb={1}>
        <Button 
          size="small" 
          variant={currentView === 'front' ? 'contained' : 'outlined'} 
          onClick={() => setCurrentView('front')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Front View
        </Button>
        <Button 
          size="small" 
          variant={currentView === 'back' ? 'contained' : 'outlined'} 
          onClick={() => setCurrentView('back')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Back View
        </Button>
      </Stack>

      {/* The Full Body Interactive SVG Map */}
      <svg 
        viewBox="0 0 300 500" 
        style={{ height: '82%', maxHeight: '480px', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.05))' }}
      >
        {currentView === 'front' ? (
          /* FRONT VIEW OUTLINE */
          <g stroke="#cbd5e1" strokeWidth="2.5" fill="#f8fafc">
            {/* Head */}
            <ellipse cx="150" cy="55" rx="35" ry="42" />
            {/* Neck */}
            <rect x="138" y="95" width="24" height="35" rx="4" />
            {/* Torso */}
            <path d="M 105 130 Q 150 120 195 130 L 190 270 L 110 270 Z" />
            {/* Arms */}
            <path d="M 100 135 L 65 210 L 55 285 L 75 285 L 85 210 L 105 145 Z" />
            <path d="M 200 135 L 235 210 L 245 285 L 225 285 L 215 210 L 195 145 Z" />
            {/* Legs */}
            <path d="M 115 270 L 110 440 L 140 440 L 145 270 Z" />
            <path d="M 185 270 L 190 440 L 160 440 L 155 270 Z" />
            {/* Feet */}
            <path d="M 110 440 L 90 470 L 140 470 Z" />
            <path d="M 190 440 L 210 470 L 160 470 Z" />
          </g>
        ) : (
          /* BACK VIEW OUTLINE */
          <g stroke="#cbd5e1" strokeWidth="2.5" fill="#f8fafc">
            {/* Head */}
            <ellipse cx="150" cy="55" rx="35" ry="42" />
            {/* Neck */}
            <rect x="138" y="95" width="24" height="35" rx="4" />
            {/* Torso / Back */}
            <path d="M 105 130 Q 150 120 195 130 L 190 270 L 110 270 Z" />
            {/* Arms */}
            <path d="M 100 135 L 65 210 L 55 285 L 75 285 L 85 210 L 105 145 Z" />
            <path d="M 200 135 L 235 210 L 245 285 L 225 285 L 215 210 L 195 145 Z" />
            {/* Legs / Glutes / Calves */}
            <path d="M 115 270 L 110 440 L 140 440 L 145 270 Z" />
            <path d="M 185 270 L 190 440 L 160 440 L 155 270 Z" />
          </g>
        )}

        {/* Dynamic Hotspots Filtered by Current View */}
        {FULL_BODY_HOTSPOTS.filter(spot => spot.view === currentView).map((spot) => {
          const color = getRegionColor(spot.id);
          const tooltipText = tooltips?.[spot.id] || spot.id.replace(/_/g, ' ');

          return (
            <Tooltip title={tooltipText} placement="top" arrow key={spot.id}>
              <circle
                cx={spot.cx}
                cy={spot.cy}
                r={spot.r}
                fill={color}
                stroke={color === 'rgba(255, 255, 255, 0.5)' ? '#94a3b8' : 'white'}
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                onMouseEnter={(e) => e.target.setAttribute('r', spot.r + 3)}
                onMouseLeave={(e) => e.target.setAttribute('r', spot.r)}
                onClick={(e) => handleRegionClick(e, spot.id)}
              />
            </Tooltip>
          );
        })}
      </svg>

      {/* Action Menu triggered by Hotspots */}
      <Menu
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 200, mt: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important', py: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="caption" fontWeight="800" color="text.secondary">
            REGION: {selectedRegion?.replace(/_/g, ' ').toUpperCase()}
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={() => handleMenuAction('plan_treatment')} sx={{ py: 1.5 }}>
          <ListItemIcon><AddCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Plan Treatment" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('mark_completed')} sx={{ py: 1.5 }}>
          <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText primary="Mark Completed" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => handleMenuAction('update_condition', 'Acne')} sx={{ py: 1.5 }}>
          <ListItemIcon><HealingIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Mark Acne" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Pigmentation')} sx={{ py: 1.5 }}>
          <ListItemIcon><InvertColorsIcon fontSize="small" sx={{ color: '#8b5cf6' }} /></ListItemIcon>
          <ListItemText primary="Mark Pigmentation" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Lesion')} sx={{ py: 1.5 }}>
          <ListItemIcon><HealingIcon fontSize="small" sx={{ color: '#be123c' }} /></ListItemIcon>
          <ListItemText primary="Mark Lesion" />
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