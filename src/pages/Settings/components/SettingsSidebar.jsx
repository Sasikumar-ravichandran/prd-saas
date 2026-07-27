import React from 'react';
import { Box, Tabs, Tab, Typography, useTheme, useMediaQuery } from '@mui/material';
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
      justifyContent: { xs: 'center', md: 'flex-start' }, 
      minHeight: { xs: 40, md: 50 }, 
      px: { xs: 2.5, md: 3 }, 
      
      //  FIX 1: Removed `mx` (margins) because it breaks MUI's scroll calculator!
      my: { xs: 1, md: 0 }, 
      
      fontWeight: '700', 
      textTransform: 'none', 
      fontSize: { xs: '0.8rem', md: '0.85rem' },
      whiteSpace: 'nowrap', 
      color: '#64748b',
      transition: 'all 0.2s ease',
      
      //  FIX 2: Strip MUI's default chunky widths
      minWidth: 0, 

      borderRadius: { xs: '24px', md: '0px' },

      '&.Mui-selected': { 
        color: { xs: '#fff', md: primaryColor }, 
        bgcolor: { xs: primaryColor, md: '#f1f5f9' }, 
        borderRight: { xs: 'none', md: `3px solid ${primaryColor}` },
        boxShadow: { xs: `0 4px 10px ${primaryColor}40`, md: 'none' } 
      },
      '& .MuiSvgIcon-root': { 
        fontSize: { xs: 18, md: 20 }, 
        mr: { xs: 1, md: 1.5 }, 
        mb: '0 !important' 
      }
    }} 
    {...props} 
  />
);

export default function SettingsSidebar({ tab, setTab }) {
  const { primaryColor } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      width: { xs: '100%', md: 280 }, 
      
      //  FIX 3: Triple-lock the container to prevent screen blowout
      maxWidth: '100%', 
      overflow: 'hidden', 
      
      borderRight: { xs: 'none', md: '1px solid #e2e8f0' }, 
      borderBottom: { xs: '1px solid #e2e8f0', md: 'none' }, 
      bgcolor: '#fff', 
      display: 'flex', 
      flexDirection: 'column',
      flexShrink: 0
    }}>
      
      <Box sx={{ p: 3, display: { xs: 'none', md: 'block' } }}>
         <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 1 }}>
           SETTINGS MENU
         </Typography>
      </Box>

      <Tabs 
        orientation={isMobile ? "horizontal" : "vertical"} 
        value={tab} 
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile 
        TabIndicatorProps={{ style: { display: 'none' } }} 
        sx={{ 
          flex: 1,
          maxWidth: '100%', //  Lock the Tabs component width
          minHeight: { xs: 56, md: 'auto' }, 
          '& .MuiTabs-flexContainer': {
            alignItems: { xs: 'center', md: 'stretch' },
            
            //  FIX 4: Use 'gap' instead of margin to space the pills safely!
            gap: { xs: 1, md: 0 }, 
            px: { xs: 1.5, md: 0 } 
          }
        }}
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