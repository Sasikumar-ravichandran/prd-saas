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
    else if (tabQuery === 'roles') setTab(5);
    else if (tabQuery === 'audit') setTab(6);
  }, [searchParams]);

  const handleTabChange = (newValue) => {
    setTab(newValue);
    const tabNames = ['profile', 'clinic', 'branding', 'services', 'users', 'roles', 'audit'];
    setSearchParams({ tab: tabNames[newValue] });
  };

  return (
    <Box sx={{ 
      // ⚡️ FIX 1: The "Edge-to-Edge" Math
      // Pull the page out of the MainLayout padding on mobile only
      width: 'auto',
      // mx: { xs: -2, md: 0 }, 
      // mt: { xs: -2, md: 0 },
      
      height: { xs: 'calc(100vh - 74px)', md: 'calc(100vh - 100px)' }, 
      display: 'flex', 
      flexDirection: 'column',
      
      // ⚡️ FIX 2: Stop internal tabs from blowing out the width
      minWidth: 0,
      overflowX: 'hidden'
    }}>
      
      <Paper elevation={0} sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        flex: 1, 
        border: { xs: 'none', md: '1px solid #e2e8f0' }, 
        borderRadius: { xs: 0, md: 3 }, 
        overflow: 'hidden', 
        bgcolor: 'white',
        minWidth: 0 // Protects the Paper container
      }}>
        
        {/* Responsive Sidebar (Top menu on mobile, Side menu on desktop) */}
        <SettingsSidebar tab={tab} setTab={handleTabChange} />

        {/* Right Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', // ⚡️ Protects against wide content inside tabs
          bgcolor: '#fff', 
          p: { xs: 2, md: 4 },
          minWidth: 0 
        }}>
          {tab === 0 && <UserProfileTab />}
          {tab === 1 && <ClinicProfileTab />}
          {tab === 2 && <BrandingTab />}
          {tab === 3 && <ServiceCatalogTab />}
          {tab === 4 && <UserManagementTab />}
          {tab === 5 && <RolesTab />}
          {tab === 6 && <AuditLogsTab />}
        </Box>

      </Paper>
    </Box>
  );
}