import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, InputBase, 
  Typography, Avatar, Stack, Tooltip, Badge, Divider, alpha, ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // <--- REDUX HOOKS
import { useColorMode } from '../../context/ThemeContext';
import { switchBranch, logout } from '../../redux/slices/authSlice'; // <--- REDUX ACTIONS

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 74;

export default function Header({ isCollapsed, handleDrawerToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor } = useColorMode(); 
  const searchInputRef = useRef(null);
  
  // 1. READ FROM REDUX STORE (Single Source of Truth)
  // 'user' contains name/role
  // 'branches' is the live list of available branches
  // 'activeBranchId' is the currently selected branch
  const { user, branches, activeBranchId } = useSelector((state) => state.auth);

  // 2. Derive Current Display Info from Redux State
  // We find the full branch object based on the active ID
  const activeBranch = branches.find(b => b._id === activeBranchId) || {};
  const currentBranchName = activeBranch.branchName || activeBranch.name || "Select Branch";
  const currentBranchCode = activeBranch.branchCode || "";

  // State for Menus
  const [branchAnchor, setBranchAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [quickAddAnchor, setQuickAddAnchor] = useState(null);

  // --- Handlers ---

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout()); // Redux action clears state & localStorage
    navigate('/login');
  };

  const handleBranchSwitch = (branch) => {
    setBranchAnchor(null);
    
    // 1. Dispatch Redux Action
    // This updates the Redux store AND localStorage
    dispatch(switchBranch(branch._id));
    
    // 2. Hard Refresh
    // Essential for SaaS to ensure all downstream components (Patient List, Calendar)
    // re-fetch data using the new Active Branch ID in the API headers.
    window.location.reload();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
  };


  // Safe check for guest users to prevent crash
  const safeUser = user || { name: 'Guest', role: 'Staff' };

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
        transition: 'all 0.3s',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ height: HEADER_HEIGHT, display: 'flex', justifyContent: 'space-between', px: 2 }}>
        
        {/* LEFT: Branch Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '30%' }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
             <Button 
               onClick={(e) => setBranchAnchor(e.currentTarget)}
               startIcon={<LocationOnIcon sx={{ color: primaryColor }} />}
               endIcon={<KeyboardArrowDownIcon sx={{ color: '#94a3b8', fontSize: 18 }} />}
               sx={{ 
                 textTransform: 'none', color: '#1e293b', 
                 bgcolor: 'white', border: '1px solid #e2e8f0', 
                 px: 2, py: 0.8, borderRadius: 2.5,
                 boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                 '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
               }}
             >
               <Stack spacing={-0.3} alignItems="flex-start">
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Active Branch
                  </Typography>
                  <Typography variant="body2" fontWeight="800">
                    {currentBranchName} {currentBranchCode && `(${currentBranchCode})`}
                  </Typography>
               </Stack>
             </Button>

             <Menu 
               anchorEl={branchAnchor} 
               open={Boolean(branchAnchor)} 
               onClose={() => setBranchAnchor(null)}
               PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 260, border: '1px solid #e2e8f0', p: 1 } }}
             >
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 800 }}>
                    YOUR LOCATIONS
                </Typography>
                
                {/* RENDER FROM REDUX STATE 'branches' */}
                {branches.map((branch) => (
                    <MenuItem 
                        key={branch._id} 
                        onClick={() => handleBranchSwitch(branch)}
                        selected={branch._id === activeBranchId}
                        sx={{ borderRadius: 2, my: 0.5, py: 1.2 }}
                    >
                        <ListItemIcon>
                            <BusinessIcon fontSize="small" color={branch._id === activeBranchId ? "primary" : "inherit"} />
                        </ListItemIcon>
                        <Box>
                            <Typography variant="body2" fontWeight={branch._id === activeBranchId ? 800 : 500}>
                                {branch.branchName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {branch.branchCode || 'No Code'}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}

                {safeUser.role === 'Administrator' && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem onClick={() => { setBranchAnchor(null); navigate('/settings'); }} sx={{ borderRadius: 2 }}>
                            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                            <Typography variant="body2" fontWeight="600">Add New Branch</Typography>
                        </MenuItem>
                    </>
                )}
             </Menu>
          </Box>
        </Box>

        {/* CENTER: Global Search */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '40%' }}>
           <Box sx={{ 
              width: '100%', maxWidth: 450,
              display: { xs: 'none', md: 'flex' },
              bgcolor: '#f1f5f9', borderRadius: 3, alignItems: 'center', px: 2, py: 0.8,
              border: '1px solid transparent',
              transition: 'all 0.2s',
              '&:focus-within': { 
                bgcolor: 'white', border: `1px solid ${primaryColor}`, 
                boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.1)}` 
              }
           }}>
              <SearchIcon sx={{ color: '#94a3b8', mr: 1.5 }} />
              <InputBase 
                inputRef={searchInputRef}
                placeholder="Search patients, doctors, or ID..." 
                fullWidth 
                sx={{ fontSize: '0.9rem', fontWeight: 500 }} 
              />
              <Box sx={{ border: '1px solid #cbd5e1', borderRadius: 1.5, px: 0.8, py: 0.2, bgcolor: 'white', ml: 1 }}>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ fontSize: '0.65rem' }}>⌘ K</Typography>
              </Box>
           </Box>
        </Box>

        {/* RIGHT: Quick Add & User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, width: '30%' }}>
          
          {/* MULTI-ACTION QUICK ADD */}
          <Box>
            <Tooltip title="Quick Actions">
                <IconButton 
                    onClick={(e) => setQuickAddAnchor(e.currentTarget)}
                    sx={{ 
                        bgcolor: alpha(primaryColor, 0.1), 
                        color: primaryColor, 
                        border: `1px solid ${alpha(primaryColor, 0.2)}`,
                        '&:hover': { bgcolor: alpha(primaryColor, 0.2) }
                    }}
                >
                    <AddCircleOutlineIcon />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={quickAddAnchor}
                open={Boolean(quickAddAnchor)}
                onClose={() => setQuickAddAnchor(null)}
                PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 220, p: 1 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 800 }}>
                    QUICK ACTIONS
                </Typography>
                
                <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/patients?add=true'); }} sx={{ borderRadius: 2, py: 1.2 }}>
                    <ListItemIcon><PersonAddIcon fontSize="small" color="primary" /></ListItemIcon>
                    <Typography variant="body2" fontWeight="600">Add New Patient</Typography>
                </MenuItem>

                <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/calendar?new=true'); }} sx={{ borderRadius: 2, py: 1.2 }}>
                    <ListItemIcon><CalendarMonthIcon fontSize="small" color="primary" /></ListItemIcon>
                    <Typography variant="body2" fontWeight="600">Book Appointment</Typography>
                </MenuItem>

                {safeUser.role === 'Administrator' && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/settings?tab=users'); }} sx={{ borderRadius: 2, py: 1.2 }}>
                            <ListItemIcon><GroupAddIcon fontSize="small" /></ListItemIcon>
                            <Typography variant="body2" fontWeight="600">Invite Staff</Typography>
                        </MenuItem>
                    </>
                )}
            </Menu>
          </Box>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: '#64748b' }}>
                <Badge badgeContent={3} color="error" variant="dot">
                    <NotificationsNoneIcon />
                </Badge>
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 0.5 }} />

          {/* USER PROFILE */}
          <Button 
            onClick={(e) => setUserAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', borderRadius: 3, py: 0.5, px: 1, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <Box sx={{ textAlign: 'right', mr: 1.5, display: { xs: 'none', xl: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                {safeUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                {safeUser.role}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 38, height: 38, bgcolor: primaryColor, fontSize: 13, fontWeight: '900',
                boxShadow: `0 0 0 2px white, 0 0 0 4px ${alpha(primaryColor, 0.15)}`
              }}
            >
              {getInitials(safeUser.name)}
            </Avatar>
          </Button>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 180, p: 1 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
             <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings'); }} sx={{ borderRadius: 2 }}>
               <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
               My Profile
             </MenuItem>
             <Divider sx={{ my: 1 }} />
             <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2 }}>
               <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
               Sign Out
             </MenuItem>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
}