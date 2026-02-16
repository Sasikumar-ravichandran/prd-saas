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
          p: 3, 
          width: { md: `calc(1250px - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          mt: `${HEADER_HEIGHT}px`, 
          transition: 'width 0.3s',
          minHeight: '100vh',
          bgcolor: '#f8fafc' 
        }}
      >
        <Outlet /> 
      </Box>

    </Box>
  );
}