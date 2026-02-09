import React, { useState } from 'react';
import { 
  AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, InputBase, 
  Typography, Avatar, Stack, Tooltip, Badge, Divider, alpha, ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../../context/ThemeContext';
import { authService } from '../../api/services/authService';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 74;

export default function Header({ isCollapsed, handleDrawerToggle }) {
  const navigate = useNavigate();
  const { primaryColor, clinicName } = useColorMode(); // Get Global Branding
  
  // 1. Get Logged In User Data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', role: 'Staff' };
  
  // State for Menus
  const [branchAnchor, setBranchAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);

  // --- Handlers ---
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'DR';
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` }, 
        ml: { md: `${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` }, 
        bgcolor: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
        transition: 'all 0.3s'
      }}
    >
      <Toolbar sx={{ height: HEADER_HEIGHT, display: 'flex', justifyContent: 'space-between', px: 2 }}>
        
        {/* LEFT: Mobile Toggle & Clinic Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '25%' }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
             <Button 
               onClick={(e) => setBranchAnchor(e.currentTarget)}
               startIcon={<LocationOnIcon sx={{ color: primaryColor }} />}
               endIcon={<KeyboardArrowDownIcon sx={{ color: '#94a3b8' }} />}
               sx={{ 
                 textTransform: 'none', color: '#334155', fontWeight: 700, 
                 bgcolor: 'white', border: '1px solid #e2e8f0', 
                 px: 2, py: 0.6, borderRadius: 2,
                 '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
               }}
             >
               {/* 2. Show Real Clinic Name */}
               {clinicName || "My Clinic"}
             </Button>

             {/* Branch Menu (Placeholder for future multi-location) */}
             <Menu 
               anchorEl={branchAnchor} 
               open={Boolean(branchAnchor)} 
               onClose={() => setBranchAnchor(null)}
               PaperProps={{ elevation: 3, sx: { mt: 1, borderRadius: 2, minWidth: 180 } }}
             >
                <MenuItem onClick={() => setBranchAnchor(null)} sx={{ fontWeight: 'bold' }}>
                  {clinicName} (Main)
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                   <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                   Clinic Settings
                </MenuItem>
             </Menu>
          </Box>
        </Box>

        {/* CENTER: Search Bar (Visual Only for now) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '50%' }}>
           <Box sx={{ 
              width: { xs: '100%', md: 450 }, 
              display: { xs: 'none', md: 'flex' },
              bgcolor: '#f1f5f9', borderRadius: 3, alignItems: 'center', px: 2, py: 0.8,
              border: '1px solid transparent',
              transition: 'all 0.2s',
              '&:focus-within': { 
                bgcolor: 'white', 
                border: `1px solid ${primaryColor}`, 
                boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.1)}` 
              }
           }}>
              <SearchIcon sx={{ color: '#94a3b8', mr: 1.5 }} />
              <InputBase placeholder="Search patient, doctor, or invoice..." fullWidth sx={{ fontSize: '0.9rem', fontWeight: 500 }} />
              <Box sx={{ border: '1px solid #cbd5e1', borderRadius: 1, px: 0.8, py: 0.2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.7rem' }}>⌘ K</Typography>
              </Box>
           </Box>
        </Box>

        {/* RIGHT: Actions & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, width: '25%' }}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Quick Add">
              <IconButton sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, border: `1px solid ${alpha(primaryColor, 0.2)}` }}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: '#64748b' }}>
                <Badge badgeContent={3} color="error" variant="dot">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton sx={{ color: '#64748b' }}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 1 }} />

          {/* 3. Real User Profile Button */}
          <Button 
            onClick={(e) => setUserAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', borderRadius: 3, py: 0.5, px: 1, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <Box sx={{ textAlign: 'right', mr: 1.5, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {user.role}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 36, height: 36, bgcolor: primaryColor, fontSize: 13, fontWeight: 'bold',
                boxShadow: `0 0 0 2px white, 0 0 0 4px ${alpha(primaryColor, 0.15)}`
              }}
            >
              {getInitials(user.name)}
            </Avatar>
          </Button>

          {/* 4. Functional User Menu */}
          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            PaperProps={{ elevation: 3, sx: { mt: 1, borderRadius: 2, minWidth: 160 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
             <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings'); }}>
               <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
               Profile
             </MenuItem>
             <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings'); }}>
               <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> 
               Settings
             </MenuItem>
             <Divider />
             <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
               <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
               Logout
             </MenuItem>
          </Menu>

        </Box>

      </Toolbar>
    </AppBar>
  );
}