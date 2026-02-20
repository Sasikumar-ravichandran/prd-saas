import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LanguageIcon from '@mui/icons-material/Language';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import { useColorMode } from '../../../context/ThemeContext';
import PersonIcon from '@mui/icons-material/Person';


const SidebarTab = ({ icon, label, primaryColor, ...props }) => (
  <Tab 
    icon={icon} 
    iconPosition="start" 
    label={label} 
    sx={{ 
      justifyContent: 'flex-start', minHeight: 50, px: 3, 
      fontWeight: '600', textTransform: 'none', color: '#64748b', fontSize: '0.85rem',
      '&.Mui-selected': { 
        color: primaryColor, 
        bgcolor: '#f1f5f9', 
        borderRight: `3px solid ${primaryColor}` 
      },
      '& .MuiSvgIcon-root': { fontSize: 20, mr: 1.5 }
    }} 
    {...props} 
  />
);

export default function SettingsSidebar({ tab, setTab }) {
  const { primaryColor } = useColorMode();

  return (
    <Box sx={{ width: 280, borderRight: '1px solid #e2e8f0', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
         <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 1 }}>SETTINGS MENU</Typography>
      </Box>
      <Tabs 
        orientation="vertical" 
        value={tab} 
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        TabIndicatorProps={{ style: { display: 'none' } }}
        sx={{ flex: 1 }}
      >
        <SidebarTab icon={<PersonIcon />} label="My Profile" primaryColor={primaryColor} />
        <SidebarTab icon={<StorefrontIcon />} label="Clinic Profile" primaryColor={primaryColor} />
        <SidebarTab icon={<LanguageIcon />} label="Website & Branding" primaryColor={primaryColor} />
        <SidebarTab icon={<VaccinesIcon />} label="Service Catalog" primaryColor={primaryColor} />
        <SidebarTab icon={<SupervisorAccountIcon />} label="User Management" primaryColor={primaryColor} />
        <SidebarTab icon={<SecurityIcon />} label="Roles & Permissions" primaryColor={primaryColor} />
        <SidebarTab icon={<HistoryIcon />} label="Audit Logs" primaryColor={primaryColor} />
      </Tabs>
    </Box>
  );
}