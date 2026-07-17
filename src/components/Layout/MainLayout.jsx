import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

// Import Custom Components
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
    <Box sx={{ display: 'flex' }}>

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
          // p: 3, 
          width: {
            xs: '100%',
            md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`
          },
          mt: `${HEADER_HEIGHT}px`,

          // ⚡️ FIX 1: Constrain height to exact remaining viewport space
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,

          // ⚡️ FIX 2: Tell this specific box to handle vertical scrolling
          overflowY: 'auto',
          overflowX: 'hidden',

          transition: 'width 0.3s',
          minWidth: 0,

          // Optional: Add smooth scrolling for the main content area
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}