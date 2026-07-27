import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import {
  Box, Grid, TextField, Button, CircularProgress, InputAdornment,
  Divider, Typography, Card, CardContent, IconButton, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Alert, Tooltip,
  Switch, FormControlLabel, FormGroup
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
import EventSeatIcon from '@mui/icons-material/EventSeat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

// Context & Services
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/services/api';
import { setBranches } from '../../../redux/slices/authSlice';
import { whatsappService } from '../../../api/services/whatsappService';
import { AVAILABLE_EVENTS } from "../../../constants"

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

  // WhatsApp Testing State
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState({ type: '', msg: '' });

  // Branch Form Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchSaving, setBranchSaving] = useState(false);

  // Delete Confirmation Dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Main Clinic Form ( Extracted watch, setValue, getValues for WhatsApp)
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm();

  // Watch the switch state to show/hide the Twilio fields
  const whatsappEnabled = watch("whatsappConfig.whatsappEnabled");

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

      // This automatically populates the whatsappConfig fields if they exist in the DB!
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

  // --- 2. CLINIC SAVE (Saves Profile + WhatsApp Settings!) ---
  const onSubmitClinic = async (data) => {
    try {
      setSaving(true);
      await settingService.updateClinic(data);
      showToast("Clinic settings updated successfully", "success");
    } catch (err) {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testPhone) return setTestStatus({ type: 'error', msg: 'Please provide a test phone number.' });
    setTestLoading(true);
    setTestStatus({ type: '', msg: '' });

    try {
      // Pull current typed values directly from the form state
      const currentConfig = getValues("whatsappConfig");

      //  FIXED: Using the service instead of direct API call
      await whatsappService.testConnection({
        ...currentConfig,
        testPhoneNumber: testPhone
      });

      setTestStatus({ type: 'success', msg: 'Verification text dispatched! Check your WhatsApp.' });
    } catch (err) {
      setTestStatus({ type: 'error', msg: err.response?.data?.message || 'Twilio connection failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  // --- 3. BRANCH HANDLERS ---
  const handleOpenDialog = (branch = null) => {
    setEditingBranch(branch);
    if (branch) {
      resetBranch({ ...branch, chairCount: branch.chairCount || 1 });
    } else {
      resetBranch({ branchName: '', branchCode: '', phone: '', address: '', chairCount: 1 });
    }
    setOpenDialog(true);
  };

  const onSubmitBranch = async (data) => {
    try {
      setBranchSaving(true);
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
    <Box sx={{ p: 1, maxWidth: 1000 }}>

      {/* ================= MAIN FORM: CLINIC + WHATSAPP ================= */}
      <form onSubmit={handleSubmit(onSubmitClinic)}>
        <SettingsHeader
          title="Clinic Profile"
          sub="Manage your legal business details and automation settings."
          color={primaryColor}
          action={
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{ bgcolor: primaryColor, fontWeight: 'bold' }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          }
        />

        {/* CLINIC DETAILS */}
        <Box sx={{ mb: 4 }}>

          {/* ROW 1: Clinic ID & Legal Name */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth label="Clinic ID" disabled InputLabelProps={{ shrink: true }}
                {...register("clinicId")}
                InputProps={{ startAdornment: (<InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>) }}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#f1f5f9' } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField fullWidth label="Legal Name" placeholder="Smile Care Pvt Ltd" InputLabelProps={{ shrink: true }} {...register("legalName")} />
            </Box>
          </Box>

          {/* ROW 2: Brand Name & GSTIN */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <TextField fullWidth label="Brand Name" placeholder="Smile Care" InputLabelProps={{ shrink: true }} {...register("name", { required: true })} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField fullWidth label="GSTIN" placeholder="33AABC..." InputLabelProps={{ shrink: true }} {...register("gstin")} />
            </Box>
          </Box>

          {/* ROW 3: Phone (Odd item out) */}
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <TextField fullWidth label="Phone" placeholder="+91..." InputLabelProps={{ shrink: true }} {...register("phone")} />
            </Box>
            {/* Empty Box to force the Phone field to stay at 50% width on desktop */}
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
          </Box>

        </Box>

        <Divider sx={{ my: 4 }} />

        {/*  WHATSAPP AUTOMATION SECTION */}
        <Box sx={{ mb: 3, }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WhatsAppIcon sx={{ color: '#25D366' }} /> WhatsApp Automation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex' }}>
            Configure your custom Twilio gateway parameters to send automated notifications to patients.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={whatsappEnabled || false}
                onChange={(e) => setValue("whatsappConfig.whatsappEnabled", e.target.checked, { shouldDirty: true })}
                color="success"
              />
            }
            label={<Typography fontWeight={600}  >Enable Automated WhatsApp Notifications</Typography>}
            sx={{ mb: 3, display: 'flex' }}
          />

          {whatsappEnabled && (
            <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Twilio Account SID" placeholder="ACxxxxxxxxxxxxxx" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} {...register("whatsappConfig.twilioAccountSid")} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="password" label="Twilio Auth Token" placeholder="••••••••••••••••" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} {...register("whatsappConfig.twilioAuthToken")} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Twilio Sender Number" placeholder="+14155238886" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} {...register("whatsappConfig.twilioSenderNumber")} />
                </Grid>

                {/* Test Sandbox */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'white', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>Connection Sandbox Verification</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Input your personal WhatsApp number with country code (e.g., +91xxxxxxxxx) to run a simulated delivery test before saving.
                    </Typography>

                    {testStatus.msg && <Alert severity={testStatus.type} sx={{ mb: 2, borderRadius: 2 }}>{testStatus.msg}</Alert>}

                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField size="small" placeholder="+919876543210" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} sx={{ flex: 1, maxWidth: 300 }} />
                      <Button variant="outlined" color="inherit" onClick={handleTestConnection} disabled={testLoading} startIcon={<SendIcon />} sx={{ borderRadius: 2, height: 40, textTransform: 'none', fontWeight: 600 }}>
                        {testLoading ? <CircularProgress size={20} /> : "Test Gateway"}
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 0.5, color: '#0f172a' }}>
                  Message Templates & Triggers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select which events trigger an automated message. The template text MUST match your pre-approved Twilio templates exactly.
                </Typography>
              </Box>

              <FormGroup sx={{ gap: 2.5 }}>
                {AVAILABLE_EVENTS.map((event) => {
                  const isEventEnabled = watch(`whatsappConfig.triggers.${event.id}.enabled`);

                  return (
                    <Box
                      key={event.id}
                      sx={{
                        p: 3,
                        bgcolor: isEventEnabled ? 'white' : '#f1f5f9',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: isEventEnabled ? primaryColor : '#e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body1" fontWeight="800" color={isEventEnabled ? '#0f172a' : 'text.secondary'}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.desc}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              color="primary"
                              {...register(`whatsappConfig.triggers.${event.id}.enabled`)}
                            />
                          }
                          label={<Typography variant="caption" fontWeight="bold">{isEventEnabled ? "ON" : "OFF"}</Typography>}
                          labelPlacement="start"
                          sx={{ m: 0 }}
                        />
                      </Box>

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter your approved Twilio template here..."
                        InputLabelProps={{ shrink: true }}
                        {...register(`whatsappConfig.triggers.${event.id}.template`)}
                        disabled={!isEventEnabled}
                        sx={{
                          mb: 2,
                          '& .MuiInputBase-root': { bgcolor: isEventEnabled ? '#f8fafc' : '#e2e8f0' }
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>
                          Usable Variables:
                        </Typography>
                        {event.variables.map(v => (
                          <Chip
                            key={v}
                            size="small"
                            label={v}
                            sx={{
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              bgcolor: isEventEnabled ? `${primaryColor}15` : '#cbd5e1',
                              color: isEventEnabled ? primaryColor : '#475569',
                              borderRadius: 1
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </FormGroup>

            </Box>
          )}
        </Box>

        {/* <Divider sx={{ my: 4 }} /> */}

        {/* <Box sx={{ mb: 3 }}> */}
          {/* <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <DocumentScannerIcon sx={{ color: '#6366f1' }} /> Document AI (OCR)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable automated form scanning. You get 1,500 free scans per day by generating your own Google Gemini API key. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get your free key here</a>.
          </Typography> */}

          {/* <FormControlLabel
            control={
              <Switch
                checked={watch("aiConfig.enabled") || false}
                onChange={(e) => setValue("aiConfig.enabled", e.target.checked, { shouldDirty: true })}
                color="primary"
              />
            }
            label={<Typography fontWeight={600}>Enable AI Form Scanner</Typography>}
            sx={{ mb: 3, display: 'flex' }}
          /> */}

          {/* Only show the key input if they enable it */}
          {/* {watch("aiConfig.enabled") && (
            <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Google AI Studio API Key"
                    placeholder="AIzaSy..."
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: 'white' }}
                    {...register("aiConfig.geminiApiKey")}
                  />
                </Grid>
              </Grid>
            </Box>
          )} */}
        {/* </Box> */}


      </form>
      {/* ================= END OF MAIN FORM ================= */}

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
        <Button variant="outlined" startIcon={<AddCircleIcon />} onClick={() => handleOpenDialog()} sx={{ borderColor: primaryColor, color: primaryColor, fontWeight: 'bold' }}>
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
              <Card variant="outlined" sx={{ borderRadius: 3, border: isCurrentBranch ? `2px solid ${primaryColor}` : '1px solid #e0e0e0', bgcolor: isCurrentBranch ? '#f0f9ff' : 'white' }}>
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
                      <Chip label={branch.branchCode} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 'bold', borderRadius: 1 }} />
                      <Chip icon={<EventSeatIcon sx={{ fontSize: '14px !important', color: '#475569' }} />} label={`${branch.chairCount || 1} Chairs`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 'bold', borderRadius: 1 }} />
                    </Stack>
                  </Box>

                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(branch)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Tooltip title={isCurrentBranch ? "Cannot delete active branch" : (isOnlyBranch ? "Must have at least one branch" : "Delete Branch")}>
                      <span>
                        <IconButton size="small" color="error" onClick={() => initiateDelete(branch)} disabled={isCurrentBranch || isOnlyBranch}>
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

      {/* ================= ADD/EDIT BRANCH DIALOG ================= */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitBranch(onSubmitBranch)}>
          <DialogTitle fontWeight="bold">{editingBranch ? "Edit Branch Details" : "Add New Branch"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Branch Name" {...registerBranch("branchName", { required: true })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth type="number" label="No. of Chairs" InputProps={{ inputProps: { min: 1, max: 50 } }} {...registerBranch("chairCount", { required: true, min: 1 })} />
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

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
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
          <TextField fullWidth size="small" placeholder="Type DELETE" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} error={deleteConfirmationText.length > 0 && deleteConfirmationText !== 'DELETE'} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteConfirmationText !== 'DELETE'} onClick={confirmDelete}>
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}