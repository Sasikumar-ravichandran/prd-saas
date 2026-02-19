import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MedicationIcon from '@mui/icons-material/Medication';
import api from '../../api/services/api';
import PrescriptionModal from './PrescriptionModal';
import { useToast } from '../../context/ToastContext';
import moment from 'moment';
import { useColorMode } from '../../context/ThemeContext';

export default function PrescriptionList({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // State for Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const { showToast } = useToast();
  const { primaryColor } = useColorMode();

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(res.data);
    } catch (error) {
      console.error("Error loading prescriptions", error);
    }
  };

  const handleEdit = (prescription) => {
    console.log(prescription,'###')
    setEditData(prescription);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditData(null); // Clear edit data on close
  };

  useEffect(() => { fetchPrescriptions(); }, [patientId]);

  // Open the dialog instead of calling window.confirm
  const requestDelete = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirm.id;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => p._id !== id));
      showToast('Prescription deleted', 'success');
    } catch (error) {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handlePrint = (p) => {
    alert(`Printing prescription for ${moment(p.date).format('DD MMM YYYY')}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="800">Prescriptions</Typography>
          <Typography variant="body2" color="text.secondary">Manage medication history for this patient.</Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: primaryColor, fontWeight: 'bold', borderRadius: 2 }}
        >
          New Prescription
        </Button>
      </Stack>

      {/* List Container */}
      {prescriptions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary">No prescriptions recorded yet.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {prescriptions.map((p) => (
            <Paper key={p._id} sx={{ p: 2, borderRadius: 3, border: '1px solid #f1f5f9', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, color: '#3b82f6' }}>
                    <MedicationIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="800" color="#1e293b">
                      {moment(p.date).format('DD MMM YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Dr. {p.doctorId?.fullName || 'Unknown'}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<PrintIcon />} onClick={() => handlePrint(p)} sx={{ color: '#64748b' }}>
                    Print
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleEdit(p)}
                    sx={{ color: primaryColor, fontWeight: 'bold' }}
                  >
                    Edit
                  </Button>
                  <IconButton size="small" color="error" onClick={() => requestDelete(p._id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Box sx={{ mt: 2, pl: 7 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {p.medications.map((med, idx) => (
                    <Chip
                      key={idx}
                      label={`${med.drugName} (${med.dosage})`}
                      size="small"
                      sx={{ borderRadius: 1, bgcolor: '#f1f5f9', fontWeight: 500 }}
                    />
                  ))}
                </Stack>
                {p.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Note: {p.notes}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* New Prescription Modal */}
      <PrescriptionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        patientId={patientId}
        onSuccess={() => { fetchPrescriptions(); setOpenModal(false); }}
        editData={editData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this prescription? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, id: null })}
            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}