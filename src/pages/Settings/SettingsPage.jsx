import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import SettingsSidebar from './components/SettingsSidebar';

// Import Tabs
import ClinicProfileTab from './tabs/ClinicProfileTab';
import BrandingTab from './tabs/BrandingTab';
import ServiceCatalogTab from './tabs/ServiceCatalogTab';
import UserManagementTab from './tabs/UserManagementTab';
import RolesTab from './tabs/RolesTab';
import AuditLogsTab from './tabs/AuditLogsTab';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ bgcolor: '#f8fafc', height: 'calc(100vh - 100px)', p: 3, mx: -3, my: -3, display: 'flex', flexDirection: 'column' }}>
      
      <Paper elevation={0} sx={{ display: 'flex', flex: 1, border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}>
        
        {/* Left Sidebar */}
        <SettingsSidebar tab={tab} setTab={setTab} />

        {/* Right Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
          {tab === 0 && <ClinicProfileTab />}
          {tab === 1 && <BrandingTab />}
          {tab === 2 && <ServiceCatalogTab />}
          {tab === 3 && <UserManagementTab />}
          {tab === 4 && <RolesTab />}
          {tab === 5 && <AuditLogsTab />}
        </Box>
      </Paper>
    </Box>
  );
}