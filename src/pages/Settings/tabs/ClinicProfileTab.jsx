import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux'; 
import {
  Box, Grid, TextField, Button, CircularProgress, InputAdornment,
  Divider, Typography, Card, CardContent, IconButton, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Alert, Tooltip
} from '@mui/material';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import StoreIcon from '@mui/icons-material/Store';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import EventSeatIcon from '@mui/icons-material/EventSeat'; // ⚡️ NEW ICON FOR CHAIRS

// Context & Services
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/services/api';
import { setBranches } from '../../../redux/slices/authSlice'; 

export default function ClinicProfileTab() {
  const { primaryColor } = useColorMode();
  const { showToast } = useToast();
  const dispatch = useDispatch(); 

  // Get currently active branch to prevent deletion
  const activeBranchId = localStorage.getItem('activeBranchId');

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranchesLocal] = useState([]); 

  // Branch Form Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchSaving, setBranchSaving] = useState(false);

  // Delete Confirmation Dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Main Clinic Form
  const { register, handleSubmit, reset } = useForm();

  // Branch Form
  const {
    register: registerBranch,
    handleSubmit: handleSubmitBranch,
    reset: resetBranch,
  } = useForm();

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [clinicData, branchData] = await Promise.all([
        settingService.getClinic(),
        api.get('/branches')
      ]);

      if (clinicData) reset(clinicData);

      if (branchData.data) {
        setBranchesLocal(branchData.data); 
        dispatch(setBranches(branchData.data));
      }

    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. CLINIC SAVE ---
  const onSubmitClinic = async (data) => {
    try {
      setSaving(true);
      await settingService.updateClinic(data);
      showToast("Clinic profile updated successfully", "success");
    } catch (err) {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- 3. BRANCH HANDLERS ---
  const handleOpenDialog = (branch = null) => {
    setEditingBranch(branch);
    if (branch) {
      // ⚡️ Set existing data (fallback chairCount to 1 if it doesn't exist yet)
      resetBranch({ ...branch, chairCount: branch.chairCount || 1 });
    } else {
      // ⚡️ Default new branch to 1 chair
      resetBranch({ branchName: '', branchCode: '', phone: '', address: '', chairCount: 1 });
    }
    setOpenDialog(true);
  };

  const onSubmitBranch = async (data) => {
    console.log(data,'######')
    try {
      setBranchSaving(true);
      // Ensure chairCount is sent as a number
      const payload = { ...data, chairCount: Number(data.chairCount) };

      if (editingBranch) {
        await api.put(`/branches/${editingBranch._id}`, payload);
        showToast("Branch updated", "success");
      } else {
        await api.post('/branches', payload);
        showToast("New branch created", "success");
      }

      fetchData();
      setOpenDialog(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save branch", "error");
    } finally {
      setBranchSaving(false);
    }
  };

  // --- 4. SAFE DELETE LOGIC ---
  const initiateDelete = (branch) => {
    if (branches.length <= 1) {
      showToast("You must have at least one branch.", "error");
      return;
    }
    if (branch._id === activeBranchId) {
      showToast("Cannot delete the currently active branch. Switch branches first.", "error");
      return;
    }

    setBranchToDelete(branch);
    setDeleteConfirmationText('');
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText !== 'DELETE') return;

    try {
      await api.delete(`/branches/${branchToDelete._id}`);
      showToast(`Branch ${branchToDelete.branchName} deleted`, "success");
      setDeleteDialog(false);
      setBranchToDelete(null);
      fetchData();
    } catch (err) {
      showToast("Could not delete branch. Ensure it has no active appointments.", "error");
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1000 }}>

      {/* CLINIC DETAILS FORM */}
      <form onSubmit={handleSubmit(onSubmitClinic)}>
        <SettingsHeader
          title="Clinic Profile"
          sub="Manage your legal business details."
          color={primaryColor}
          action={
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{ bgcolor: primaryColor, fontWeight: 'bold' }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          }
        />

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Clinic ID" disabled
              InputLabelProps={{ shrink: true }}
              {...register("clinicId")}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiInputBase-root': { bgcolor: '#f1f5f9' } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Legal Name" placeholder="Smile Care Pvt Ltd"
              InputLabelProps={{ shrink: true }} {...register("legalName")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Brand Name" placeholder="Smile Care"
              InputLabelProps={{ shrink: true }} {...register("name", { required: true })}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth label="GSTIN" placeholder="33AABC..."
              InputLabelProps={{ shrink: true }} {...register("gstin")}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth label="Phone" placeholder="+91..."
              InputLabelProps={{ shrink: true }} {...register("phone")}
            />
          </Grid>
        </Grid>
      </form>

      <Divider sx={{ my: 4 }} />

      {/* BRANCH MANAGEMENT HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="primary" /> Branch Locations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage multiple locations and resources for this clinic.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderColor: primaryColor, color: primaryColor, fontWeight: 'bold' }}
        >
          Add Branch
        </Button>
      </Box>

      {/* BRANCH LIST GRID */}
      <Grid container spacing={2}>
        {branches.map((branch) => {
          const isCurrentBranch = branch._id === activeBranchId;
          const isOnlyBranch = branches.length === 1;

          return (
            <Grid item xs={12} md={6} key={branch._id}>
              <Card variant="outlined" sx={{
                borderRadius: 3,
                border: isCurrentBranch ? `2px solid ${primaryColor}` : '1px solid #e0e0e0',
                bgcolor: isCurrentBranch ? '#f0f9ff' : 'white'
              }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {branch.branchName || branch.name}
                      </Typography>
                      {isCurrentBranch && (
                        <Chip label="Current" size="small" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }} />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <StoreIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {branch.address || "No Address"}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip
                        label={branch.branchCode}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 'bold', borderRadius: 1 }}
                        />
                        {/* ⚡️ DISPLAY CHAIR COUNT ON CARD */}
                        <Chip
                        icon={<EventSeatIcon sx={{ fontSize: '14px !important', color: '#475569' }} />}
                        label={`${branch.chairCount || 1} Chairs`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 'bold', borderRadius: 1 }}
                        />
                    </Stack>
                  </Box>

                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(branch)}>
                      <EditIcon fontSize="small" />
                    </IconButton>

                    {/* DELETE BUTTON */}
                    <Tooltip title={isCurrentBranch ? "Cannot delete active branch" : (isOnlyBranch ? "Must have at least one branch" : "Delete Branch")}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => initiateDelete(branch)}
                          disabled={isCurrentBranch || isOnlyBranch}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ================= ADD/EDIT DIALOG ================= */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitBranch(onSubmitBranch)}>
          <DialogTitle fontWeight="bold">
            {editingBranch ? "Edit Branch Details" : "Add New Branch"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Branch Name" {...registerBranch("branchName", { required: true })} />
              </Grid>
              {/* ⚡️ NEW CHAIR INPUT */}
              <Grid item xs={12} sm={3}>
                <TextField 
                    fullWidth 
                    type="number"
                    label="No. of Chairs" 
                    InputProps={{ inputProps: { min: 1, max: 50 } }}
                    {...registerBranch("chairCount", { required: true, min: 1 })} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" {...registerBranch("phone", { required: true })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" multiline rows={2} {...registerBranch("address", { required: true })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={branchSaving} sx={{ bgcolor: primaryColor }}>
              {branchSaving ? <CircularProgress size={24} color="inherit" /> : "Save Branch"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= DANGER: DELETE CONFIRMATION DIALOG ================= */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action is permanent. All patients, appointments, and records linked to
            <strong> {branchToDelete?.branchName}</strong> branch will be lost forever.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To confirm, please type <strong>DELETE</strong> in the box below:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Type DELETE"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            error={deleteConfirmationText.length > 0 && deleteConfirmationText !== 'DELETE'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteConfirmationText !== 'DELETE'}
            onClick={confirmDelete}
          >
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}