import React, { useState } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Avatar, Typography, Chip, Stack, Tooltip, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsHeader from '../components/SettingsHeader';
import UserModal from '../modals/UserModal';
import { useColorMode } from '../../../context/ThemeContext';

const INITIAL_USERS = [
  { id: 1, name: 'Dr. Ramesh', email: 'ramesh@clinic.com', role: 'Doctor', status: 'Active' },
  { id: 2, name: 'Divya S', email: 'reception@clinic.com', role: 'Receptionist', status: 'Active' },
  { id: 3, name: 'Admin User', email: 'admin@clinic.com', role: 'Administrator', status: 'Active' },
];

export default function UserManagementTab() {
  const { primaryColor } = useColorMode();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Handlers
  const handleAddClick = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to remove this user? They will lose access immediately.")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSaveUser = (data) => {
    if (editingUser) {
      // Update existing
      setUsers(users.map(u => (u.id === editingUser.id ? { ...data, id: u.id } : u)));
    } else {
      // Create new
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers([...users, { ...data, id: newId }]);
    }
    setModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: '#dcfce7', color: '#166534' };
      case 'Inactive': return { bg: '#f1f5f9', color: '#64748b' };
      case 'Pending': return { bg: '#fff7ed', color: '#c2410c' };
      default: return { bg: '#f1f5f9', color: '#000' };
    }
  };

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
                     <TableRow key={user.id} hover>
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
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(user.id)}>
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