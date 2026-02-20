import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Tabs, Tab, Stack, Chip, Button, IconButton, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Tooltip, InputAdornment, CircularProgress, Alert, Container
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { patientService } from '../../api/services/patientService';
import api from '../../api/services/api'; // ⚡️ Import API for fetching procedures

// Components
import PatientHeader from '../../components/Patients/PatientHeader';
import AddPatientModal from '../../components/Patients/AddPatientModal';
import Odontogram from '../../components/Clinical/Odontogram';
import PatientLedger from '../../components/Billing/PatientLedger';
import CollectPaymentModal from '../../components/Patients/CollectPaymentModal';
import PrescriptionList from '../../components/Clinical/PrescriptionList';
import PatientHistory from '../../components/Clinical/PatientHistory';
import PatientFiles from '../../components/Clinical/PatientFiles';
import CreateInvoiceModal from '../../components/Billing/CreateInvoiceModal';

// Icons
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import { useToast } from '../../context/ToastContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicationIcon from '@mui/icons-material/Medication';
import FolderIcon from '@mui/icons-material/Folder';

export default function PatientProfile() {
    const { id } = useParams();
    const { primaryColor } = useColorMode();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [tab, setTab] = useState(0);
    
    // ⚡️ NEW: State for dynamic procedures
    const [proceduresList, setProceduresList] = useState([]);

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addTreatmentOpen, setAddTreatmentOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);

    // Form Input
    const [newTreatment, setNewTreatment] = useState({ tooth: '', procedure: '', cost: '' });

    // Canvas State
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // --- 1. FETCH DATA ---
    const fetchPatientDetails = async () => {
        try {
            if (!patientData) setLoading(true);
            setError(null);
            const data = await patientService.getById(id);
            setPatientData(data);
        } catch (err) {
            console.error("Failed to fetch patient details", err);
            setError("Patient not found or server error.");
        } finally {
            setLoading(false);
        }
    };

    // ⚡️ Fetch Procedures
    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                const res = await api.get('/procedures');
                // Filter out inactive procedures
                const activeProcedures = (res.data || []).filter(p => p.isActive !== false);
                setProceduresList(activeProcedures);
            } catch (err) {
                console.error("Failed to load procedures", err);
                showToast("Failed to load procedure list", "warning");
            }
        };

        fetchProcedures();
        if (id) fetchPatientDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // --- 2. DERIVED STATE ---
    const treatmentPlan = patientData?.treatmentPlan || [];

    const toothStatus = useMemo(() => {
        const statusMap = {};
        treatmentPlan.forEach(item => {
            if (item.status === 'Proposed') statusMap[item.tooth] = 'planned';       
            else if (item.status === 'In Progress') statusMap[item.tooth] = 'active'; 
            else if (item.status === 'Completed') statusMap[item.tooth] = 'completed'; 
        });
        return statusMap;
    }, [treatmentPlan]);

    const totalEstimate = treatmentPlan.reduce((sum, item) => sum + Number(item.cost), 0);
    const proposedItemsCount = treatmentPlan.filter(i => i.status === 'Proposed').length;

    // --- 3. API HANDLERS ---
    const handleAddTreatment = async () => {
        if (!newTreatment.tooth || !newTreatment.procedure) return;

        try {
            setSubmitting(true);
            const payload = {
                tooth: newTreatment.tooth,
                procedure: newTreatment.procedure,
                cost: Number(newTreatment.cost),
                status: 'Proposed'
            };

            const updatedPatient = await patientService.addTreatment(id, payload);
            setPatientData(updatedPatient);
            showToast('Treatment added to plan', 'success');
            setAddTreatmentOpen(false);
            setNewTreatment({ tooth: '', procedure: '', cost: '' });
        } catch (err) {
            showToast('Failed to add treatment', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveAndStart = async () => {
        try {
            setSubmitting(true);
            const updatedPatient = await patientService.startAllTreatments(id);
            setPatientData(updatedPatient);
            showToast(`${proposedItemsCount} procedures started. Balance updated.`, 'success');
        } catch (err) {
            showToast('Failed to start treatments', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (treatmentId) => {
        try {
            const updatedPatient = await patientService.deleteTreatment(id, treatmentId);
            setPatientData(updatedPatient);
            showToast('Procedure removed.', 'warning');
        } catch (err) {
            showToast('Failed to delete item', 'error');
        }
    };

    const handleRevertItem = async (treatmentId) => {
        try {
            const updatedPatient = await patientService.updateTreatmentStatus(id, treatmentId, 'Proposed');
            setPatientData(updatedPatient);
            showToast('Item reverted to Plan.', 'info');
        } catch (err) {
            showToast('Failed to revert item', 'error');
        }
    };

    const handlePaymentSuccess = () => {
        fetchPatientDetails();
        setPaymentModalOpen(false);
        showToast('Payment recorded successfully!', 'success');
    };

    const handleChartAction = (action, toothId) => {
        if (action === 'plan_treatment') {
            setNewTreatment({ tooth: toothId, procedure: '', cost: '' });
            setAddTreatmentOpen(true);
        }
    };

    // Zoom Handlers
    const handleZoom = (delta) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.5), 2.5) }));
    const handleResetView = () => setTransform({ x: 0, y: 0, scale: 1 });
    const handleMouseDown = (e) => { setIsDragging(true); dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }; };
    const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })); };
    const handleMouseUp = () => setIsDragging(false);

    // --- RENDER ---
    if (loading) {
        return (
            <Box sx={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={40} sx={{ color: primaryColor }} />
            </Box>
        );
    }

    if (error || !patientData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.history.back()}>Go Back</Button>}>
                    {error || "Patient not found."}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ height: tab === 0 ? 'calc(100vh - 64px)' : 'auto', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>

            <Box sx={{ flexShrink: 0, bgcolor: 'white', pt: 2 }}>
                <Box sx={{ px: 3, mb: 0 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/patients')}
                        size="small"
                        sx={{
                            color: '#64748b',
                            fontWeight: '700',
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
                        }}
                    >
                        Back to Patients
                    </Button>
                </Box>
                <PatientHeader patient={patientData} onEdit={() => setEditModalOpen(true)} />
            </Box>

            {/* TABS */}
            <Box sx={{ flexShrink: 0, borderBottom: '1px solid #e2e8f0', px: 3, bgcolor: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 48 }} TabIndicatorProps={{ style: { backgroundColor: primaryColor, height: 3 } }}>
                    <Tab icon={<MedicalServicesIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Clinical Charting" sx={{ fontWeight: 700 }} />
                    <Tab icon={<HistoryIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="History" sx={{ fontWeight: 700 }} />
                    <Tab icon={<MedicationIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Prescription" sx={{ fontWeight: 700 }} />
                    <Tab icon={<FolderIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Files" sx={{ fontWeight: 700 }} />
                    <Tab icon={<ReceiptLongIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Billing" sx={{ fontWeight: 700 }} />
                </Tabs>
            </Box>

            {/* WORKSPACE */}
            <Box sx={{ flex: 1, display: tab === 0 ? 'flex' : 'block', position: 'relative', overflow: 'visible' }}>

                {/* --- TAB 0: CHARTING --- */}
                {tab === 0 && (
                    <>
                        {/* LEFT: CANVAS */}
                        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                            <Paper elevation={3} sx={{ position: 'absolute', top: 20, left: 20, zIndex: 20, p: 0.5, borderRadius: 2, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <IconButton size="small" onClick={() => handleZoom(0.2)}><ZoomInIcon /></IconButton>
                                <IconButton size="small" onClick={() => handleZoom(-0.2)}><ZoomOutIcon /></IconButton>
                                <Divider orientation="vertical" flexItem variant="middle" />
                                <IconButton size="small" onClick={handleResetView}><CenterFocusStrongIcon /></IconButton>
                            </Paper>

                            <Box
                                sx={{ flex: 1, width: '100%', height: '25%', cursor: isDragging ? 'grabbing' : 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                            >
                                <Box sx={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out', transformOrigin: 'center center', pointerEvents: 'none' }}>
                                    <Box sx={{ pointerEvents: 'auto' }}>
                                        <Odontogram initialStates={toothStatus} onAction={handleChartAction} />
                                    </Box>
                                </Box>
                            </Box>

                            <Paper square sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: 4, zIndex: 10 }}>
                                <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3b82f6' }} /><Typography variant="caption" fontWeight="bold">Planned</Typography></Stack>
                                <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} /><Typography variant="caption" fontWeight="bold">Active</Typography></Stack>
                                <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} /><Typography variant="caption" fontWeight="bold">Completed</Typography></Stack>
                            </Paper>
                        </Box>

                        {/* RIGHT: SIDEBAR */}
                        <Box sx={{ width: 380, borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: 'white', height: '100%', maxHeight: 400, zIndex: 15 }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Treatment Plan</Typography>
                                    <Typography variant="caption" color="text.secondary">{proposedItemsCount} Items Proposed</Typography>
                                </Box>
                                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTreatmentOpen(true)} sx={{ borderRadius: 2 }}>Add</Button>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {treatmentPlan.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>No treatments added yet.</Typography>
                                )}
                                {treatmentPlan.map((item) => (
                                    <Box key={item._id} sx={{ p: 2, borderBottom: '1px solid #f1f5f9', position: 'relative', '&:hover': { bgcolor: '#f8fafc' }, transition: '0.1s' }}>
                                        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: item.status === 'In Progress' ? '#f59e0b' : (item.status === 'Completed' ? '#22c55e' : '#3b82f6') }} />
                                        <Stack direction="row" justifyContent="space-between" mb={1} alignItems="center">
                                            <Chip label={`Tooth #${item.tooth}`} size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.7rem', fontWeight: 'bold', bgcolor: '#f1f5f9', color: '#64748b' }} />
                                            <Typography variant="caption" fontWeight="bold" color={item.status === 'In Progress' ? 'warning.main' : 'primary.main'}>{item.status}</Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight="700" color="#1e293b" sx={{ mb: 1 }}>{item.procedure}</Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" fontWeight="800">₹ {item.cost.toLocaleString()}</Typography>
                                            <Stack direction="row">
                                                {item.status === 'Proposed' && (
                                                    <Tooltip title="Delete Item">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteItem(item._id)}>
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {item.status === 'In Progress' && (
                                                    <Tooltip title="Mistake? Undo to Plan.">
                                                        <IconButton size="small" color="warning" onClick={() => handleRevertItem(item._id)}>
                                                            <UndoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight="600">Total Estimate</Typography>
                                    <Typography variant="h6" fontWeight="900" color={primaryColor}>₹ {totalEstimate.toLocaleString()}</Typography>
                                </Stack>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : (proposedItemsCount > 0 ? <CheckCircleIcon /> : <PlayArrowIcon />)}
                                    onClick={handleApproveAndStart}
                                    disabled={proposedItemsCount === 0 || submitting}
                                    sx={{ bgcolor: '#0f172a', py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                >
                                    {submitting ? "Processing..." : (proposedItemsCount > 0 ? `Approve & Start` : 'All Active')}
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
                {tab === 1 && (
                    <Box sx={{ width: '100%', minHeight: '80vh', p: 0, bgcolor: '#fff' }}>
                        <PatientHistory patient={patientData} onRefresh={fetchPatientDetails} />
                    </Box>
                )}
                {tab === 2 && (
                    <Box sx={{ width: '100%', minHeight: '80vh', p: 0 }}>
                        <PrescriptionList patientId={patientData._id} />
                    </Box>
                )}
                {tab === 3 && (
                    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#fff' }}>
                        <PatientFiles patient={patientData} onRefresh={fetchPatientDetails} />
                    </Box>
                )}
                {/* --- TAB 4: BILLING --- */}
                {tab === 4 && (
                    <Box sx={{ width: '100%', minHeight: '80vh', p: 3, bgcolor: '#f8fafc' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="800">Financial Summary</Typography>
                            <Button
                                variant="contained"
                                startIcon={<ReceiptLongIcon />}
                                onClick={() => setCreateInvoiceModalOpen(true)}
                                sx={{ bgcolor: primaryColor, borderRadius: 2 }}
                            >
                                Generate Invoice
                            </Button>
                        </Stack>

                        <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <PatientLedger onCollectPayment={() => setPaymentModalOpen(true)} patient={patientData} />
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* --- ADD TREATMENT MODAL --- */}
            <Dialog open={addTreatmentOpen} onClose={() => setAddTreatmentOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}>
                <DialogTitle sx={{ fontWeight: '800', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Add Treatment
                    <IconButton size="small" onClick={() => setAddTreatmentOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1, overflow: 'visible' }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField 
                            label="Tooth Number" 
                            value={newTreatment.tooth} 
                            onChange={(e) => setNewTreatment({ ...newTreatment, tooth: e.target.value })} 
                            fullWidth 
                            placeholder="e.g. 46" 
                            autoFocus 
                            InputProps={{ sx: { fontWeight: 'bold' } }} 
                        />
                        <FormControl fullWidth>
                            <InputLabel id="procedure-label">Select Procedure</InputLabel>
                            <Select
                                labelId="procedure-label"
                                value={newTreatment.procedure}
                                label="Select Procedure"
                                onChange={(e) => { 
                                    // ⚡️ Find the procedure dynamically from the fetched list
                                    const proc = proceduresList.find(p => p.name === e.target.value); 
                                    if(proc) {
                                        setNewTreatment({ 
                                            ...newTreatment, 
                                            procedure: proc.name, 
                                            cost: proc.price // Map DB 'price' to UI 'cost'
                                        });
                                    }
                                }}
                                MenuProps={{ disablePortal: false, PaperProps: { sx: { maxHeight: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: 2, mt: 1, zIndex: 9999 } }, style: { zIndex: 1400 } }}
                            >
                                {proceduresList.length === 0 ? (
                                    <MenuItem disabled>No active procedures found</MenuItem>
                                ) : (
                                    proceduresList.map((proc) => (
                                        <MenuItem key={proc._id} value={proc.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                                            <Typography variant="body2" fontWeight="600">{proc.name}</Typography>
                                            <Typography variant="caption" fontWeight="bold" color="primary.main">₹{proc.price}</Typography>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Estimated Cost" 
                            value={newTreatment.cost} 
                            type="number" 
                            fullWidth 
                            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true, sx: { bgcolor: '#f8fafc', fontWeight: 'bold' } }} 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#fafafa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                    <Button onClick={() => setAddTreatmentOpen(false)} sx={{ fontWeight: 'bold', color: '#64748b' }}>Cancel</Button>
                    <Button onClick={handleAddTreatment} variant="contained" disabled={!newTreatment.tooth || !newTreatment.procedure || submitting} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', bgcolor: '#0f172a' }}>
                        {submitting ? "Adding..." : "Add to Plan"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* OTHER MODALS */}
            <AddPatientModal open={editModalOpen} onClose={() => setEditModalOpen(false)} initialData={patientData} onSubmit={fetchPatientDetails} />
            <CollectPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} patient={patientData} onPaymentSuccess={handlePaymentSuccess} />
            <CreateInvoiceModal
                open={createInvoiceModalOpen}
                onClose={() => setCreateInvoiceModalOpen(false)}
                patientId={patientData._id}
                doctorId={patientData?.doctorId || patientData?.assignedDoctor}
                onSuccess={() => {
                    fetchPatientDetails();
                }}
            />
        </Box>
    );
}