import React, { useState, useEffect, useMemo } from 'react';
import {
	Box, Paper, Typography, Button, TextField, InputAdornment,
	Chip, IconButton, Grid, Stack, LinearProgress, Avatar,
	Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
	Tooltip, Alert, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // ⚡️ The "3 Dots" Icon

import { useColorMode } from '../../context/ThemeContext';
import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';

// --- STAT CARD ---
const StatCard = ({ title, value, icon, color }) => (
	<Paper
		elevation={0}
		sx={{
			p: 3, borderRadius: 4, border: '1px solid #f1f5f9',
			background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
			position: 'relative', overflow: 'hidden',
			transition: 'transform 0.2s',
			'&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }
		}}
	>
		<Stack direction="row" alignItems="center" spacing={2}>
			<Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				{icon}
			</Box>
			<Box>
				<Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1 }}>{value}</Typography>
				<Typography variant="body2" fontWeight="600" sx={{ color: '#64748b', mt: 0.5 }}>{title}</Typography>
			</Box>
		</Stack>
	</Paper>
);

// --- ⚡️ NEW: ACTION MENU COMPONENT ⚡️ ---
const ActionMenu = ({ row, onAction }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (action) => {
		setAnchorEl(null);
		if (action) {
			onAction(action, row);
		}
	};

	return (
		<>
			<IconButton
				onClick={handleClick}
				size="small"
				sx={{ color: '#94a3b8', '&:hover': { color: '#1e293b', bgcolor: '#f1f5f9' } }}
			>
				<MoreVertIcon />
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => handleClose(null)}
				PaperProps={{
					elevation: 3,
					sx: {
						borderRadius: 3,
						minWidth: 160,
						mt: 1,
						boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
						border: '1px solid #f1f5f9'
					}
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem onClick={() => handleClose('restock')} sx={{ py: 1.5 }}>
					<ListItemIcon><AddCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
					<ListItemText primary="Add Stock" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
				</MenuItem>

				<MenuItem onClick={() => handleClose('consume')} sx={{ py: 1.5 }}>
					<ListItemIcon><RemoveCircleOutlineIcon fontSize="small" sx={{ color: '#f59e0b' }} /></ListItemIcon>
					<ListItemText primary="Use Stock" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
				</MenuItem>

				<MenuItem onClick={() => handleClose('edit')} sx={{ py: 1.5 }}>
					<ListItemIcon><EditOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} /></ListItemIcon>
					<ListItemText primary="Edit Details" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
				</MenuItem>

				<MenuItem onClick={() => handleClose('delete')} sx={{ py: 1.5, color: '#ef4444' }}>
					<ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
					<ListItemText primary="Delete Item" primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
				</MenuItem>
			</Menu>
		</>
	);
};

