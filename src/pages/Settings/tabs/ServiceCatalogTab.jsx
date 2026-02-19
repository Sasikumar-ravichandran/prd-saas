import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Chip, Typography, Stack, Tooltip, IconButton, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsHeader from '../components/SettingsHeader';
import ProcedureModal from '../modals/ProcedureModal';
import { useColorMode } from '../../../context/ThemeContext';
import { procedureService } from '../../../api/services/procedureService'; 
import { useToast } from '../../../context/ToastContext';

export default function ServiceCatalogTab() {
  const { primaryColor } = useColorMode();

  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);

  const { showToast } = useToast();

  // --- 1. FETCH DATA ---
  const fetchProcedures = async () => {
    try {
      setLoading(true);
      const data = await procedureService.getAll();
      setProcedures(data);
    } catch (err) {
      console.error("Failed to load catalog", err);
      setError("Failed to load procedure list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  // --- HANDLERS ---
  const handleAddClick = () => {
    setEditingProcedure(null);
    setModalOpen(true);
  };

  const handleEditClick = (row) => {
    setEditingProcedure(row);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this procedure?")) {
      try {
        await procedureService.delete(id);
        setProcedures(procedures.filter(p => p._id !== id)); 
        showToast('Procedure deleted.', 'success');
      } catch (err) {
        showToast("Failed to delete procedure", 'error');
      }
    }
  };

  const handleSaveProcedure = async (data) => {
    try {
      if (editingProcedure) {
        // Update
        const updated = await procedureService.update(editingProcedure._id, data);
        setProcedures(procedures.map(p => (p._id === editingProcedure._id ? updated : p)));
      } else {
        // Create
        const created = await procedureService.create(data);
        setProcedures([...procedures, created]);
      }
      showToast('Procedure saved.', 'success');
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save procedure", 'error');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setProcedures(procedures.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
    try {
      await procedureService.update(id, { isActive: !currentStatus });
    } catch (err) {
      setProcedures(procedures.map(p => p._id === id ? { ...p, isActive: currentStatus } : p));
      showToast("Failed to update status", 'error');
    }
  };

  // ⚡️ Helper for Category Colors
  const getCategoryColor = (cat) => {
     switch(cat) {
        case 'General': return { bg: '#f1f5f9', c: '#475569' };
        case 'Endodontics': return { bg: '#fee2e2', c: '#b91c1c' }; // Red
        case 'Orthodontics': return { bg: '#dbeafe', c: '#1d4ed8' }; // Blue
        case 'Surgery': return { bg: '#ffedd5', c: '#c2410c' }; // Orange
        case 'Prosthetics': return { bg: '#f3e8ff', c: '#7e22ce' }; // Purple
        default: return { bg: '#f1f5f9', c: '#475569' };
     }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <SettingsHeader title="Service Catalog" sub="Configure treatments and pricing." color={primaryColor}
        action={<Button variant="contained" onClick={handleAddClick} startIcon={<AddIcon />} sx={{ bgcolor: primaryColor }}>Add Procedure</Button>} />

      <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>STATUS</TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>CODE</TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>CATEGORY</TableCell> {/* ⚡️ NEW */}
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>PROCEDURE</TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>PATIENT PRICE</TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>LAB COST</TableCell> {/* ⚡️ NEW */}
              <TableCell align="right" sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {procedures.map((row) => {
              const catStyle = getCategoryColor(row.category);
              return (
                <TableRow key={row._id} hover>
                  <TableCell padding="checkbox">
                    <Switch size="small" checked={row.isActive} onChange={() => handleToggleActive(row._id, row.isActive)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor } }} />
                  </TableCell>
                  <TableCell>
                      <Chip label={row.code} size="small" sx={{ borderRadius: 1, fontWeight: 'bold', fontSize: '0.75rem' }} />
                  </TableCell>
                  
                  {/* ⚡️ NEW: Category Column */}
                  <TableCell>
                      <Chip 
                        label={row.category || 'General'} 
                        size="small" 
                        sx={{ bgcolor: catStyle.bg, color: catStyle.c, fontWeight: 'bold', fontSize: '0.7rem' }} 
                      />
                  </TableCell>

                  <TableCell><Typography variant="body2" fontWeight="600">{row.name}</Typography></TableCell>
                  
                  <TableCell>
                      <Typography variant="body2" fontWeight="bold">₹ {row.price}</Typography>
                  </TableCell>

                  {/* ⚡️ NEW: Lab Cost (Gray color to show it's an expense) */}
                  <TableCell>
                      {row.labCost > 0 ? (
                        <Typography variant="body2" color="text.secondary">₹ {row.labCost}</Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">-</Typography>
                      )}
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(row._id)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {procedures.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No procedures found. Add one to get started.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProcedureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProcedure}
        procedure={editingProcedure}
        primaryColor={primaryColor}
      />
    </Box>
  );
}