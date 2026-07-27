// client/src/pages/Settings/Tabs/UserManagementTab.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Typography, Chip, Stack, Tooltip, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Pagination
} from '@mui/material';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsHeader from '../components/SettingsHeader';
import UserModal from '../modals/UserModal';
import { useColorMode } from '../../../context/ThemeContext';
import { userService } from '../../../api/services/userService';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/services/api';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchParams } from 'react-router-dom';

export default function UserManagementTab() {
  const { primaryColor } = useColorMode();
  const { activeBranchId } = useSelector((state) => state.auth);

  //  1. INITIALIZE SEARCH PARAMS
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  //  2. USE THE URL TERM AS THE DEFAULT STATE
  const [inputValue, setInputValue] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  //  3. LISTEN FOR URL CHANGES (Cross-page sync)
  useEffect(() => {
    const queryFromUrl = searchParams.get('search') || '';

    if (queryFromUrl !== activeSearch) {
      setInputValue(queryFromUrl);
      setActiveSearch(queryFromUrl);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchData = async (currentPage, currentSearch) => {
    try {
      setLoading(true);
      const [userData, branchData] = await Promise.all([
        userService.getAll({ page: currentPage, limit, search: currentSearch }),
        api.get('/branches')
      ]);

      setUsers(userData.users || []);
      setTotalPages(userData.totalPages || 1);

      if (branches.length === 0) setBranches(branchData.data);
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeSearch !== inputValue) {
        setPage(1);
        setActiveSearch(inputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, activeSearch]);

  useEffect(() => {
    fetchData(page, activeSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeSearch]);

  const handleAddClick = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const requestDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.delete(userToDelete._id);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast("Failed to delete user", 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      if (editingUser) {
        const updated = await userService.update(editingUser._id, formData);
        setUsers(users.map(u => (u._id === editingUser._id ? updated : u)));
      } else {
        const payload = {
          ...formData,
          defaultBranch: formData.defaultBranch || activeBranchId,
          allowedBranches: [formData.defaultBranch || activeBranchId]
        };
        const created = await userService.create(payload);
        setUsers([...users, created]);
      }
      setModalOpen(false);
      showToast('Saved successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save user", 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: '#dcfce7', color: '#166534' };
      case 'Inactive': return { bg: '#f1f5f9', color: '#64748b' };
      case 'Pending': return { bg: '#fff7ed', color: '#c2410c' };
      default: return { bg: '#f1f5f9', color: '#000' };
    }
  };

  //  REMOVED THE HARD RETURN THAT DESTROYED THE UI
  // if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ width: '100%', display: 'block', p: 1 }}>
      <SettingsHeader title="User Management" sub="Manage staff access and permissions." color={primaryColor}
        action={
          <Button
            variant="contained"
            onClick={handleAddClick}
            startIcon={<AddIcon />}
            sx={{ bgcolor: primaryColor }}
          >
            Add User
          </Button>
        }
      />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <TextField
          placeholder="Search users by name, email, or role..."
          variant="outlined"
          size="small"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
            //  ADDED INLINE SPINNER: Shows loading indicator directly inside the search bar
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={18} thickness={5} sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        layout: 'fixed',
        border: '1px solid #e2e8f0',
        borderRadius: 2
      }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>USER</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ROLE</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>BRANCH</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/*  ADDED GRACEFUL EMPTY/LOADING STATES FOR THE TABLE */}
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const statusStyle = getStatusColor(user.status);
                const branchName = user.defaultBranch?.branchName || user.defaultBranch?.name || 'Unassigned';

                return (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: primaryColor, fontSize: 14 }}>
                          {user.name ? user.name[0] : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Stack alignItems="flex-start" spacing={0.5}>
                        <Chip label={user.role} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                        {user.role === 'Doctor' && user.doctorConfig && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {user.doctorConfig.specialization || 'General'}
                            {user.doctorConfig.commissionPercentage > 0 && (
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                                • {user.doctorConfig.commissionPercentage}% Comm.
                              </span>
                            )}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={branchName}
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, borderRadius: 1 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditClick(user)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user._id === currentUser?._id ? "Cannot delete yourself" : "Delete"}>
                          <span>
                            <IconButton size="small" color="error" onClick={() => requestDelete(user)} disabled={user._id === currentUser?._id}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            bgcolor: '#f8fafc',
            borderTop: '1px solid #e2e8f0'
          }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </TableContainer>

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        branches={branches}
        primaryColor={primaryColor}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Delete User?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <b>{userToDelete?.name}</b>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}