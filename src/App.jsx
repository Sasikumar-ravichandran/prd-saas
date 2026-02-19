import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeWrapper } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { GlobalStyles } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux'; 
import { setBranches } from './redux/slices/authSlice';
import api from './api/services/api';
// --- LAYOUTS ---
import MainLayout from './components/Layout/MainLayout';

// --- PAGES ---
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SetupBranch from './pages/Onboarding/SetupBranch';
import ChangePasswordScreen from './pages/Auth/ChangePasswordScreen';
import InventoryPage from './pages/Inventory/InventoryPage';

// --- DASHBOARD PAGES ---
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import PatientList from './pages/Dashboard/PatientList';
import PatientProfile from './components/Patients/PatientProfile';
import CalendarPage from './pages/Calender/CalendarPage';
import SettingsPage from './pages/Settings/SettingsPage';

// --- 1. AUTH GUARD (Must be logged in) ---
const RequireAuth = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user) {
    // Redirect to login but save where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

// --- 2. BRANCH GUARD (Must have a branch selected) ---
const RequireBranch = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If user is Admin but has NO default branch, force them to setup
  if (user?.role === 'Administrator' && !user?.defaultBranch) {
    return <Navigate to="/setup-branch" replace />;
  }

  return <Outlet />;
};

function App() {
  const dispatch = useDispatch(); // ⚡️ 4. Initialize Dispatch
  const { user } = useSelector((state) => state.auth); // ⚡️ 5. Get current user

  const userId = user?._id; 

  useEffect(() => {
    // Only run if we have a valid User ID
    if (userId) {
      api.get('/branches')
        .then((response) => {
          dispatch(setBranches(response.data)); 
        })
        .catch((error) => console.error("Failed to sync branches on load", error));
    }
  }, [userId, dispatch]);


  return (
    <ThemeWrapper>
      <GlobalStyles styles={{
        // Removes the default focus outline from ALL buttons and inputs
        ':focus': { outline: 'none !important' },
        'button:focus': { outline: 'none !important' },
        // Removes the dotted line in Firefox
        'button::-moz-focus-inner': { border: '0 !important' }
      }} />
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/* --- LEVEL 1: PUBLIC ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* --- LEVEL 2: AUTHENTICATED ONLY (Onboarding) --- */}
            {/* Use this for pages that happen AFTER login but BEFORE dashboard */}
            <Route element={<RequireAuth />}>
              <Route path="/setup-branch" element={<SetupBranch />} />
              <Route path="/change-password" element={<ChangePasswordScreen />} />
            </Route>

            {/* --- LEVEL 3: FULLY PROTECTED (Auth + Branch + Layout) --- */}
            <Route element={<RequireAuth />}>
              <Route element={<RequireBranch />}>
                <Route path="/" element={<MainLayout />}>

                  {/* Dashboard Children */}
                  <Route index element={<DashboardRouter />} />

                  <Route path="patients">
                    <Route index element={<PatientList />} />
                    <Route path=":id" element={<PatientProfile />} />
                  </Route>

                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                </Route>
              </Route>
            </Route>

            {/* --- CATCH ALL --- */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeWrapper >
  );
}

export default App;