// --- MAIN PAGE ---
export default function InventoryPage() {
	const { showToast } = useToast();

	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	const [formMode, setFormMode] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [openConsumeModal, setOpenConsumeModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const { primaryColor } = useColorMode();

	const fetchInventory = async () => {
		setLoading(true);
		try {
			const res = await api.get('/inventory');
			setInventory(res.data);
		} catch (error) {
			showToast('Failed to load inventory', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchInventory(); }, []);

	const stats = useMemo(() => {
		const totalItems = inventory.length;
		const lowStock = inventory.filter(i => i.quantity <= i.lowStockThreshold).length;
		const totalValue = inventory.reduce((acc, curr) => acc + (curr.quantity * (curr.costPerUnit || 0)), 0);
		return { totalItems, lowStock, totalValue };
	}, [inventory]);

	// --- HANDLERS ---
	const handleMenuAction = (action, item) => {
		setSelectedItem(item);
		if (action === 'restock') setFormMode('restock');
		if (action === 'edit') setFormMode('edit');
		if (action === 'consume') setOpenConsumeModal(true);
		if (action === 'delete') setOpenDeleteModal(true);
	};

	const handleSave = async (formData) => {
		try {
			if (formMode === 'edit') {
				const res = await api.put(`/inventory/${selectedItem._id}`, formData);
				setInventory(prev => prev.map(i => i._id === selectedItem._id ? res.data : i));
				showToast('Updated successfully', 'success');
			} else {
				const res = await api.post('/inventory', formData);
				if (formMode === 'create') setInventory(prev => [...prev, res.data]);
				else fetchInventory();
				showToast('Saved successfully', 'success');
			}
			setFormMode(null);
		} catch (error) {
			showToast(error.response?.data?.message || 'Error', 'error');
		}
	};

	const handleConsume = async (qty, reason) => {
		if (!selectedItem) return;
		try {
			const res = await api.post(`/inventory/${selectedItem._id}/consume`, { quantity: qty, reason });
			setInventory(prev => prev.map(i => i._id === selectedItem._id ? res.data : i));
			setOpenConsumeModal(false);
			showToast('Stock updated', 'success');
		} catch (error) {
			showToast(error.response?.data?.message || 'Failed', 'error');
		}
	};

	const handleDelete = async () => {
		if (!selectedItem) return;
		try {
			await api.delete(`/inventory/${selectedItem._id}`);
			setInventory(prev => prev.filter(i => i._id !== selectedItem._id));
			setOpenDeleteModal(false);
			showToast('Deleted', 'success');
		} catch (error) {
			showToast('Delete failed', 'error');
		}
	};

	// --- COLUMNS ---
	const columns = [
		{
			field: 'name', headerName: 'PRODUCT', flex: 1.5, minWidth: 250,
			renderCell: (params) => (
				<Stack direction="row" spacing={2} alignItems="center" height="100%">
					<Avatar variant="rounded" sx={{ bgcolor: '#f1f5f9', color: '#475569', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 'bold', borderRadius: 2 }}>
						{params.value.charAt(0)}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight="700" color="#1e293b" sx={{ lineHeight: 1.3, whiteSpace: 'normal', wordBreak: 'break-word' }}>
							{params.value}
						</Typography>
						<Typography variant="caption" color="#94a3b8" fontWeight="600">
							SKU: {params.row._id.slice(-4).toUpperCase()}
						</Typography>
					</Box>
				</Stack>
			)
		},
		{
			field: 'category', headerName: 'CATEGORY', flex: 0.8, minWidth: 140,
			renderCell: (params) => (
				<Box display="flex" alignItems="center" height="100%">
					<Chip
						icon={params.value === 'Medicine' ? <LocalPharmacyOutlinedIcon sx={{ fontSize: '14px !important' }} /> : <ScienceOutlinedIcon sx={{ fontSize: '14px !important' }} />}
						label={params.value} size="small"
						sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, borderRadius: 2 }}
					/>
				</Box>
			)
		},
		{
			field: 'quantity', headerName: 'STOCK', flex: 1, minWidth: 180, headerAlign: 'center', align: 'center',
			renderCell: (params) => {
				const isLow = params.value <= params.row.lowStockThreshold;
				const color = isLow ? '#ef4444' : '#10b981';
				const percent = Math.min((params.value / (params.row.lowStockThreshold * 3)) * 100, 100);
				return (
					<Box width="100%" px={2} display="flex" flexDirection="column" justifyContent="center">
						<Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
							<Typography variant="caption" fontWeight="700" color={color}>{params.value} {params.row.unit}</Typography>
							{isLow && <Chip label="Low" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 'bold' }} />}
						</Stack>
						<LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 4, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
					</Box>
				);
			}
		},
		{
			field: 'costPerUnit', headerName: 'VALUE', width: 130, headerAlign: 'right', align: 'right',
			renderCell: (params) => (
				<Box display="flex" alignItems="center" justifyContent="flex-end" height="100%" width="100%">
					<Typography variant="body2" fontWeight="700" color="#334155" sx={{ pr: 1 }}>
						₹{(params.value * params.row.quantity).toLocaleString('en-IN')}
					</Typography>
				</Box>
			)
		},
		{
			field: 'actions', headerName: 'ACTIONS', width: 80, sortable: false, align: 'center',
			renderCell: (params) => (
				<Box display="flex" alignItems="center" justifyContent="center" height="100%">
					{/* ⚡️ USE THE NEW MENU COMPONENT ⚡️ */}
					<ActionMenu row={params.row} onAction={handleMenuAction} />
				</Box>
			)
		}
	];

	const filteredRows = inventory.filter(row => row.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<Box sx={{ p: 2, maxWidth: '1600px', mx: 'auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>

			{/* HEADER & STATS */}
			<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
				<Box>
					<Typography variant="h5" fontWeight="900" color={primaryColor} letterSpacing="-0.5px">Inventory</Typography>
					<Typography variant="body2" color="#64748b" fontWeight="500">Manage your clinic's supplies.</Typography>
				</Box>
				<Stack direction="row" spacing={2}>
					<TextField
						placeholder="Search..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment> }}
						sx={{ width: 280, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 3, '& fieldset': { borderColor: '#e2e8f0' } } }}
					/>
					<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedItem(null); setFormMode('create'); }}
						sx={{ bgcolor: { primaryColor }, borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 'bold' }}>
						Add Item
					</Button>
				</Stack>
			</Stack>

			<Grid container spacing={3} mb={3}>
				<Grid item xs={12} md={4}><StatCard title="Total Products" value={stats.totalItems} icon={<Inventory2OutlinedIcon fontSize="large" />} color="#3b82f6" /></Grid>
				<Grid item xs={12} md={4}><StatCard title="Low Stock Alerts" value={stats.lowStock} icon={<WarningAmberRoundedIcon fontSize="large" />} color="#ef4444" /></Grid>
				<Grid item xs={12} md={4}><StatCard title="Inventory Value" value={`₹${stats.totalValue.toLocaleString('en-IN')}`} icon={<CurrencyRupeeIcon fontSize="large" />} color="#10b981" /></Grid>
			</Grid>

			<Paper sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden', bgcolor: '#fff' }}>
				<DataGrid
					rows={filteredRows} columns={columns} getRowId={(row) => row._id} getRowHeight={() => 'auto'} autoHeight
					initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick loading={loading}
					sx={{
						border: 'none',
						'& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#64748b', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
						'& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9', color: '#334155', paddingTop: '16px', paddingBottom: '16px' },
						'& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
						'& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': { outline: 'none' }
					}}
				/>
			</Paper>

			{/* MODALS */}
			<InventoryFormModal open={!!formMode} onClose={() => setFormMode(null)} onSave={handleSave} initialData={selectedItem} mode={formMode} />
			<ConsumeStockModal open={openConsumeModal} onClose={() => setOpenConsumeModal(false)} onConfirm={handleConsume} item={selectedItem} />
			<DeleteConfirmModal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} onConfirm={handleDelete} item={selectedItem} />
		</Box>
	);
}

