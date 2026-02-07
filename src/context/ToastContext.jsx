import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success'); // 'success', 'error', 'info', 'warning'

  // The function exposed to the rest of the app
  const showToast = useCallback((msg, type = 'success') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* GLOBAL SNACKBAR COMPONENT */}
      <Snackbar 
        open={open} 
        autoHideDuration={4000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Bottom Center looks best for desktop apps
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};