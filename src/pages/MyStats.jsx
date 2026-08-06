import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, CircularProgress, Divider,
    Select, MenuItem, FormControl, LinearProgress, Chip,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Stack, Avatar, alpha
} from '@mui/material';
import { format, subMonths } from 'date-fns';
import api from '../api/services/api';
import { useColorMode } from '../context/ThemeContext';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import StatsCardSkeleton from '../components/Skeletons/StatsCardSkeleton';
import TableSkeleton from '../components/Skeletons/TableSkeleton';


export default function MyStats() {
    const { primaryColor } = useColorMode();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    const monthOptions = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), i);
        return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
    });

    useEffect(() => {
        const fetchMyStats = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/users/my-stats?month=${selectedMonth}`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyStats();
    }, [selectedMonth]);


    if (loading && !stats) {
        return (
            <Box sx={{ p: 1, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

                <Box sx={{ p: 1, maxWidth: '1600px' }}>
                    <Stack spacing={4}>
                        <StatsCardSkeleton count={2} />

                        <Box sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <TableSkeleton rowCount={5} columnCount={4} />
                        </Box>
                    </Stack>
                </Box>
            </Box>
        );
    }

    if (!stats) return <Typography p={4} variant="body1">Failed to load stats.</Typography>;

    const isDoctor = stats.role === 'Doctor' || stats.role === 'doctor';

    //  Build the KPI array exactly like your Financial Dashboard
    const kpiData = [
        {
            label: 'TOTAL PAYOUT',
            value: `₹ ${stats?.financials?.totalEstimatedPayout?.toLocaleString()}`,
            icon: <AccountBalanceWalletIcon fontSize="small" />,
            color: primaryColor,
            bg: alpha(primaryColor, 0.1)
        },
        {
            label: 'DAYS PRESENT',
            value: `${stats?.attendance?.daysPresent}`,
            icon: <FactCheckIcon fontSize="small" />,
            color: '#10b981',
            bg: '#ecfdf5'
        },
        {
            label: 'UNPAID LEAVES',
            value: `${stats.attendance.lopDays}`,
            icon: <EventBusyIcon fontSize="small" />,
            color: '#ef4444',
            bg: '#fef2f2'
        }
    ];

    if (isDoctor) {
        kpiData.push({
            label: 'TREATMENTS DONE',
            value: `${stats?.doctorStats?.treatmentsDone}`,
            icon: <MedicalServicesIcon fontSize="small" />,
            color: '#f59e0b',
            bg: '#fffbeb'
        });
    }

    return (
        <Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* HEADER SECTION */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={2}>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h4" fontWeight="700" sx={{ color: primaryColor, letterSpacing: '-0.02em', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                        My Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
                        Attendance and payroll overview for {stats.month}
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        sx={{ borderRadius: 1.5, fontWeight: '600', fontSize: '0.9rem' }}
                    >
                        {monthOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.9rem' }}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} mb={4}>
                {kpiData.map((kpi, idx) => (
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
                                <Typography variant="caption" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em' }}>
                                    {kpi.label}
                                </Typography>
                                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1.2, mt: 0.5 }}>
                                    {kpi.value}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* DETAILED SECTIONS */}
            <Grid container spacing={3}>

                {/*  FIX: Updated to use 'size' prop. Takes 4 cols for Doctors, 12 cols for Receptionists */}
                <Grid size={{ xs: 12, md: isDoctor ? 4 : 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em' }} mb={3}>
                            PAYROLL BREAKDOWN
                        </Typography>

                        <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary" fontWeight="600">Base Salary</Typography>
                                <Typography variant="body2" fontWeight="700" color="#0f172a">₹{stats?.financials?.baseSalary?.toLocaleString()}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary" fontWeight="600">LOP Deductions</Typography>
                                <Typography variant="body2" color="error" fontWeight="700">- ₹{stats?.financials?.lopDeduction?.toLocaleString()}</Typography>
                            </Box>

                            {isDoctor && (
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary" fontWeight="600">Treatment Commission</Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="700">+ ₹{stats?.financials?.commissionEarned?.toLocaleString()}</Typography>
                                </Box>
                            )}
                        </Stack>

                        <Divider sx={{ my: 2.5, borderColor: '#e2e8f0' }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Net Payout</Typography>
                            <Typography variant="h6" fontWeight="800" color={primaryColor}>
                                ₹{stats?.financials?.totalEstimatedPayout?.toLocaleString()}
                            </Typography>
                        </Box>
                    </Paper>

                    {stats.attendance.lopDetails.length > 0 && (
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #fee2e2', bgcolor: '#fff5f5' }}>
                            <Typography variant="caption" fontWeight="800" color="error" sx={{ letterSpacing: '0.05em' }} display="block" mb={2}>
                                LEAVE DEDUCTION DATES
                            </Typography>
                            <Stack spacing={1.5}>
                                {stats.attendance.lopDetails.map((log, idx) => (
                                    <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" fontWeight="700" color="#0f172a">
                                            {format(new Date(log.date), 'MMM dd, yyyy')}
                                        </Typography>
                                        <Chip label={log.status} color="error" variant="outlined" size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: '700' }} />
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    )}
                </Grid>

                {/* RIGHT COLUMN: Doctor Analytics */}
                {isDoctor && (
                    //  FIX: Updated to use 'size' prop (Takes the remaining 8 cols to equal 12)
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em' }} mb={3}>
                                TOP PERFORMING PROCEDURES
                            </Typography>

                            {stats?.doctorStats?.topProcedures.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No procedures completed this month.</Typography>
                            ) : (
                                <Grid container spacing={3}>
                                    {stats?.doctorStats?.topProcedures.map((proc, idx) => {
                                        const maxEarned = stats?.doctorStats?.topProcedures[0].earned;
                                        const progress = (proc.earned / maxEarned) * 100;
                                        return (
                                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2" fontWeight="700" color="#334155" noWrap>
                                                        {proc._id} <Typography component="span" variant="caption" color="text.secondary">({proc.count})</Typography>
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="800" color="#0f172a">
                                                        ₹{proc?.earned?.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: primaryColor, borderRadius: 3 } }}
                                                />
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box p={2.5} borderBottom="1px solid #e2e8f0" bgcolor="#f8fafc">
                                <Typography variant="subtitle2" fontWeight="800" color="#64748b" sx={{ letterSpacing: '0.05em' }}>
                                    TREATMENT & COMMISSION HISTORY
                                </Typography>
                            </Box>

                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', bgcolor: '#fff' }}>DATE</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', bgcolor: '#fff' }}>PATIENT</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', bgcolor: '#fff' }}>PROCEDURE</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', bgcolor: '#fff' }}>COMMISSION</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats?.doctorStats?.recentActivity.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                                    <Typography variant="body2">No treatments recorded this month.</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            stats?.doctorStats?.recentActivity.map((activity, idx) => (
                                                <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ whiteSpace: 'nowrap', py: 2, color: '#475569', fontSize: '0.85rem' }}>
                                                        {format(new Date(activity.date), 'MMM dd, yyyy')}
                                                    </TableCell>

                                                    <TableCell sx={{ py: 2 }}>
                                                        <Typography variant="body2" fontWeight="700" color="#0f172a">
                                                            {activity.patientName || 'Unknown Patient'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                                            {activity.invoiceNumber || 'No Inv'}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ fontWeight: 600, color: '#334155', py: 2, fontSize: '0.85rem' }}>
                                                        {activity.procedure}
                                                    </TableCell>

                                                    <TableCell align="right" sx={{ fontWeight: 800, color: 'success.main', py: 2, fontSize: '0.9rem' }}>
                                                        + ₹{activity?.earned?.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}