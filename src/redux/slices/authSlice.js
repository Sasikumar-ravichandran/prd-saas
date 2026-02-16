import { createSlice } from '@reduxjs/toolkit';

// 1. Initial State: Try to load from LocalStorage first to prevent logout on refresh
const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const activeBranchId = localStorage.getItem('activeBranchId') || null;

const initialState = {
  user: userFromStorage,
  activeBranchId: activeBranchId,
  // If user exists, use their branches, else empty array
  branches: userFromStorage?.allowedBranches || [], 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // A. LOGIN: Set user and populate branches
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.branches = user.allowedBranches || [];
      state.activeBranchId = user.defaultBranch;
      
      // Sync to LocalStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('activeBranchId', user.defaultBranch);
    },

    // B. LOGOUT: Clear everything
    logout: (state) => {
      state.user = null;
      state.branches = [];
      state.activeBranchId = null;
      localStorage.removeItem('user');
      localStorage.removeItem('activeBranchId');
    },

    // C. UPDATE BRANCHES (The fix for your issue)
    // Call this whenever you Add/Edit/Delete a branch in Settings
    setBranches: (state, action) => {
      state.branches = action.payload;
      
      // We also need to update the user object in localStorage so it persists
      if (state.user) {
        state.user.allowedBranches = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // D. SWITCH BRANCH
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

export const { setCredentials, logout, setBranches, switchBranch } = authSlice.actions;
export default authSlice.reducer;