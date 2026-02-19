// client/src/pages/Settings/Tabs/UserManagementTab.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Typography, Chip, Stack, Tooltip, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions // <--- Added Dialog imports
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

export default function UserManagementTab() {
  const { primaryColor } = useColorMode();
  const { activeBranchId } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ⚡️ DELETE CONFIRMATION STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 1. Fetch Users AND Branches together
  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, branchData] = await Promise.all([
        userService.getAll(),
        api.get('/branches')
      ]);

      setUsers(userData);
      setBranches(branchData.data); 
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  // ⚡️ Step 1: Open Delete Dialog
  const requestDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // ⚡️ Step 2: Confirm Delete
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

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ width: '100%', display: 'block', p: 4 }}>
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
            {users.map((user) => {
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
                        {/* ⚡️ DOCTOR DETAILS SHOWN HERE */}
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
                      <Tooltip title="Delete">
                        {/* ⚡️ CALL requestDelete instead of window.confirm */}
                        <IconButton size="small" color="error" onClick={() => requestDelete(user)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL FOR ADD/EDIT */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        branches={branches}
        primaryColor={primaryColor}
      />

      {/* ⚡️ DELETE CONFIRMATION DIALOG ⚡️ */}
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
            <br/>
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