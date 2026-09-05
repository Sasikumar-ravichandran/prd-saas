import { createSlice } from '@reduxjs/toolkit';

// 1. Initial State: Try to load from LocalStorage first to prevent logout on refresh
const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const activeBranchId = localStorage.getItem('activeBranchId') || null;

const initialState = {
  user: userFromStorage,
  activeBranchId: activeBranchId,
  branches: userFromStorage?.allowedBranches || [], 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // A. LOGIN: Set user and populate branches
    setCredentials: (state, action) => {
      const safeUser = { ...action.payload.user || action.payload }; 
      delete safeUser.token; 

      state.user = safeUser;
      state.branches = safeUser.allowedBranches || [];
      state.activeBranchId = safeUser.defaultBranch;
      
      localStorage.setItem('user', JSON.stringify(safeUser));
      localStorage.setItem('activeBranchId', safeUser.defaultBranch);
    },

    logout: (state) => {
      state.user = null;
      state.branches = [];
      state.activeBranchId = null;
      localStorage.removeItem('user');
      localStorage.removeItem('activeBranchId');
    },

    // Call this whenever you Add/Edit/Delete a branch in Settings
    setBranches: (state, action) => {
      state.branches = action.payload;
      
      // We also need to update the user object in localStorage so it persists
      if (state.user) {
        state.user.allowedBranches = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    switchBranch: (state, action) => {
      const branchId = action.payload;
      state.activeBranchId = branchId;
      localStorage.setItem('activeBranchId', branchId);
      
      // Update the user's default branch pointer
      if (state.user) {
         state.user.defaultBranch = branchId;
         // Find branch details to update display names if needed
         const branch = state.branches.find(b => b._id === branchId);
         if(branch) {
             state.user.branchName = branch.branchName;
             state.user.branchCode = branch.branchCode;
         }
         localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
});

export const selectHasRole = (allowedRoles) => (state) => {
  const user = state.auth.user;
  if (!user || !user.role) return false;

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(user.role);
  }
  return user.role === allowedRoles;
};

export const selectUserRole = (state) => state.auth.user?.role || null;

export const { setCredentials, logout, setBranches, switchBranch } = authSlice.actions;
export default authSlice.reducer;