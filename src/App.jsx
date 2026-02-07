import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeWrapper } from './context/ThemeContext';
import MainLayout from './components/Layout/MainLayout';
import PatientList from './pages/Dashboard/PatientList';
import DashboardRouter from './pages/Dashboard/DashboardRouter';

// 1. IMPORT THE CALENDAR PAGE
import CalendarPage from './pages/Calender/CalendarPage';

// Placeholder pages
import SettingsPage from './pages/Settings/SettingsPage';
import PatientProfile from './components/Patients/PatientProfile';
import { ToastProvider } from './context/ToastContext';


function App() {
  return (
    <ThemeWrapper>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardRouter />} />
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/:id" element={<PatientProfile />} />
              {/* 2. UPDATE THE ROUTE TO USE THE REAL COMPONENT */}
              <Route path="calendar" element={<CalendarPage />} />

              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeWrapper>
  );
}

export default App;