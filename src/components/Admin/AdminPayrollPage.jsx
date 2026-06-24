import React, { useState, useEffect } from 'react';
import {
	Box, Paper, Typography, Stack, Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
	IconButton, CircularProgress, Alert, Divider, Grid, MenuItem, TextField, Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import api from '../../api/services/api';
import AddExpenseModal from '../../pages/modal/AddExpenseModal';
import { payrollService } from '../../api/services/payrollService';
import { useColorMode } from '../../context/ThemeContext';


export default function AdminPayrollPage() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	const { primaryColor } = useColorMode();

	const now = new Date();
	const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
	const [filterYear, setFilterYear] = useState(now.getFullYear());

	const [filterMode, setFilterMode] = useState('monthly'); // 'monthly' | 'custom'
	const [dateRange, setDateRange] = useState({
		start: new Date().toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	});

	const [ledgerOpen, setLedgerOpen] = useState(false);
	const [selectedDoc, setSelectedDoc] = useState(null);

	const [expenseModalOpen, setExpenseModalOpen] = useState(false);
	const [expenseDefaults, setExpenseDefaults] = useState({});

	const months = [
		{ val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
		{ val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
		{ val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
		{ val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
	];

	const loadFinancials = async () => {
		try {
			setLoading(true);

			// Ensure we send all parameters clearly
			const params = {
				mode: filterMode,
				month: filterMonth,
				year: filterYear,
				startDate: dateRange.start,
				endDate: dateRange.end
			};

			const res = await payrollService.getPayrollReport(params);
			console.log(res,'+++++++++++')
			setData(res);
		} catch (error) {
			console.error("Failed to load financials", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { loadFinancials(); }, [filterMonth, filterYear, filterMode, dateRange]);

	const handleOpenLedger = (staff) => {
		setSelectedDoc(staff);
		setLedgerOpen(true);
	};

	const handlePayStaff = (staff) => {
		setExpenseDefaults({
			amount: staff.payoutDue,
			category: 'Salaries',
			vendor: `Payroll: ${staff.name} (${data?.period?.label})`,
			paymentMethod: 'Bank Transfer'
		});
		setExpenseModalOpen(true);
	};

	if (loading && !data) return <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

	return (
		<Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

			{/* ⚡️ HEADER & FILTERS */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', md: 'center' }}
				spacing={2}
				mb={4}
			>
				{/* LEFT: Title Area */}
				<Box sx={{ textAlign: 'left' }}>
					<Typography variant="h5" fontWeight="800" color={primaryColor} sx={{ letterSpacing: '-0.02em' }}>
						Financial & Payroll Overview
					</Typography>
					<Typography variant="body2" color="#64748b" fontWeight="600">
						Profit & Loss report for {data?.period?.label}
					</Typography>
				</Box>

				{/* RIGHT: Unified Control Panel */}
				<Paper
					elevation={0}
					sx={{
						display: 'flex',
						alignItems: 'center',
						p: 0.5,
						borderRadius: 3,
						// border: '1px solid #e2e8f0',
						// bgcolor: 'white',
						gap: 1
					}}
				>
					{/* Toggle Segment */}
					<Stack direction="row" spacing={0.5} p={0.5} borderRadius={2}>
						<Button
							size="small"
							variant={filterMode === 'monthly' ? 'contained' : 'text'}
							onClick={() => setFilterMode('monthly')}
							sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, boxShadow: filterMode === 'monthly' ? 1 : 0 }}
						>Monthly</Button>
						<Button
							size="small"
							variant={filterMode === 'custom' ? 'contained' : 'text'}
							onClick={() => setFilterMode('custom')}
							sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, boxShadow: filterMode === 'custom' ? 1 : 0 }}
						>Custom</Button>
					</Stack>

					<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

					{/* Input Segment */}
					{filterMode === 'monthly' ? (
						<Stack direction="row" spacing={1} sx={{ px: 1 }}>
							<TextField select size="small" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} sx={{ width: 120 }}>
								{months.map((m) => <MenuItem key={m.val} value={m.val}>{m.label}</MenuItem>)}
							</TextField>
							<TextField type="number" size="small" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} sx={{ width: 80 }} />
						</Stack>
					) : (
						<Stack direction="row" spacing={1} sx={{ px: 1 }}>
							<TextField type="date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} sx={{ width: 140 }} />
							<TextField type="date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} sx={{ width: 140 }} />
						</Stack>
					)}
				</Paper>
			</Stack>

			{/* ⚡️ MASTER SAAS METRICS ROW */}
			{/* ⚡️ MASTER SAAS METRICS ROW (2x2 on Mobile, 4x1 on Desktop) */}
			<Grid container spacing={3} mb={4}>
				{[
					{ label: 'GROSS REVENUE', value: data?.metrics?.grossRevenue, icon: <AccountBalanceIcon fontSize="small" />, color: '#10b981', bg: '#ecfdf5' },
					{ label: 'OPERATING EXPENSES', value: data?.metrics?.operatingExpenses, icon: <StorefrontIcon fontSize="small" />, color: '#f59e0b', bg: '#fffbeb' },
					{ label: 'TOTAL PAYROLL', value: data?.metrics?.totalPayrollDue, icon: <GroupsIcon fontSize="small" />, color: '#8b5cf6', bg: '#f3e8ff' },
					{ label: 'NET PROFIT', value: data?.metrics?.netProfit, icon: <TrendingUpIcon fontSize="small" />, color: data?.metrics?.netProfit >= 0 ? '#3b82f6' : '#ef4444', bg: data?.metrics?.netProfit >= 0 ? '#eff6ff' : '#fef2f2' }
				].map((kpi, idx) => (
					// ⚡️ FIX: Use 'size' prop for Grid v2
					<Grid size={{ xs: 6, md: 3 }} key={idx}>
						<Paper
							elevation={0}
							sx={{
								p: 2.5,
								borderRadius: 3,
								border: '1px solid #e2e8f0',
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								bgcolor: 'white',
								height: '100%',
								transition: 'transform 0.2s',
								'&:hover': { transform: 'translateY(-2px)' }
							}}
						>
							<Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: 44, height: 44, borderRadius: 2 }}>
								{kpi.icon}
							</Avatar>
							<Box>
								<Typography variant="caption" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em' }}>{kpi.label}</Typography>
								<Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1.2, mt: 0.5 }}>
									₹ {kpi.value?.toLocaleString() || 0}
								</Typography>
							</Box>
						</Paper>
					</Grid>
				))}
			</Grid>

			{/* PAYROLL DETAILS TABLE */}
			
			<Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
				<TableContainer>
					<Table sx={{ minWidth: 800 }}>
						<TableHead>
							<TableRow sx={{ bgcolor: '#f8fafc' }}>
								{['STAFF MEMBER', 'ROLE', 'COMPENSATION PLAN', 'REVENUE GENERATED', 'PAYOUT DUE', 'ACTIONS'].map(h => (
									<TableCell key={h} sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>{h}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{/* ⚡️ Professional Empty State */}
							{(!data?.payroll || data.payroll.length === 0) ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 8 }}>
										<Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', color: '#94a3b8', mx: 'auto', mb: 2 }}>
											<AssignmentIndIcon fontSize="large" />
										</Avatar>
										<Typography variant="subtitle1" fontWeight="700" color="#334155">No active staff found</Typography>
										<Typography variant="body2" color="text.secondary">Make sure staff are assigned to this branch and have active contracts.</Typography>
									</TableCell>
								</TableRow>
							) : (
								data.payroll.map((staff) => (
									<TableRow key={staff.staffId} hover sx={{ transition: 'background-color 0.2s' }}>
										<TableCell sx={{ fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9' }}>{staff.name}</TableCell>
										<TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
											<Chip label={staff.role} size="small" sx={{ bgcolor: staff.role === 'doctor' ? '#e0e7ff' : '#f3e8ff', color: staff.role === 'doctor' ? '#4f46e5' : '#9333ea', fontWeight: 700, fontSize: '0.7rem' }} />
										</TableCell>
										<TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #f1f5f9' }}>
											<Chip label={staff.compType} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5, borderColor: '#cbd5e1', color: '#475569', fontSize: '0.7rem' }} />
										</TableCell>
										<TableCell sx={{ fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
											{staff.revenueGenerated > 0 ? `₹ ${staff.revenueGenerated.toLocaleString()}` : '-'}
										</TableCell>
										<TableCell sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9' }}>
											₹ {staff.payoutDue.toLocaleString()}
										</TableCell>
										<TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
											<Stack direction="row" spacing={1}>
												{(staff.role === 'doctor' || staff.totalCommission > 0) && (
													<Button size="small" variant="outlined" startIcon={<ReceiptLongIcon />} onClick={() => handleOpenLedger(staff)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, color: '#475569', borderColor: '#cbd5e1' }}>
														Inspect
													</Button>
												)}
												<Button size="small" variant="contained" startIcon={<PaidIcon />} onClick={() => handlePayStaff(staff)} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 700, borderRadius: 1.5, boxShadow: 'none' }}>
													Pay
												</Button>
											</Stack>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* DRILL-DOWN LEDGER MODAL */}
			<Dialog open={ledgerOpen} onClose={() => setLedgerOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 3, px: 3 }}>
					<Box>
						<Typography variant="h6" fontWeight="800">Compensation Breakdown</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight="600">{selectedDoc?.name} • {selectedDoc?.compType}</Typography>
					</Box>
					<IconButton onClick={() => setLedgerOpen(false)} sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
				</DialogTitle>

				<Box sx={{ px: 3, pb: 2 }}>
					<Stack direction="row" spacing={2} sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="caption" fontWeight="800" color="#64748b">BASE SALARY</Typography>
							<Typography variant="h6" fontWeight="800" color="#0f172a">₹ {selectedDoc?.baseSalary?.toLocaleString() || 0}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem />
						<Box sx={{ flex: 1 }}>
							<Typography variant="caption" fontWeight="800" color="#64748b">COMMISSIONS EARNED</Typography>
							<Typography variant="h6" fontWeight="800" color="#4f46e5">+ ₹ {selectedDoc?.totalCommission?.toLocaleString() || 0}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem />
						<Box sx={{ flex: 1, textAlign: 'right' }}>
							<Typography variant="caption" fontWeight="800" color="#dc2626">TOTAL PAYOUT</Typography>
							<Typography variant="h5" fontWeight="800" color="#dc2626">= ₹ {selectedDoc?.payoutDue?.toLocaleString() || 0}</Typography>
						</Box>
					</Stack>
				</Box>

				<DialogContent sx={{ p: 0, borderTop: '1px solid #e2e8f0' }}>
					{selectedDoc?.ledger?.length === 0 ? (
						<Alert severity="info" sx={{ m: 3, borderRadius: 2 }}>No commission-based procedures found for this month.</Alert>
					) : (
						<Table size="small" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
							<TableHead>
								<TableRow sx={{ bgcolor: '#f8fafc' }}>
									<TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DATE</TableCell>
									<TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PATIENT</TableCell>
									<TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PROCEDURE</TableCell>
									<TableCell sx={{ fontWeight: 800, color: '#64748b' }}>COLLECTED</TableCell>
									<TableCell align="right" sx={{ fontWeight: 800, color: '#4f46e5' }}>DOCTOR'S CUT</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{selectedDoc?.ledger?.map((item, idx) => (
									<TableRow key={idx} hover>
										<TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{new Date(item.date).toLocaleDateString()}</TableCell>
										<TableCell sx={{ fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>{item.patientName}</TableCell>
										<TableCell sx={{ fontWeight: 500, color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{item.procedure}</TableCell>
										<TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>₹{item.amountCollected.toLocaleString()}</TableCell>
										<TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9' }}>₹{item.doctorCut.toLocaleString()}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</DialogContent>
			</Dialog>

			<AddExpenseModal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} initialData={expenseDefaults} onSuccess={loadFinancials} />
		</Box>
	);
}