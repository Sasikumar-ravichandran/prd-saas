import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, IconButton, Tooltip, Typography, Box, Button,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions //  Added Dialog imports
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// Removed PaymentIcon import as it wasn't being used in the final render
import { invoiceService } from '../../api/services/invoiceService';
import { useToast } from '../../context/ToastContext';

export default function PatientLedger({ patient, onCollectPayment, onRefresh }) {
    const { showToast } = useToast();
    const invoices = patient?.invoices || [];

    //  State for our custom confirmation modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [invoiceToVoid, setInvoiceToVoid] = useState(null);
    const [isVoiding, setIsVoiding] = useState(false);

    // Helper to color-code status chips
    const getStatusColor = (status) => {
        if (status === 'Paid') return 'success';
        if (status === 'Partial') return 'warning';
        if (status === 'Void') return 'default';
        return 'error'; // Unpaid
    };

    //  1. Open the modal instead of the browser alert
    const handleVoidClick = (invoiceId) => {
        setInvoiceToVoid(invoiceId);
        setConfirmOpen(true);
    };

    //  2. Execute the void action when they click "Confirm" in the modal
    const executeVoid = async () => {
        if (!invoiceToVoid) return;

        setIsVoiding(true);
        try {
            await invoiceService.void(invoiceToVoid);
            showToast("Invoice voided successfully", "success");
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            showToast("Failed to void invoice", "error");
        } finally {
            setIsVoiding(false);
            setConfirmOpen(false);
            setInvoiceToVoid(null);
        }
    };

    if (invoices.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No invoices generated yet.</Typography>
            </Box>
        );
    }

    return (
        <>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Balance Due</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice._id} hover sx={{ opacity: invoice.status === 'Void' ? 0.5 : 1 }}>
                                <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={invoice.status}
                                        size="small"
                                        color={getStatusColor(invoice.status)}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="right">₹{invoice.finalAmount}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: invoice.balance > 0 ? 'error.main' : 'inherit' }}>
                                    ₹{invoice.balance}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View / Print">
                                        <IconButton size="small" color="primary">
                                            <PrintIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    {invoice.balance > 0 && invoice.status !== 'Void' && (
                                        <Tooltip title="Collect Payment">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => onCollectPayment(invoice)}
                                                sx={{ ml: 1, minWidth: 0, px: 1 }}
                                            >
                                                Pay
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {invoice.status === 'Unpaid' && (
                                        <Tooltip title="Void Invoice">
                                            {/*  Triggers the custom modal */}
                                            <IconButton size="small" color="error" onClick={() => handleVoidClick(invoice._id)}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/*  CUSTOM CONFIRMATION MODAL */}
            <Dialog
                open={confirmOpen}
                onClose={() => !isVoiding && setConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 2, padding: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Void Invoice?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to void this invoice? This will set the balance to 0 and unlock the treatments so they can be billed again.
                        <strong> This action cannot be undone.</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        color="inherit"
                        disabled={isVoiding}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={executeVoid}
                        color="error"
                        variant="contained"
                        disabled={isVoiding}
                        sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {isVoiding ? "Voiding..." : "Yes, Void Invoice"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}