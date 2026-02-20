import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, InputBase, 
  Typography, Avatar, Stack, Tooltip, Badge, Divider, alpha, ListItemIcon, Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useColorMode } from '../../context/ThemeContext';
import { switchBranch, logout } from '../../redux/slices/authSlice'; 

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
import CloseIcon from '@mui/icons-material/Close';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 70; // Slightly slimmer header

export default function Header({ isCollapsed, handleDrawerToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor } = useColorMode(); 
  const searchInputRef = useRef(null);
  
  // REDUX STATE
  const { user, branches, activeBranchId } = useSelector((state) => state.auth);

  const activeBranch = branches.find(b => b._id === activeBranchId) || {};
  const currentBranchName = activeBranch.branchName || activeBranch.name || "Select Branch";

  // UI STATE
  const [branchAnchor, setBranchAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [quickAddAnchor, setQuickAddAnchor] = useState(null);
  
  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // --- Handlers ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMobileSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/login');
  };

  const handleBranchSwitch = (branch) => {
    setBranchAnchor(null);
    dispatch(switchBranch(branch._id));
    window.location.reload(); 
  };

  const safeUser = user || { fullName: 'Guest', name: 'Guest', role: 'Staff' };
  const displayName = safeUser.fullName || safeUser.name;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` }, 
        ml: { md: `${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` }, 
        bgcolor: 'rgba(255,255,255,0.85)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
        transition: 'all 0.3s ease',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ height: HEADER_HEIGHT, display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 }, gap: 1 }}>
        
        {/* ================= LEFT SECTION ================= */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flex: 1 }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Button 
            onClick={(e) => setBranchAnchor(e.currentTarget)}
            disableElevation
            sx={{ 
              textTransform: 'none', color: '#1e293b', 
              bgcolor: 'white', border: '1px solid #e2e8f0', 
              px: { xs: 1, sm: 1.5 },
              height: 40, // ⚡️ Fixed slim height
              borderRadius: '10px',
              minWidth: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
            }}
          >
            <LocationOnIcon sx={{ color: primaryColor, mr: { xs: 0, sm: 1 }, fontSize: 20 }} />
            
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', mt: -0.3 }}>
              <Stack spacing={-0.4} alignItems="flex-start">
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Workspace
                </Typography>
                <Typography variant="body2" fontWeight="700" noWrap sx={{ maxWidth: 140, fontSize: '0.85rem' }}>
                  {currentBranchName}
                </Typography>
              </Stack>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: '#94a3b8', fontSize: 18, ml: 0.5, display: { xs: 'none', sm: 'block' } }} />
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
                    <MenuItem onClick={() => { setBranchAnchor(null); navigate('/settings?tab=clinic'); }} sx={{ borderRadius: 2 }}>
                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                        <Typography variant="body2" fontWeight="600">Add New Branch</Typography>
                    </MenuItem>
                </>
            )}
          </Menu>
        </Box>

        {/* ================= CENTER SECTION (PREMIUM SEARCH) ================= */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', flex: 1.5 }}>
           <Box sx={{ 
              width: '100%', maxWidth: 420, height: 40, // ⚡️ Fixed slim height
              bgcolor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.5,
              border: '1px solid transparent', transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#e2e8f0' },
              '&:focus-within': { 
                bgcolor: 'white', border: `1px solid ${primaryColor}`, 
                boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
                '&:hover': { bgcolor: 'white' }
              }
           }}>
              <SearchIcon sx={{ color: '#64748b', mr: 1, fontSize: 18 }} />
              <InputBase 
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search patients, doctors..." 
                fullWidth 
                sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }} 
              />
              
              {/* Sleek Keyboard Key UI */}
              <Box sx={{ 
                border: '1px solid #cbd5e1', borderRadius: '6px', px: 0.8, py: 0.3, 
                bgcolor: 'white', ml: 1, display: 'flex', alignItems: 'center', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
              }}>
                  <Typography variant="caption" fontWeight="800" color="#64748b" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                    ⌘ K
                  </Typography>
              </Box>
           </Box>
        </Box>

        {/* ================= RIGHT SECTION ================= */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: { xs: 0.5, sm: 1.5 }, flex: 1 }}>
          
          <IconButton 
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#64748b' }}
            onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (!mobileSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          {/* QUICK ADD */}
          <Tooltip title="Quick Actions">
              <IconButton 
                  onClick={(e) => setQuickAddAnchor(e.currentTarget)}
                  sx={{ 
                      bgcolor: alpha(primaryColor, 0.1), color: primaryColor, 
                      border: `1px solid ${alpha(primaryColor, 0.2)}`, width: 38, height: 38,
                      '&:hover': { bgcolor: alpha(primaryColor, 0.2) }
                  }}
              >
                  <AddCircleOutlineIcon fontSize="small" />
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
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 800 }}>QUICK ACTIONS</Typography>
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

          <Tooltip title="Notifications">
            <IconButton sx={{ color: '#64748b', width: 38, height: 38 }}>
                <Badge badgeContent={3} color="error" variant="dot">
                    <NotificationsNoneIcon fontSize="small" />
                </Badge>
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: { xs: 0, sm: 0.5 } }} />

          {/* USER PROFILE */}
          <Button 
            onClick={(e) => setUserAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', borderRadius: '10px', py: 0.5, px: { xs: 0.5, sm: 1 }, minWidth: 0, height: 40, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <Box sx={{ textAlign: 'right', mr: 1.5, display: { xs: 'none', xl: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.1, fontSize: '0.85rem' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem' }}>
                {safeUser.role}
              </Typography>
            </Box>
            <Avatar sx={{ width: 34, height: 34, bgcolor: primaryColor, fontSize: 13, fontWeight: '900' }}>
              {getInitials(displayName)}
            </Avatar>
          </Button>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 200, p: 1 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
             <Box sx={{ px: 2, py: 1, display: { xl: 'none' } }}>
                 <Typography variant="subtitle2" fontWeight="800">{displayName}</Typography>
                 <Typography variant="caption" color="text.secondary">{safeUser.role}</Typography>
             </Box>
             <Divider sx={{ my: 1, display: { xl: 'none' } }} />
             
             <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings?tab=profile'); }} sx={{ borderRadius: 2 }}>
               <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
               <Typography variant="body2" fontWeight="600">My Profile</Typography>
             </MenuItem>

             {safeUser.role === 'Administrator' && (
                 <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings?tab=clinic'); }} sx={{ borderRadius: 2 }}>
                   <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon> 
                   <Typography variant="body2" fontWeight="600">Clinic Settings</Typography>
                 </MenuItem>
             )}

             <Divider sx={{ my: 1 }} />
             <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2 }}>
               <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
               <Typography variant="body2" fontWeight="600">Sign Out</Typography>
             </MenuItem>
          </Menu>

        </Box>
      </Toolbar>

      {/* ================= MOBILE SEARCH BAR (Collapsible) ================= */}
      <Collapse in={mobileSearchOpen} timeout="auto" unmountOnExit sx={{ display: { md: 'none' } }}>
          <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', 
              borderRadius: '10px', px: 1.5, height: 44, border: '1px solid #e2e8f0',
              '&:focus-within': { borderColor: primaryColor, bgcolor: 'white', boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}` }
            }}>
              <SearchIcon sx={{ color: '#64748b', fontSize: 20, mr: 1 }} />
              <InputBase 
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search patients, doctors... (Enter)" 
                fullWidth 
                sx={{ fontSize: '0.95rem' }} 
              />
            </Box>
          </Box>
      </Collapse>
    </AppBar>
  );
}