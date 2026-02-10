import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { settingService } from '../api/services/settingService'; 
const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

// --- DEFAULTS ---
const DEFAULT_NAME = "Dental CRM";
const DEFAULT_COLOR = "#1976d2"; // Standard Blue
const DEFAULT_LOGO = null;

export const ThemeWrapper = ({ children }) => {
  // --- STATE ---
  const [mode, setMode] = useState('light');
  
  // Initialize with Defaults immediately so there is no "blank" state
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [clinicName, setClinicName] = useState(DEFAULT_NAME);
  const [clinicLogo, setClinicLogo] = useState(DEFAULT_LOGO);
  
  const [isBrandingLoaded, setIsBrandingLoaded] = useState(false);

  // --- 1. FETCH BRANDING ON LOAD ---
  useEffect(() => {
    const loadBranding = async () => {
      // 1. CHECK FOR USER TOKEN FIRST
      // We read directly from localStorage because Context might not be ready
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      // 2. ONLY CALL API IF USER IS LOGGED IN
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
          // If 401, it might mean token expired, but we just fall back to default blue
        }
      } 
      
      // 3. ALWAYS FINISH LOADING
      // Even if no user (Login Page), we must set this to true so the UI shows up
      setIsBrandingLoaded(true);
    };

    loadBranding();
  }, []);

  // --- 2. CONTEXT VALUE ---
  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    
    // Allow components (BrandingTab) to update these instantly
    changePrimaryColor: (color) => setPrimaryColor(color),
    setClinicLogo, 
    setClinicName,

    primaryColor,
    mode,
    clinicName, 
    clinicLogo,  
    isBrandingLoaded
  }), [mode, primaryColor, clinicName, clinicLogo, isBrandingLoaded]);

  // --- 3. CREATE THEME ---
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
      MuiButton: { 
        styleOverrides: { 
          root: { borderRadius: 8 },
        } 
      },
      MuiPaper: { 
        styleOverrides: { root: { borderRadius: 12, backgroundImage: 'none' } } 
      }
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