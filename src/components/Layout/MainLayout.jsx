import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from './Header';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 74;

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>

      {/* 1. TOP BAR */}
      <Header
        isCollapsed={isCollapsed}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* 2. SIDE NAVIGATION */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* 3. MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`
          },
          
          pt: { 
            xs: `${HEADER_HEIGHT + 12}px`, 
            md: `${HEADER_HEIGHT}px` 
          },
          
          height: { 
            xs: '100dvh',  
            md: '100vh' 
          },
          boxSizing: 'border-box',
          
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'none',
          transition: 'width 0.3s',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}