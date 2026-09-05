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
import AdminPayrollPage from './components/Admin/AdminPayrollPage';
import FinancialLedgerPage from './components/Admin/FinancePage';
import AttendancePage from './pages/Attendance/AttendancePage';
import MyStats from './pages/MyStats';
import Messages from './pages/Messages';

import RoleGuard from './components/common/RoleGuard';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdmin/SuperAdminDashboard';
import SuperAdminProtectedRoute from './components/SuperAdmin/SuperAdminProtectedRoute';

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

// --- 3. APPROVAL GUARD (Must be approved by Super Admin) ---
const RequireApproval = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Replace 'status' and 'Pending' with your actual schema properties
  if (user && user.status === 'Pending') { 
    return <Navigate to="/pending-approval" replace />;
  }

  return <Outlet />;
};

// --- PENDING APPROVAL PLACEHOLDER PAGE ---
// You can move this to its own file in /pages later
const PendingApprovalPage = () => (
  <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
    <h2>Account Pending Approval</h2>
    <p>Your account has been created and is waiting for Admin approval.</p>
    <p>We will notify you once your clinic is verified.</p>
    <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }}>
      Log Out
    </button>
  </div>
);

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
  const dispatch = useDispatch(); //  4. Initialize Dispatch
  const { user } = useSelector((state) => state.auth); //  5. Get current user

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
        ':focus': { outline: 'none !important' },
        'button:focus': { outline: 'none !important' },
        'button::-moz-focus-inner': { border: '0 !important' }
      }} />
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/* --- LEVEL 1: PUBLIC ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin-login" element={<SuperAdminLogin />} />
            <Route 
              path="/saas-admin" 
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminDashboard />
                </SuperAdminProtectedRoute>
              } 
            />
            {/* --- LEVEL 2: AUTHENTICATED ONLY (Onboarding) --- */}
            {/* Use this for pages that happen AFTER login but BEFORE dashboard */}
            <Route element={<RequireAuth />}>
              
              {/* NEW: Route for users waiting on approval */}
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              
              {/* Wrapped in RequireApproval to block unapproved users */}
              <Route element={<RequireApproval />}>
                <Route path="/setup-branch" element={<SetupBranch />} />
                <Route path="/change-password" element={<ChangePasswordScreen />} />
              </Route>
            </Route>

            {/* --- LEVEL 3: FULLY PROTECTED (Auth + Branch + Layout) --- */}
            <Route element={<RequireAuth />}>
              <Route element={<RequireBranch />}>
              <Route element={<RequireApproval />}>
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
                  <Route 
                    path="payroll" 
                    element={
                      <RoleGuard allowedRoles={['Administrator']}>
                        <AdminPayrollPage />
                      </RoleGuard>
                    } 
                  />
                  <Route path="financial" element={
                      <RoleGuard allowedRoles={['Administrator']}>
                        <FinancialLedgerPage />
                      </RoleGuard>
                    } 
                 />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="/my-stats" element={
                      <RoleGuard allowedRoles={['Doctor']}>
                        <MyStats />
                      </RoleGuard>
                    } 
                 />
                  <Route path="/messages" element={<Messages />} />
                </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeWrapper >
  );
}

export default App;