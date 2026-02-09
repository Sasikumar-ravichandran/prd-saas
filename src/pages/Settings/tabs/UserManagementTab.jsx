import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Avatar, Typography, Chip, Stack, Tooltip, IconButton, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsHeader from '../components/SettingsHeader';
import UserModal from '../modals/UserModal';
import { useColorMode } from '../../../context/ThemeContext';
import { userService } from '../../../api/services/userService'; // Import Service

export default function UserManagementTab() {
  const { primaryColor } = useColorMode();
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- 1. FETCH USERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- HANDLERS ---
  const handleAddClick = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to remove this user? They will lose access immediately.")) {
      try {
        await userService.delete(id);
        setUsers(users.filter(u => u._id !== id)); // Optimistic update
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleSaveUser = async (data) => {
    try {
      if (editingUser) {
        // Update existing
        const updated = await userService.update(editingUser._id, data);
        setUsers(users.map(u => (u._id === editingUser._id ? updated : u)));
      } else {
        // Create new
        const created = await userService.create(data);
        setUsers([...users, created]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save user");
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
    <Box sx={{ p: 4 }}>
       <SettingsHeader title="User Management" sub="Manage staff access and permissions." color={primaryColor}
         action={
            <Button 
              variant="contained" 
              onClick={handleAddClick}
              startIcon={<AddIcon />} 
              sx={{ bgcolor: primaryColor }}
            >
              Invite User
            </Button>
         } 
       />
       
       <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Table>
             <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                   <TableCell sx={{ fontWeight: 'bold' }}>USER</TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>ROLE</TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                   <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                </TableRow>
             </TableHead>
             <TableBody>
                {users.map((user) => {
                   const statusStyle = getStatusColor(user.status);
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
                          <Chip label={user.role} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
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
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(user._id)}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                           </Stack>
                        </TableCell>
                     </TableRow>
                   );
                })}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No users found.</TableCell>
                  </TableRow>
                )}
             </TableBody>
          </Table>
       </TableContainer>

       {/* MODAL */}
       <UserModal 
         open={modalOpen} 
         onClose={() => setModalOpen(false)} 
         onSave={handleSaveUser} 
         user={editingUser} 
         primaryColor={primaryColor} 
       />
    </Box>
  );
}