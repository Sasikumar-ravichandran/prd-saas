import React, { useState } from 'react';
import { 
  AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, InputBase, 
  Typography, Avatar, Stack, Tooltip, Badge, Divider, alpha 
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 74;

export default function Header({ isCollapsed, handleDrawerToggle }) {
  const { primaryColor } = useColorMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleBranchClick = (event) => setAnchorEl(event.currentTarget);
  const handleBranchClose = () => setAnchorEl(null);

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
        
        {/* LEFT: Mobile Toggle & Branch */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '25%' }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
             <Button 
               onClick={handleBranchClick}
               startIcon={<LocationOnIcon sx={{ color: primaryColor }} />}
               endIcon={<KeyboardArrowDownIcon sx={{ color: '#94a3b8' }} />}
               sx={{ 
                 textTransform: 'none', color: '#334155', fontWeight: 700, 
                 bgcolor: 'white', border: '1px solid #e2e8f0', 
                 px: 2, py: 0.6, borderRadius: 2,
                 '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
               }}
             >
               Adyar Branch
             </Button>
             <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleBranchClose}>
                <MenuItem onClick={handleBranchClose} sx={{ fontWeight: 'bold' }}>Adyar Branch</MenuItem>
                <MenuItem onClick={handleBranchClose}>Anna Nagar Branch</MenuItem>
             </Menu>
          </Box>
        </Box>

        {/* CENTER: Search Bar */}
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

          <Button sx={{ textTransform: 'none', color: 'text.primary', borderRadius: 3, py: 0.5, px: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
            <Box sx={{ textAlign: 'right', mr: 1.5, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>Dr. Ramesh</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Admin</Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 36, height: 36, bgcolor: primaryColor, fontSize: 13, fontWeight: 'bold',
                boxShadow: `0 0 0 2px white, 0 0 0 4px ${alpha(primaryColor, 0.15)}`
              }}
            >
              DR
            </Avatar>
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}