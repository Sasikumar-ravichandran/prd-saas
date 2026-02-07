import React, { useState } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Switch, Chip, Typography, TextField, Stack, Tooltip, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsHeader from '../components/SettingsHeader';
import ProcedureModal from '../modals/ProcedureModal';
import { useColorMode } from '../../../context/ThemeContext';

const INITIAL_PROCEDURES = [
  { id: 1, code: 'RCT-01', name: 'Root Canal (Anterior)', price: 4500, tax: 0, comm: 50, lab: 0, active: true },
  { id: 2, code: 'CRN-Z',  name: 'Zirconia Crown',        price: 8500, tax: 0, comm: 40, lab: 1200, active: true },
  { id: 3, code: 'IMP-O',  name: 'Osstem Implant',        price: 25000, tax: 18, comm: 30, lab: 8000, active: true },
  { id: 4, code: 'SCL-01', name: 'Scaling & Polishing',   price: 1500, tax: 0, comm: 60, lab: 0, active: true },
];

export default function ServiceCatalogTab() {
  const { primaryColor } = useColorMode();
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);

  const handleAddClick = () => { setEditingProcedure(null); setModalOpen(true); };
  const handleEditClick = (row) => { setEditingProcedure(row); setModalOpen(true); };
  
  const handleDeleteClick = (id) => {
    if(window.confirm("Delete this procedure?")) {
      setProcedures(procedures.filter(p => p.id !== id));
    }
  };

  const handleSaveProcedure = (data) => {
    if (editingProcedure) {
      setProcedures(procedures.map(p => (p.id === editingProcedure.id ? { ...data, id: p.id } : p)));
    } else {
      const newId = procedures.length > 0 ? Math.max(...procedures.map(p => p.id)) + 1 : 1;
      setProcedures([...procedures, { ...data, id: newId }]);
    }
    setModalOpen(false);
  };

  const handleToggleActive = (id) => {
    setProcedures(procedures.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

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
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>PROCEDURE</TableCell>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>PRICE</TableCell>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>COMM %</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>ACTION</TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {procedures.map((row) => (
                  <TableRow key={row.id} hover>
                     <TableCell padding="checkbox">
                       <Switch size="small" checked={row.active} onChange={() => handleToggleActive(row.id)}
                         sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor } }} />
                     </TableCell>
                     <TableCell><Chip label={row.code} size="small" sx={{ borderRadius: 1, fontWeight: 'bold' }} /></TableCell>
                     <TableCell><Typography variant="body2" fontWeight="600">{row.name}</Typography></TableCell>
                     <TableCell><Typography variant="body2" fontWeight="bold">₹ {row.price}</Typography></TableCell>
                     <TableCell><Typography variant="body2">{row.comm}%</Typography></TableCell>
                     <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                           <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                           <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(row.id)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </TableContainer>
      <ProcedureModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveProcedure} procedure={editingProcedure} primaryColor={primaryColor} />
    </Box>
  );
}