import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { settingService } from '../api/services/settingService'; 

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

const DEFAULT_NAME = "Dental CRM";
const DEFAULT_COLOR = "#1976d2"; 
const DEFAULT_LOGO = null;

export const ThemeWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [clinicName, setClinicName] = useState(DEFAULT_NAME);
  const [clinicLogo, setClinicLogo] = useState(DEFAULT_LOGO);
  const [isBrandingLoaded, setIsBrandingLoaded] = useState(false);

  // ⚡️ 1. MOVE THE FUNCTION OUTSIDE useEffect
  const loadBranding = async () => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user && user.token) {
      try {
        const data = await settingService.getClinic();
        if (data) {
          if (data.primaryColor) setPrimaryColor(data.primaryColor);
          if (data.name) setClinicName(data.name);
          if (data.logo) setClinicLogo(data.logo);
        }
      } catch (error) {
        console.error("Failed to load theme settings, using defaults.", error);
      }
    } 
    setIsBrandingLoaded(true);
  };

  // ⚡️ 2. CALL IT ON MOUNT
  useEffect(() => {
    loadBranding();
  }, []);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    changePrimaryColor: (color) => setPrimaryColor(color),
    setClinicLogo, 
    setClinicName,
    
    // ⚡️ 3. EXPOSE THE FUNCTION TO THE REST OF THE APP
    loadBranding, 

    primaryColor,
    mode,
    clinicName, 
    clinicLogo,  
    isBrandingLoaded
  }), [mode, primaryColor, clinicName, clinicLogo, isBrandingLoaded]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      background: { default: mode === 'light' ? '#f4f6f8' : '#121212' }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'none' }
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12, backgroundImage: 'none' } } }
    }
  }), [mode, primaryColor]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};