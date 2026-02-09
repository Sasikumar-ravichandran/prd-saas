import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Stack, Button, Typography, Switch, Chip, Alert, CircularProgress 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService'; // Import Service

// ... (Keep ROLES and MASTER_PERMISSIONS constants the same) ...
const ROLES = [
  { id: 'admin', label: 'Administrator', desc: 'Full access to everything.' },
  { id: 'doctor', label: 'Doctor', desc: 'Clinical access & personal revenue.' },
  { id: 'receptionist', label: 'Receptionist', desc: 'Front desk & scheduling.' },
  { id: 'nurse', label: 'Nurse / Assistant', desc: 'Limited clinical support.' },
];

const MASTER_PERMISSIONS = [
  { id: 'fin_view_revenue', label: 'View Revenue Reports', category: 'Financial', desc: 'See total collection & graphs.' },
  { id: 'fin_edit_invoice', label: 'Edit/Delete Invoices', category: 'Financial', desc: 'Modify bills after generation.' },
  { id: 'fin_discounts', label: 'Apply Heavy Discounts', category: 'Financial', desc: 'Give >20% discount.' },
  { id: 'pt_delete', label: 'Delete Patient Records', category: 'Data Safety', desc: 'Permanently remove files.' },
  { id: 'pt_export', label: 'Export Patient Data', category: 'Data Safety', desc: 'Download CSV of all patients.' },
  { id: 'ops_settings', label: 'Access Settings', category: 'Operational', desc: 'Change clinic profile & prices.' },
  { id: 'ops_calendar', label: 'Manage Calendar', category: 'Operational', desc: 'Book & move appointments.' },
];

export default function RolesTab() {
  const { primaryColor } = useColorMode();
  
  const [activeRole, setActiveRole] = useState('doctor');
  const [rolePermissions, setRolePermissions] = useState(null); // Start as null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    const currentPerms = rolePermissions[activeRole] || [];
    let newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(id => id !== permId)
      : [...currentPerms, permId];

    // Optimistic Update (Update UI immediately)
    setRolePermissions({ ...rolePermissions, [activeRole]: newPerms });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save ONLY the currently active role to the backend
      await settingService.updateRole(activeRole, rolePermissions[activeRole]);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save", error);
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
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
             {saved ? 'Saved!' : (saving ? 'Saving...' : 'Save Changes')}
           </Button>
         }
       />
       
       <Box sx={{ display: 'flex', gap: 4, flex: 1, minHeight: 0 }}>
         {/* LEFT: ROLE SELECTOR */}
         <Box sx={{ width: 260, flexShrink: 0 }}>
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
                       <Box sx={{ textAlign: 'left' }}>
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
                        const isChecked = rolePermissions[activeRole]?.includes(perm.id) || false;
                        const isDisabled = activeRole === 'admin';

                        return (
                          <Box key={perm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
                            <Box>
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