// --- MODALS (Same as before) ---
const InventoryFormModal = ({ open, onClose, onSave, initialData, mode }) => {
	const [formData, setFormData] = useState({ name: '', category: 'Consumable', quantity: 0, unit: 'pcs', lowStockThreshold: 10, costPerUnit: 0 });

	const { primaryColor } = useColorMode();

	useEffect(() => {
		if (open) {
			if (mode === 'create') setFormData({ name: '', category: 'Consumable', quantity: 0, unit: 'pcs', lowStockThreshold: 10, costPerUnit: 0 });
			else if (initialData) setFormData({ name: initialData.name, category: initialData.category, quantity: mode === 'restock' ? 0 : initialData.quantity, unit: initialData.unit, lowStockThreshold: initialData.lowStockThreshold, costPerUnit: initialData.costPerUnit });
		}
	}, [initialData, mode, open]);

	const getTitle = () => { if (mode === 'create') return 'Add New Product'; if (mode === 'restock') return 'Restock Item'; return 'Edit Product'; };

	return (
		<Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4, width: 500, p: 1 } }}>
			<DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>{getTitle()}</DialogTitle>
			<DialogContent>
				{mode === 'restock' && <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>Current Stock: <b>{initialData?.quantity} {initialData?.unit}</b>. Enter amount to add.</Alert>}
				<Stack spacing={2.5} mt={1}>
					<TextField label="Product Name" fullWidth size="small" value={formData.name} disabled={mode === 'restock'} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
					<Stack direction="row" spacing={2}>
						<TextField select label="Category" fullWidth size="small" value={formData.category} disabled={mode === 'restock'} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
							{['Consumable', 'Medicine', 'Instrument', 'Equipment'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
						</TextField>
						<TextField label="Unit Type" fullWidth size="small" value={formData.unit} disabled={mode === 'restock'} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. Box" />
					</Stack>
					<Stack direction="row" spacing={2}>
						<TextField type="number" label={mode === 'restock' ? "Quantity to Add" : "Total Stock"} fullWidth size="small" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} sx={{ '& input': { color: '#16a34a', fontWeight: 'bold' } }} />
						<TextField type="number" label="Low Stock Alert" fullWidth size="small" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} />
					</Stack>
					<TextField type="number" label="Cost Per Unit (₹)" fullWidth size="small" value={formData.costPerUnit} onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
				<Button onClick={() => onSave(formData)} variant="contained" sx={{ bgcolor: { primaryColor }, fontWeight: 'bold', borderRadius: 2, px: 3 }}>Save</Button>
			</DialogActions>
		</Dialog>
	);
};

