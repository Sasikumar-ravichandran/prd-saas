// src/components/Auth/AuthBrandVisuals.jsx
import React from 'react';
import { Box, Typography, Drawer, IconButton } from '@mui/material';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PieChartIcon from '@mui/icons-material/PieChart';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';

// 1. Shared Data: We keep this here so both components can use it
const advantages = [
  {
    icon: <CalendarMonthIcon />,
    title: "Smart Chair & Appointment Scheduling",
    desc: "Effortlessly manage patient bookings, assign treatment chairs, and track doctor schedules with our drag-and-drop calendar."
  },
  {
    icon: <ChatIcon />,
    title: "In-Clinic Staff Messaging",
    desc: "Secure, real-time messaging between reception, nurses, and doctors. Keep your clinic team connected without leaving the app."
  },
  {
    icon: <ReceiptLongIcon />,
    title: "Fast & Accurate Billing",
    desc: "Generate treatment invoices, track pending payments, and manage day-to-day clinic expenses with clean financial ledgers."
  },
  {
    icon: <PieChartIcon />,
    title: "Profit & Share Tracking",
    desc: "Automatically calculate net clinic profits, doctor commissions, and branch-wise revenue performance in real time."
  }
];

// =========================================================
// 2. DESKTOP COMPONENT: The Left Sidebar
// =========================================================
export function BrandSidebar({ defaultColor }) {
  return (
    <Box sx={{
      flex: 1.2,
      display: { xs: 'none', lg: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      p: { lg: 5, xl: 6 },
      position: 'relative',
      backgroundImage: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Abstract background glow */}
      <Box sx={{
        position: 'absolute', top: '10%', left: '-10%', width: '60%', height: '60%',
        backgroundImage: `radial-gradient(circle, ${defaultColor}35 0%, transparent 60%)`,
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      {/* Header / Custom Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1, flexShrink: 0, mb: 2 }}>
        <Box sx={{
          bgcolor: 'white', p: 0.8, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 20px ${defaultColor}40`, width: 42, height: 42
        }}>
          <Box component="img" src="/kliniclogo.png" alt="Logo" onError={(e) => { e.target.style.display = 'none'; }} sx={{ width: 86, height: 86, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '2.75rem' }}>
          Klinic<span style={{ color: defaultColor }}>Hub</span>
        </Typography>
      </Box>

      {/* Scrollable Center Area */}
      <Box sx={{
        zIndex: 1, my: 'auto', py: 2, pr: 1.5, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)',
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { bgcolor: `${defaultColor}80` },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
      }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.2, fontSize: { lg: '1.75rem', xl: '2.25rem' } }}>
          Complete Clinical & Financial<br />Control for Your Practice.
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4, maxWidth: 520, fontSize: '0.95rem', lineHeight: 1.6 }}>
          From chair-side appointments and instant team messaging to automated billing and profit splits—everything your clinic needs in one workspace.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 640 }}>
          {advantages.map((adv, idx) => (
            <Box key={idx} sx={{
              p: 2.5, borderRadius: 3.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: `${defaultColor}60`, transform: 'translateY(-3px)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                <Box sx={{ color: defaultColor, display: 'flex', bgcolor: 'rgba(255,255,255,0.06)', p: 1, borderRadius: 2, flexShrink: 0 }}>
                  {adv.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#f8fafc', fontSize: '0.95rem' }}>{adv.title}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.83rem' }}>{adv.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer / Trust Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1, flexShrink: 0, pt: 2, color: '#64748b' }}>
        <SecurityIcon sx={{ fontSize: 18, color: defaultColor }} />
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 0.5, color: '#94a3b8', fontSize: '0.75rem' }}>
          SECURE CLINIC DATA • REAL-TIME SYNC
        </Typography>
      </Box>
    </Box>
  );
}

// =========================================================
// 3. MOBILE COMPONENT: The Bottom Feature Drawer
// =========================================================
export function MobileFeatureDrawer({ open, onClose, defaultColor }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, p: 3, bgcolor: '#0f172a', color: 'white', maxHeight: '85vh' }
      }}
    >
      <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, mx: 'auto', mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="800">Why Clinics Choose KlinicHub</Typography>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2, overflowY: 'auto' }}>
        {advantages.map((adv, idx) => (
          <Box key={idx} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ color: defaultColor, display: 'flex', bgcolor: 'rgba(255,255,255,0.08)', p: 1.2, borderRadius: 2, flexShrink: 0 }}>
              {adv.icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.2, mb: 0.5 }}>{adv.title}</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>{adv.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}