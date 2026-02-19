import React from 'react';
import ReceptionistDashboard from './ReceptionistDashboard'; // You will build this
import DoctorDashboard from './DoctorDashboard';             // You will build this
import AdminDashboard from './AdminDashboard';               // You will build this
import { Box, Typography } from '@mui/material';

// Mock User Role (In real app, get this from Context/Auth)
const USER_ROLE = 'doctor'; // Change to 'doctor' or 'admin' to test

export default function DashboardRouter() {
  
  // Logic to switch views
  const renderDashboard = () => {
    switch (USER_ROLE) {
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Typography color="error">Unknown Role</Typography>;
    }
  };

  return (
    <Box sx={{ p: 0 }}>
       {/* Common Welcome Message could go here */}
       {renderDashboard()}
    </Box>
  );
}