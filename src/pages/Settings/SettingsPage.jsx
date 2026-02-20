import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useSearchParams } from 'react-router-dom'; // ⚡️ IMPORT THIS
import SettingsSidebar from './components/SettingsSidebar';

// Import Tabs
import UserProfileTab from './tabs/UserProfileTab'; // ⚡️ IMPORT NEW TAB
import ClinicProfileTab from './tabs/ClinicProfileTab';
import BrandingTab from './tabs/BrandingTab';
import ServiceCatalogTab from './tabs/ServiceCatalogTab';
import UserManagementTab from './tabs/UserManagementTab';
import RolesTab from './tabs/RolesTab';
import AuditLogsTab from './tabs/AuditLogsTab';

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Default to 0 (My Profile)
  const [tab, setTab] = useState(0);

  // ⚡️ URL SYNC LOGIC: Listen to URL changes from the Header
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

  // Update URL when clicking tabs in the sidebar
  const handleTabChange = (newValue) => {
    setTab(newValue);
    const tabNames = ['profile', 'clinic', 'branding', 'services', 'users', 'roles', 'audit'];
    setSearchParams({ tab: tabNames[newValue] });
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', height: 'calc(100vh - 100px)', p: 3, mx: -3, my: -3, display: 'flex', flexDirection: 'column' }}>
      
      <Paper elevation={0} sx={{ display: 'flex', flex: 1, border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}>
        
        {/* Left Sidebar */}
        <SettingsSidebar tab={tab} setTab={handleTabChange} />

        {/* Right Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
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