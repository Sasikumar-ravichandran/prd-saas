import React, { useState, useEffect } from 'react';
import {
   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
   Box, Stack, IconButton, Autocomplete, Typography, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';
import { useColorMode } from '../../context/ThemeContext';

const EMPTY_MED = { drugName: '', dosage: '1-0-1', duration: '5 Days', instruction: 'After Food' };
const EMPTY_ROW = [{ ...EMPTY_MED }];
// Added editData prop here
export default function PrescriptionModal({ open, onClose, patientId, onSuccess, editData }) {
   const [meds, setMeds] = useState([{ ...EMPTY_MED }]);
   const [notes, setNotes] = useState('');
   const [drugOptions, setDrugOptions] = useState([]);
   const { showToast } = useToast();
   const { primaryColor } = useColorMode();

   // ⚡️ Load drug catalog AND handle Edit Data Population
   useEffect(() => {
      if (open) {
         // Fetch drugs
         api.get('/prescriptions/drugs').then(res => setDrugOptions(res.data)).catch(console.error);

         // If editing, populate the fields
         if (editData) {
            // Mapping to ensure we only take the fields we need (prevents passing __v or unwanted fields)
            const populatedMeds = editData.medications.map(m => ({
               drugName: m.drugName,
               dosage: m.dosage,
               duration: m.duration,
               instruction: m.instruction
            }));
            setMeds(populatedMeds);
            setNotes(editData.notes || '');
         } else {
            // If new, reset fields
            setMeds([{ ...EMPTY_MED }]);
            setNotes('');
         }
      }
   }, [open, editData]);

   const handleAddRow = () => setMeds([...meds, { ...EMPTY_MED }]);

   const handleRemoveRow = (index) => {
      if (meds.length === 1) return;
      const newMeds = [...meds];
      newMeds.splice(index, 1);
      setMeds(newMeds);
   };

   const handleChange = (index, field, value) => {
      const newMeds = [...meds];
      newMeds[index][field] = value;
      setMeds(newMeds);
   };

   const handleDrugSelect = (index, drug) => {
      if (!drug) return;
      const newMeds = [...meds];
      newMeds[index].drugName = typeof drug === 'string' ? drug : drug.name;
      if (typeof drug !== 'string') {
         newMeds[index].dosage = drug.defaultDosage || '1-0-1';
         newMeds[index].duration = drug.defaultDuration || '5 Days';
         newMeds[index].instruction = drug.instruction || 'After Food';
      }
      setMeds(newMeds);
   };

   const handleSubmit = async () => {
      const cleanMeds = meds.filter(m =>
         m.drugName.trim() !== '' &&
         m.dosage.trim() !== '' &&
         m.duration.trim() !== ''
      );

      if (cleanMeds.length === 0) {
         showToast('Please provide drug name, dosage, and duration for all meds', 'warning');
         return;
      }

      try {
         const userData = localStorage.getItem('user');
         if (!userData) {
            showToast('Session expired. Please login again.', 'error');
            return;
         }

         const user = JSON.parse(userData);
         const payload = {
            patientId,
            doctorId: user._id,
            medications: cleanMeds,
            notes: notes.trim(),
         };

         // ⚡️ SWITCH BETWEEN POST AND PUT
         if (editData) {
            await api.put(`/prescriptions/${editData._id}`, payload);
            showToast('Prescription updated!', 'success');
         } else {
            await api.post('/prescriptions', payload);
            showToast('Prescription saved!', 'success');
         }

         onSuccess();
         onClose(); // Close modal after success
      } catch (error) {
         console.error("Prescription Error:", error);
         const errorMsg = error.response?.data?.message || 'Failed to save';
         showToast(errorMsg, 'error');
      }
   };

   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
         <DialogTitle sx={{ fontWeight: '800', borderBottom: '1px solid #f1f5f9' }}>
            {editData ? 'Edit Prescription' : 'Write Prescription'}
         </DialogTitle>

         <DialogContent sx={{ minHeight: 350, pt: 3 }}>
            <Stack spacing={2} sx={{ mt: 2 }}>
               {meds.map((row, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                     <Box sx={{ flex: 2 }}>
                        <Autocomplete
                           freeSolo
                           options={drugOptions}
                           getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                           // Fixed value selection logic
                           value={row.drugName || ''}
                           onChange={(e, val) => handleDrugSelect(index, val)}
                           renderInput={(params) => (
                              <TextField {...params} label="Drug Name" size="small"
                                 onChange={(e) => handleChange(index, 'drugName', e.target.value)}
                              />
                           )}
                        />
                     </Box>
                     <TextField label="Dosage" size="small" sx={{ flex: 1 }} value={row.dosage} onChange={(e) => handleChange(index, 'dosage', e.target.value)} />
                     <TextField label="Duration" size="small" sx={{ flex: 1 }} value={row.duration} onChange={(e) => handleChange(index, 'duration', e.target.value)} />
                     <TextField label="Instruction" size="small" sx={{ flex: 1 }} value={row.instruction} onChange={(e) => handleChange(index, 'instruction', e.target.value)} />

                     <IconButton color="error" onClick={() => handleRemoveRow(index)} disabled={meds.length === 1}>
                        <DeleteIcon />
                     </IconButton>
                  </Stack>
               ))}

               <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddRow} sx={{ alignSelf: 'flex-start' }}>
                  Add Medicine
               </Button>

               <Divider />

               <TextField
                  label="Notes / Advice"
                  multiline rows={3}
                  fullWidth
                  placeholder="e.g. Drink warm water, avoid hard food..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
               />
            </Stack>
         </DialogContent>

         <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: primaryColor, fontWeight: 'bold', px: 4 }}>
               {editData ? 'Update Prescription' : 'Save Prescription'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}