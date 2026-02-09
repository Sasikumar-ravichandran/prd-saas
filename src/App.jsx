import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeWrapper } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Pages
import MainLayout from './components/Layout/MainLayout';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import PatientList from './pages/Dashboard/PatientList';
import PatientProfile from './components/Patients/PatientProfile';
import CalendarPage from './pages/Calender/CalendarPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // <--- Import this too!

function App() {
  // Get user from storage
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    // 1. ThemeWrapper must be the TOP PARENT (so Login can use colors)
    <ThemeWrapper>
      <ToastProvider>
        {/* 2. Router must be next (so Login can use navigation) */}
        <BrowserRouter>
          <Routes>
            
            {/* --- PUBLIC ROUTES --- */}
            {/* If logged in, redirect to Dashboard. If not, show Login. */}
            <Route 
              path="/login" 
              element={!user ? <LoginPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <SignupPage /> : <Navigate to="/" />} 
            />

            {/* --- PROTECTED ROUTES --- */}
            {/* If NOT logged in, redirect to /login */}
            <Route 
               path="/" 
               element={user ? <MainLayout /> : <Navigate to="/login" />}
            >
               {/* Dashboard Child Routes */}
               <Route index element={<DashboardRouter />} />
               <Route path="patients" element={<PatientList />} />
               <Route path="patients/:id" element={<PatientProfile />} />
               <Route path="calendar" element={<CalendarPage />} />
               <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all: Redirect unknown URLs to home */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeWrapper>
  );
}

export default App;