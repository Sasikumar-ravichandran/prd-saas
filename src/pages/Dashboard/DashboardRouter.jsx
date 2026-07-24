import React from 'react';
import ReceptionistDashboard from './ReceptionistDashboard'; // You will build this
import DoctorDashboard from './DoctorDashboard';             // You will build this
import AdminDashboard from './AdminDashboard';               // You will build this
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

export default function DashboardRouter() {
  
  const { user, isLoading } = useSelector((state) => state.auth); 
  
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Typography color="error">Please log in.</Typography>;
  }

  // Safely check the role (handling case sensitivity just in case)
  const USER_ROLE = user.role ? user.role.toLowerCase() : '';

  // Logic to switch views
  const renderDashboard = () => {
    switch (USER_ROLE) {
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'administrator':
        return <AdminDashboard />;
      default:
        return <Typography color="error">Unknown Role</Typography>;
    }
  };

  return (
    <Box sx={{ p: 0 }}>
       {renderDashboard()}
    </Box>
  );
}