const DeleteConfirmModal = ({ open, onClose, onConfirm, item }) => (
	<Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4, width: 400, p: 1 } }}>
		<Box sx={{ p: 3, textAlign: 'center' }}>
			<Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', width: 56, height: 56, mx: 'auto', mb: 2 }}><DeleteOutlineIcon fontSize="large" /></Avatar>
			<Typography variant="h6" fontWeight="800" gutterBottom>Delete Product?</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Are you sure you want to delete <b>{item?.name}</b>?</Typography>
			<Stack direction="row" spacing={2} justifyContent="center">
				<Button onClick={onClose} variant="outlined" color="inherit" sx={{ fontWeight: 'bold', borderColor: '#e2e8f0', color: '#64748b' }}>Cancel</Button>
				<Button onClick={onConfirm} variant="contained" color="error" sx={{ fontWeight: 'bold', boxShadow: 'none' }}>Yes, Delete</Button>
			</Stack>
		</Box>
	</Dialog>
);

const ConsumeStockModal = ({ open, onClose, onConfirm, item }) => {
	const [qty, setQty] = useState(1);
	const [reason, setReason] = useState('');
	return (
		<Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4, width: 400, p: 1 } }}>
			<DialogTitle sx={{ fontWeight: 800, color: '#b91c1c' }}>Usage Entry</DialogTitle>
			<DialogContent>
				<Alert severity="warning" icon={<RemoveCircleOutlineIcon />} sx={{ mb: 3, borderRadius: 2 }}>You are using <b>{item?.name}</b></Alert>
				<TextField type="number" label="Quantity Used" fullWidth value={qty} onChange={(e) => setQty(e.target.value)} sx={{ mb: 2 }} />
				<TextField label="Purpose / Patient ID" placeholder="e.g. Procedure for PID-1002" fullWidth multiline rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
				<Button onClick={() => onConfirm(qty, reason)} variant="contained" color="error" sx={{ fontWeight: 'bold', borderRadius: 2, px: 3 }}>Confirm</Button>
			</DialogActions>
		</Dialog>
	);
};