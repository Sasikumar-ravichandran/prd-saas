import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Stack, 
  Chip, InputAdornment 
} from '@mui/material';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PAYMENT_MODES = [
  { value: 'Cash', icon: <AttachMoneyIcon fontSize="small" /> },
  { value: 'UPI', icon: <QrCodeIcon fontSize="small" /> },
  { value: 'Card', icon: <CreditCardIcon fontSize="small" /> },
  { value: 'Insurance', icon: <AccountBalanceWalletIcon fontSize="small" /> },
];

export default function CollectPaymentModal({ open, onClose, patient, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI'); // Default mode
  const [notes, setNotes] = useState('');

  // Auto-fill the amount with the Total Due when the modal opens
  useEffect(() => {
    if (open && patient) {
      // If balance is positive, pre-fill it. If 0, leave empty.
      setAmount(patient.balance > 0 ? patient.balance.toString() : '');
    }
  }, [open, patient]);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;

    // Send the data back to the parent component
    onPaymentSuccess({
      amount: Number(amount),
      mode,
      date: new Date().toLocaleDateString(),
      notes
    });
    
    // Reset and close
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
      
      {/* HEADER */}
      <DialogTitle sx={{ fontWeight: '800', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWalletIcon color="primary" /> Collect Payment
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        
        {/* BALANCE HIGHLIGHT */}
        <Box sx={{ bgcolor: '#fff7ed', p: 2, borderRadius: 2, border: '1px dashed #fdba74', mb: 3, textAlign: 'center' }}>
           <Typography variant="caption" fontWeight="bold" color="#9a3412" sx={{ letterSpacing: 1 }}>CURRENT DUE</Typography>
           <Typography variant="h4" fontWeight="900" color="#c2410c">₹ {patient?.balance?.toLocaleString() || 0}</Typography>
        </Box>

        <Stack spacing={3}>
            {/* AMOUNT INPUT */}
            <TextField
              label="Amount Receiving"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                sx: { fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' } // Green text for money
              }}
              autoFocus
            />

            {/* PAYMENT MODE SELECTION */}
            <Box>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>PAYMENT MODE</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {PAYMENT_MODES.map((m) => (
                        <Chip 
                            key={m.value}
                            label={m.value}
                            icon={m.icon}
                            onClick={() => setMode(m.value)}
                            // Visual logic: Is this chip selected?
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

            {/* NOTES / TXN ID */}
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

      {/* FOOTER ACTIONS */}
      <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
        <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="success" 
            size="large"
            disabled={!amount || Number(amount) <= 0}
            startIcon={<CheckCircleIcon />}
            sx={{ fontWeight: 'bold', px: 4, borderRadius: 2 }}
        >
            Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}