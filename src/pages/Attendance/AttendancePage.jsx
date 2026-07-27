import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Stack, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Chip
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../api/services/attendanceService';
import { userService } from '../../api/services/userService';

import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ClearIcon from '@mui/icons-material/Clear';

export default function AttendancePage() {
    const { primaryColor } = useColorMode();
    const { showToast } = useToast();

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [roster, setRoster] = useState([]);

    const [backupRoster, setBackupRoster] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [activeCell, setActiveCell] = useState(null);

    const getDaysInMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const numDays = new Date(year, month, 0).getDate();
        return Array.from({ length: numDays }, (_, i) => `${monthStr}-${(i + 1).toString().padStart(2, '0')}`);
    };

    const daysArray = getDaysInMonth(selectedMonth);

    useEffect(() => {
        const loadRealData = async () => {
            try {
                setLoading(true);
                const [year, month] = selectedMonth.split('-');

                //  1. Fetch staff list using your exact userService
                const staffList = await userService.getAll();
                // 2. Fetch the monthly attendance records
                const records = await attendanceService.getMonthly(month, year);

                // 3. Merge them into the format our UI needs
                const mergedRoster = staffList?.users.map(staff => {
                    const staffAttendance = {};

                    // Find all records for this specific staff member
                    const theirRecords = records.filter(r => r.userId === staff._id);

                    theirRecords.forEach(record => {
                        // Map the date to the status (e.g., { '2026-06-14': 'Paid Leave' })
                        staffAttendance[record.date] = record.status;
                    });

                    return {
                        userId: staff._id,
                        name: staff.fullName || staff.name,
                        role: staff.role,
                        attendance: staffAttendance
                    };
                });

                setRoster(mergedRoster);
            } catch (error) {
                console.error(error);
                showToast("Failed to load real attendance data", "error");
            } finally {
                setLoading(false);
            }
        };

        if (selectedMonth) loadRealData();
    }, [selectedMonth]);

    //  MENU LOGIC
    const openMenu = (event, userId, date) => {
        setMenuAnchor(event.currentTarget);
        setActiveCell({ userId, date });
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setActiveCell(null);
    };

    // UNDO FUNCTION
    const undoBulkAction = () => {
        if (backupRoster) {
            setRoster(backupRoster);
            setBackupRoster(null); // Clear backup after undo
        }
    };

    // FAST TOGGLE LOGIC (Left-Click)
    const handleQuickToggle = (userId, date) => {
        setRoster(prev => prev.map(staff => {
            if (staff.userId !== userId) return staff;

            const currentStatus = staff.attendance[date];
            let newStatus = 'Present'; // 1st click

            if (currentStatus === 'Present') newStatus = 'Absent'; // 2nd click
            else if (currentStatus === 'Absent') newStatus = 'Weekly Off'; // 3rd click
            else if (currentStatus === 'Weekly Off') newStatus = null; // 4th click clears it

            return {
                ...staff,
                attendance: { ...staff.attendance, [date]: newStatus }
            };
        }));
    };

    const handleMenuSelect = (newStatus) => {
        if (activeCell) {
            setRoster(prev => prev.map(staff => {
                if (staff.userId !== activeCell.userId) return staff;
                return {
                    ...staff,
                    attendance: { ...staff.attendance, [activeCell.date]: newStatus }
                };
            }));
        }
        closeMenu();
    };

    const fillUnmarkedAsPresent = () => {
        // 1. Take snapshot
        setBackupRoster(JSON.parse(JSON.stringify(roster)));

        // 2. Perform the update
        setRoster(prev => prev.map(staff => {
            const updated = { ...staff.attendance };
            daysArray.forEach(date => {
                if (!updated[date]) updated[date] = 'Present';
            });
            return { ...staff, attendance: updated };
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const recordsToSave = [];
            roster.forEach(staff => {
                Object.keys(staff.attendance).forEach(date => {
                    if (staff.attendance[date]) {
                        recordsToSave.push({ userId: staff.userId, date, status: staff.attendance[date] });
                    }
                });
            });

            //  FIX: Extract the year and month from the state variable
            const [year, month] = selectedMonth.split('-');

            const payload = {
                month: month, 
                year: year,   
                records: recordsToSave
            };

            await attendanceService.saveMonthlyBulk(payload);

            showToast("Monthly roster saved successfully!", "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to save", "error");
        } finally {
            setSaving(false);
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'Present': return { color: '#bbf7d0', text: '#166534', label: 'P' };
            case 'Absent': return { color: '#fecaca', text: '#991b1b', label: 'A' };
            case 'Unpaid Leave': return { color: '#fed7aa', text: '#9a3412', label: 'UL' };
            case 'Paid Leave': return { color: '#bae6fd', text: '#075985', label: 'PL' };
            case 'Weekly Off': return { color: '#e2e8f0', text: '#475569', label: 'W' };
            default: return { color: '#ffffff', text: 'transparent', label: '' };
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 2 }, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                <Box sx={{ textAlign: 'start' }}>
                    <Typography variant="h5" fontWeight="800" color={primaryColor}>Monthly Roster</Typography>
                    <Typography variant="body2" color="#64748b" fontWeight="600">
                        <b>Left-click</b> a cell to toggle Present/Absent/Off. <br />
                        <b>Right-click</b> a cell to open the advanced menu (Paid/Unpaid Leaves).
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="#475569">Select Month:</Typography>
                    <TextField type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} size="small" sx={{ bgcolor: 'white' }} />
                </Paper>
            </Stack>

            {/*  THE VISUAL LEGEND */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip size="small" label="P = Present" sx={{ bgcolor: '#bbf7d0', color: '#166534', fontWeight: 700, borderRadius: 1 }} />
                <Chip size="small" label="A = Absent" sx={{ bgcolor: '#fecaca', color: '#991b1b', fontWeight: 700, borderRadius: 1 }} />
                <Chip size="small" label="W = Weekly Off" sx={{ bgcolor: '#e2e8f0', color: '#475569', fontWeight: 700, borderRadius: 1 }} />
                <Chip size="small" label="PL = Paid Leave" sx={{ bgcolor: '#bae6fd', color: '#075985', fontWeight: 700, borderRadius: 1 }} />
                <Chip size="small" label="UL = Unpaid Leave" sx={{ bgcolor: '#fed7aa', color: '#9a3412', fontWeight: 700, borderRadius: 1 }} />
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>

                <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        size="small"
                        startIcon={<AutoFixHighIcon />}
                        onClick={fillUnmarkedAsPresent}
                        sx={{ color: '#0284c7', fontWeight: 700, bgcolor: '#e0f2fe' }}
                    >
                        Mark Unmarked as Present
                    </Button>

                    {/*  THIS BUTTON APPEARS ONLY AFTER AN ACTION */}
                    {backupRoster && (
                        <Button
                            size="small"
                            onClick={undoBulkAction}
                            sx={{ color: '#dc2626', fontWeight: 700 }}
                        >
                            Undo Last Action
                        </Button>
                    )}

                    <Box sx={{ flexGrow: 1 }} /> {/* This pushes the save button to the right */}

                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving || roster.length === 0}
                        sx={{ bgcolor: primaryColor, px: 3, borderRadius: 2, fontWeight: 700 }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', maxHeight: '65vh' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: '#f8fafc', fontWeight: 800, color: '#475569', borderRight: '2px solid #e2e8f0', minWidth: 180 }}>STAFF MEMBER</TableCell>
                                    {daysArray.map(date => (
                                        <TableCell key={date} align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 800, color: '#64748b', p: 1, minWidth: 40 }}>
                                            {date.split('-')[2]}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 3, bgcolor: '#f8fafc', fontWeight: 800, color: '#0f172a', borderLeft: '2px solid #e2e8f0', minWidth: 100 }}>SUMMARY</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roster.map((staff) => {
                                    let p = 0, a = 0, w = 0;
                                    Object.values(staff.attendance).forEach(val => {
                                        if (val === 'Present' || val === 'Paid Leave') p++;
                                        if (val === 'Absent' || val === 'Unpaid Leave') a++;
                                        if (val === 'Weekly Off') w++;
                                    });

                                    return (
                                        <TableRow key={staff.userId} hover>
                                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'white', borderRight: '2px solid #e2e8f0' }}>
                                                <Typography variant="body2" fontWeight="700" color="#0f172a">{staff.name}</Typography>
                                                <Typography variant="caption" color="#64748b" fontWeight="600">{staff.role}</Typography>
                                            </TableCell>

                                            {daysArray.map(date => {
                                                const status = staff.attendance[date];
                                                const { color, text, label } = getStatusDetails(status);
                                                return (
                                                    <TableCell key={date} align="center" sx={{ p: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                                                        <Box
                                                            onClick={() => handleQuickToggle(staff.userId, date)}
                                                            // RIGHT CLICK: Advanced Menu
                                                            onContextMenu={(e) => {
                                                                e.preventDefault(); // Stops the normal browser right-click menu
                                                                openMenu(e, staff.userId, date);
                                                            }}
                                                            sx={{
                                                                height: 32, width: '100%', minWidth: 32, bgcolor: color, color: text, borderRadius: 1,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                                border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.75rem', '&:hover': { opacity: 0.8 }
                                                            }}
                                                        >
                                                            {label}
                                                        </Box>
                                                    </TableCell>
                                                );
                                            })}

                                            <TableCell sx={{ position: 'sticky', right: 0, zIndex: 2, bgcolor: 'white', borderLeft: '2px solid #e2e8f0' }}>
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Total Present / Paid Leaves"><Typography variant="caption" fontWeight="800" color="#15803d">{p}P</Typography></Tooltip>
                                                    <Typography variant="caption" color="#cbd5e1">|</Typography>
                                                    <Tooltip title="Total Absent / Unpaid Leaves"><Typography variant="caption" fontWeight="800" color="#dc2626">{a}A</Typography></Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/*  THE CONTEXT MENU THAT APPEARS WHEN CLICKING A CELL */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} PaperProps={{ sx: { width: 200, borderRadius: 2, mt: 1 } }}>
                <MenuItem onClick={() => handleMenuSelect('Present')} sx={{ color: '#166534' }}>
                    <ListItemIcon><CheckCircleIcon sx={{ color: '#166534' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Present</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuSelect('Paid Leave')} sx={{ color: '#075985' }}>
                    <ListItemIcon><EventBusyIcon sx={{ color: '#075985' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Paid Leave</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuSelect('Unpaid Leave')} sx={{ color: '#9a3412' }}>
                    <ListItemIcon><EventBusyIcon sx={{ color: '#9a3412' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Unpaid Leave</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuSelect('Absent')} sx={{ color: '#991b1b' }}>
                    <ListItemIcon><CancelIcon sx={{ color: '#991b1b' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Absent</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuSelect('Weekly Off')} sx={{ color: '#475569' }}>
                    <ListItemIcon><BedtimeIcon sx={{ color: '#475569' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Weekly Off</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuSelect(null)} sx={{ borderTop: '1px solid #f1f5f9' }}>
                    <ListItemIcon><ClearIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Clear Cell</ListItemText>
                </MenuItem>
            </Menu>

        </Box>
    );
}