import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Stack, 
  Chip, InputAdornment, DialogContentText
} from '@mui/material';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ⚡️ IMPORT YOUR SERVICE
import { invoiceService } from '../../api/services/invoiceService';

const PAYMENT_MODES = [
  { value: 'Cash', icon: <AttachMoneyIcon fontSize="small" /> },
  { value: 'UPI', icon: <QrCodeIcon fontSize="small" /> },
  { value: 'Card', icon: <CreditCardIcon fontSize="small" /> },
  { value: 'Insurance', icon: <AccountBalanceWalletIcon fontSize="small" /> },
];

export default function CollectPaymentModal({ open, onClose, patient, initialInvoice, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI'); 
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false); // ⚡️ NEW: Confirmation state

  useEffect(() => {
    if (open && initialInvoice) {
      setAmount(initialInvoice.balance > 0 ? initialInvoice.balance.toString() : '');
    } else if (!open) {
      setAmount('');
      setNotes('');
      setMode('UPI');
      setConfirmOpen(false);
    }
  }, [open, initialInvoice]);

  // ⚡️ NEW: First step, open confirmation
  const handleInitialSubmit = () => {
    if (!amount || Number(amount) <= 0 || !initialInvoice) return;
    setConfirmOpen(true);
  };

  // ⚡️ FIXED: Final submission logic
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await invoiceService.pay(initialInvoice._id, {
        amount: Number(amount),
        paymentMethod: mode,
        reference: notes
      });

      if (onPaymentSuccess) onPaymentSuccess();
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: '800', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" /> Collect Payment
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ bgcolor: '#fff7ed', p: 2, borderRadius: 2, border: '1px dashed #fdba74', mb: 3, textAlign: 'center' }}>
             <Typography variant="caption" fontWeight="bold" color="#9a3412" sx={{ letterSpacing: 1, display: 'block' }}>
                 CURRENT DUE • {initialInvoice?.invoiceNumber || 'Invoice'}
             </Typography>
             <Typography variant="h4" fontWeight="900" color="#c2410c">
                 ₹ {initialInvoice?.balance?.toLocaleString() || 0}
             </Typography>
          </Box>

          <Stack spacing={3}>
              <TextField
                label="Amount Receiving"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  sx: { fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' } 
                }}
                autoFocus
              />

              <Box>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>PAYMENT MODE</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {PAYMENT_MODES.map((m) => (
                          <Chip 
                              key={m.value}
                              label={m.value}
                              icon={m.icon}
                              onClick={() => setMode(m.value)}
                              variant={mode === m.value ? 'filled' : 'outlined'}
                              color={mode === m.value ? 'success' : 'default'}
                              sx={{ 
                                  borderRadius: 2, px: 1, fontWeight: 'bold', border: '1px solid',
                                  borderColor: mode === m.value ? 'transparent' : '#e2e8f0'
                              }}
                          />
                      ))}
                  </Stack>
              </Box>

              <TextField 
                  label="Transaction ID / Notes"
                  placeholder="e.g. UPI Ref: 8273..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  size="small"
                  fullWidth
              />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }} disabled={loading}>
              Cancel
          </Button>
          <Button 
              onClick={handleInitialSubmit} // ⚡️ Triggers confirmation
              variant="contained" 
              color="success" 
              size="large"
              disabled={!amount || Number(amount) <= 0 || loading}
              startIcon={<CheckCircleIcon />}
              sx={{ fontWeight: 'bold', px: 4, borderRadius: 2 }}
          >
              Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* ⚡️ CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to record a payment of <b>₹{amount}</b> for invoice <b>{initialInvoice?.invoiceNumber}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Back</Button>
          <Button onClick={handleSubmit} variant="contained" color="success" disabled={loading}>
            {loading ? 'Processing...' : 'Yes, Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}