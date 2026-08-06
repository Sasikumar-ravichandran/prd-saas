import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
// import SettingsSidebar from './SettingsSidebar';
import SettingsSidebar from './components/SettingsSidebar'

// Import Tabs
import UserProfileTab from './tabs/UserProfileTab';
import ClinicProfileTab from './tabs/ClinicProfileTab';
import BrandingTab from './tabs/BrandingTab';
import ServiceCatalogTab from './tabs/ServiceCatalogTab';
import UserManagementTab from './tabs/UserManagementTab';
import RolesTab from './tabs/RolesTab';
import AuditLogsTab from './tabs/AuditLogsTab';

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const tabQuery = searchParams.get('tab');
    if (tabQuery === 'profile') setTab(0);
    else if (tabQuery === 'clinic') setTab(1);
    else if (tabQuery === 'branding') setTab(2);
    else if (tabQuery === 'services') setTab(3);
    else if (tabQuery === 'users') setTab(4);
    // else if (tabQuery === 'roles') setTab(5);
    // else if (tabQuery === 'audit') setTab(6);
  }, [searchParams]);

  const handleTabChange = (newValue) => {
    setTab(newValue);
    const tabNames = ['profile', 'clinic', 'branding', 'services', 'users', 'roles', 'audit'];
    setSearchParams({ tab: tabNames[newValue] });
  };

  return (
    // MainLayout stays untouched, so zero other components are affected!
    <Box sx={{ 
      width: '100%',
      // Matches the exact height MainLayout gives to <main>
      height: { xs: `calc(100dvh - 86px)`, md: `calc(100vh - 74px)` },
      maxHeight: '100%',
      overflow: 'hidden', // Stops MainLayout from creating an outer scrollbar for this page
      display: 'flex', 
      flexDirection: 'column',
      boxSizing: 'border-box',
      p: { xs: 0, md: 2 },
      bgcolor: '#f8fafc'
    }}>
      
      <Paper elevation={0} sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        flex: 1, 
        border: { xs: 'none', md: '1px solid #e2e8f0' }, 
        borderRadius: { xs: 0, md: 3 }, 
        overflow: 'hidden', 
        bgcolor: 'white',
        minHeight: 0, // ⚡️ CRITICAL: Prevents inner tabs from forcing outer page growth
        minWidth: 0
      }}>
        
        {/* Responsive Sidebar (Top horizontal menu on mobile, Side menu on desktop) */}
        <SettingsSidebar tab={tab} setTab={handleTabChange} />

        {/* Right Content - THE ONLY SCROLLABLE AREA */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          bgcolor: '#fff', 
          p: { xs: 2, md: 4 },
          minWidth: 0,
          minHeight: 0,
          WebkitOverflowScrolling: 'touch'
        }}>
          {tab === 0 && <UserProfileTab />}
          {tab === 1 && <ClinicProfileTab />}
          {tab === 2 && <BrandingTab />}
          {tab === 3 && <ServiceCatalogTab />}
          {tab === 4 && <UserManagementTab />}
          {/* {tab === 5 && <RolesTab />}
          {tab === 6 && <AuditLogsTab />} */}
        </Box>

      </Paper>
    </Box>
  );
}