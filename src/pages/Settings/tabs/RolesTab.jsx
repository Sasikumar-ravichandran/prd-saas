import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Stack, Button, Typography, Switch, Chip, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService'; // Import Service
import { useToast } from '../../../context/ToastContext';

// ... (Keep ROLES and MASTER_PERMISSIONS constants the same) ...
const ROLES = [
  { id: 'doctor', label: 'Doctor', desc: 'Clinical access & personal revenue.' },
  { id: 'receptionist', label: 'Receptionist', desc: 'Front desk & scheduling.' },
];

const MASTER_PERMISSIONS = [
  // --- 1. CALENDAR & SCHEDULING ---
  { id: 'view_calendar', label: 'Access Calendar', category: 'Operational', desc: 'View and manage daily appointments.' },

  // --- 2. PATIENT MANAGEMENT ---
  { id: 'view_patients', label: 'View Patient List', category: 'Patient Care', desc: 'Access the main patient directory.' },
  { id: 'view_inpatient', label: 'Access In-Patient Records', category: 'Patient Care', desc: 'View active in-patient details and history.' },
  { id: 'delete_patient', label: 'Delete Patients', category: 'Data Safety', desc: 'Ability to permanently remove patient records.' }, // The critical delete permission

  // --- 3. FINANCIAL & HR ---
  { id: 'view_finance', label: 'Access Financial Ledger', category: 'Financial', desc: 'View income, expenses, and net profit.' },
  { id: 'view_payroll', label: 'Access Payroll', category: 'Financial', desc: 'Manage staff compensation and payouts.' },
  { id: 'view_attendance', label: 'Access Attendance', category: 'HR', desc: 'View staff clock-ins and attendance records.' },

  // --- 4. INVENTORY ---
  { id: 'view_inventory', label: 'Access Inventory', category: 'Operational', desc: 'Track and manage clinic stock and supplies.' },

  // --- 5. SYSTEM SETTINGS ---
  { id: 'manage_users', label: 'User Management', category: 'Settings', desc: 'Add, edit, or deactivate clinic staff.' },
  { id: 'manage_branding', label: 'Website & Branding', category: 'Settings', desc: 'Update clinic logos and public profile.' },
  { id: 'manage_services', label: 'Service Catalog', category: 'Settings', desc: 'Modify treatment pricing and procedure list.' },
  { id: 'manage_roles', label: 'Roles & Permissions', category: 'Settings', desc: 'Configure system access for different roles.' },
  { id: 'view_audit', label: 'View Audit Logs', category: 'Settings', desc: 'See the history of system actions.' }
];

export default function RolesTab() {
  const { primaryColor } = useColorMode();

  const [activeRole, setActiveRole] = useState('doctor');
  const [rolePermissions, setRolePermissions] = useState(null); // Start as null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();


  // --- 1. FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await settingService.getRoles();
        setRolePermissions(data);
      } catch (error) {
        console.error("Failed to load roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // --- HANDLERS ---
  const handleToggle = (permId) => {
    setSaved(false);
    const currentPerms = rolePermissions?.[activeRole] || [];
    let newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(id => id !== permId)
      : [...currentPerms, permId];

    // Optimistic Update (Update UI immediately)
    setRolePermissions({ ...rolePermissions, [activeRole]: newPerms });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingService.updateRole(activeRole, rolePermissions?.[activeRole]);
      showToast("Permissions saved successfully!", "success"); //  ADD TOAST
    } catch (error) {
      showToast(error || "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };
  // Group permissions logic (Keep same)
  const groupedPermissions = MASTER_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  if (loading) return <Box p={4}><CircularProgress /></Box>;


  return (
    <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SettingsHeader
        title="Roles & Permissions"
        sub="Configure granular access control (RBAC)."
        color={primaryColor}
        action={
          <Button
            variant="contained"
            startIcon={saved ? <CheckCircleIcon /> : (saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />)}
            onClick={handleSave}
            disabled={saving}
            color={saved ? "success" : "primary"}
            sx={{ bgcolor: saved ? 'success.main' : primaryColor, transition: 'all 0.3s' }}
          >
            {saved ? 'Saved!' : (saving ? 'Saving...' : 'Save')}
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 4, flex: 1, minHeight: 0 }}>
        {/* LEFT: ROLE SELECTOR */}
        <Box sx={{ width: 260, flexShrink: 0, height: 'fit-content'}}>
          <Paper variant="outlined" sx={{ overflow: 'hidden', bgcolor: '#f8fafc', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 1 }}>SELECT ROLE</Typography>
            </Box>
            <Stack>
              {ROLES.map((role) => (
                <Button
                  key={role.id}
                  onClick={() => { setActiveRole(role.id); setSaved(false); }}
                  sx={{
                    justifyContent: 'flex-start', borderRadius: 0, py: 2, px: 2, textTransform: 'none',
                    color: activeRole === role.id ? primaryColor : '#64748b',
                    bgcolor: activeRole === role.id ? 'white' : 'transparent',
                    fontWeight: activeRole === role.id ? '800' : '500',
                    borderLeft: activeRole === role.id ? `4px solid ${primaryColor}` : '4px solid transparent',
                    borderBottom: '1px solid #f1f5f9',
                    '&:hover': { bgcolor: 'white', color: primaryColor }
                  }}
                >
                  <Box sx={{ textAlign: 'start' }}>
                    <Typography variant="body2" fontWeight="inherit">{role.label}</Typography>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>{role.desc}</Typography>
                  </Box>
                </Button>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* RIGHT: PERMISSIONS */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight="800" sx={{ color: primaryColor }}>
              {ROLES.find(r => r.id === activeRole)?.label} Permissions
            </Typography>
            <Chip label={activeRole === 'admin' ? 'Full Access' : 'Custom Config'} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold' }} />
          </Box>

          {activeRole === 'admin' && (
            <Alert severity="warning" sx={{ mb: 3 }}>The Administrator role has full access by default. Modifications are restricted.</Alert>
          )}

          <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {Object.keys(groupedPermissions).map((category, index) => (
              <Box key={category}>
                <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTop: index > 0 ? '1px solid #f1f5f9' : 'none' }}>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{category}</Typography>
                </Box>

                <Box sx={{ px: 3 }}>
                  {groupedPermissions[category].map((perm) => {
                    const isChecked = rolePermissions?.[activeRole]?.includes(perm.id) || false;
                    const isDisabled = activeRole === 'admin';

                    return (
                      <Box key={perm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
                        <Box sx={{ textAlign: 'start' }}>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b' }}>{perm.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{perm.desc}</Typography>
                        </Box>
                        <Switch
                          size="small"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleToggle(perm.id)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor } }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}