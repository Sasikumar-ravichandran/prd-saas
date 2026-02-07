import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#1976d2'); // Default Blue

  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    changePrimaryColor: (color) => setPrimaryColor(color),
    primaryColor,
    mode
  }), [mode, primaryColor]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      background: { default: mode === 'light' ? '#f4f6f8' : '#121212' }
    },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } }
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