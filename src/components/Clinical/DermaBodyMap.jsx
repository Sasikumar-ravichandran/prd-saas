import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';

// Icons for the Menu
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HealingIcon from '@mui/icons-material/Healing';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// Define the clickable hotspots on our SVG coordinate system
const HOTSPOTS = [
  { id: 'Forehead', cx: 150, cy: 50, r: 18 },
  { id: 'Left_Cheek', cx: 105, cy: 100, r: 16 },
  { id: 'Right_Cheek', cx: 195, cy: 100, r: 16 },
  { id: 'Nose', cx: 150, cy: 110, r: 14 },
  { id: 'Chin', cx: 150, cy: 155, r: 16 },
  { id: 'Neck', cx: 150, cy: 200, r: 18 },
  { id: 'Left_Shoulder', cx: 80, cy: 240, r: 20 },
  { id: 'Right_Shoulder', cx: 220, cy: 240, r: 20 },
  { id: 'Chest', cx: 150, cy: 280, r: 25 },
];

export default function DermaBodyMap({ initialStates, tooltips, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  // Track mouse coordinates for the popover menu
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

  // Determine color based on priority (Treatments > Conditions)
  const getRegionColor = (regionId) => {
    const status = initialStates?.[regionId];
    if (!status) return 'rgba(255, 255, 255, 0.4)'; // Default Empty
    
    const s = String(status).toLowerCase();
    
    // Treatment Plan Colors
    if (s === 'planned') return '#3b82f6'; // Blue
    if (s === 'active') return '#f59e0b';  // Orange
    if (s === 'completed') return '#22c55e'; // Green
    
    // Clinical Condition Colors (Stored in specialtyData)
    if (s === 'acne') return '#ef4444'; // Red
    if (s === 'pigmentation') return '#8b5cf6'; // Purple
    if (s === 'lesion') return '#be123c'; // Dark Red
    
    return '#94a3b8'; // Fallback Gray
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* The Interactive SVG Map */}
      <svg 
        viewBox="0 0 300 400" 
        style={{ height: '90%', maxHeight: '500px', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.05))' }}
      >
        {/* Base Outlines */}
        <g stroke="#cbd5e1" strokeWidth="3" fill="#f8fafc">
          {/* Shoulders & Chest */}
          <path d="M 40 400 L 40 300 Q 40 220 120 200 L 180 200 Q 260 220 260 300 L 260 400 Z" />
          {/* Neck */}
          <rect x="125" y="160" width="50" height="50" rx="10" />
          {/* Head/Face */}
          <ellipse cx="150" cy="95" rx="75" ry="90" />
        </g>

        {/* Dynamic Hotspots */}
        {HOTSPOTS.map((spot) => {
          const color = getRegionColor(spot.id);
          const tooltipText = tooltips?.[spot.id] || spot.id.replace('_', ' ');

          return (
            <Tooltip title={tooltipText} placement="top" arrow key={spot.id}>
              <circle
                cx={spot.cx}
                cy={spot.cy}
                r={spot.r}
                fill={color}
                stroke={color === 'rgba(255, 255, 255, 0.4)' ? '#94a3b8' : 'white'}
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
            REGION: {selectedRegion?.replace('_', ' ').toUpperCase()}
          </Typography>
        </MenuItem>
        
        {/* Treatment Actions */}
        <MenuItem onClick={() => handleMenuAction('plan_treatment')} sx={{ py: 1.5 }}>
          <ListItemIcon><AddCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Plan Treatment" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('mark_completed')} sx={{ py: 1.5 }}>
          <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText primary="Mark Completed" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Clinical Condition Actions */}
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Acne')} sx={{ py: 1.5 }}>
          <ListItemIcon><HealingIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Mark Acne" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('update_condition', 'Pigmentation')} sx={{ py: 1.5 }}>
          <ListItemIcon><InvertColorsIcon fontSize="small" sx={{ color: '#8b5cf6' }} /></ListItemIcon>
          <ListItemText primary="Mark Pigmentation" />
        </MenuItem>
        
        <Divider sx={{ my: 0.5 }} />

        {/* Clear Data */}
        <MenuItem onClick={() => handleMenuAction('clear')} sx={{ py: 1.5, color: '#ef4444' }}>
          <ListItemIcon><DeleteSweepIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Clear Condition" primaryTypographyProps={{ fontWeight: 700 }} />
        </MenuItem>
      </Menu>
    </Box>
  );
}