import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Grid, MenuItem, Typography, Box, InputAdornment, Divider 
} from '@mui/material';
import { useForm } from 'react-hook-form';

export default function UserModal({ open, onClose, onSave, user, branches, primaryColor }) {
  
  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const watchRole = watch("role");
  const watchStatus = watch("status");
  const watchBranch = watch("defaultBranch");

  useEffect(() => {
    if (open) {
      if (user) {
        // PRE-FILL DATA (Handling nested doctorConfig)
        const branchId = user.defaultBranch?._id || user.defaultBranch || "";
        reset({
          name: user.name || user.fullName || '', // Handle both naming conventions
          email: user.email || '',
          mobile: user.mobile || '',
          role: user.role || 'Receptionist',
          status: user.status || 'Active',
          defaultBranch: branchId,
          
          // ⚡️ Load Doctor Config if it exists
          doctorConfig: {
            specialization: user.doctorConfig?.specialization || 'General Dentist',
            registrationNumber: user.doctorConfig?.registrationNumber || '',
            commissionPercentage: user.doctorConfig?.commissionPercentage || 0,
            baseSalary: user.doctorConfig?.baseSalary || 0
          }
        });
      } else {
        // RESET FORM
        reset({
          name: '',
          email: '',
          mobile: '',
          role: 'Receptionist',
          status: 'Active',
          defaultBranch: '',
          doctorConfig: {
            specialization: 'General Dentist',
            registrationNumber: '',
            commissionPercentage: 0,
            baseSalary: 0
          }
        });
      }
    }
  }, [user, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogTitle sx={{ fontWeight: 'bold', px: 3, pt: 3 }}>
          {user ? 'Edit Staff Member' : 'Register New Staff'}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            
            {/* COLUMN 1: Basic Info */}
            <Grid item xs={12} md={4}>
               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Basic Details
               </Typography>
               <Stack spacing={3}>
                  <TextField 
                    fullWidth label="Full Name" 
                    InputLabelProps={{ shrink: true }}
                    {...register("name", { required: true })} 
                  />
                  <TextField 
                    fullWidth label="Email Address" 
                    InputLabelProps={{ shrink: true }}
                    {...register("email", { required: true })} 
                  />
               </Stack>
            </Grid>
            
            {/* COLUMN 2: Contact & Location */}
            <Grid item xs={12} md={4}>
               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Contact & Branch
               </Typography>
               <Stack spacing={3}>
                  <TextField 
                    fullWidth label="Mobile Number" 
                    InputLabelProps={{ shrink: true }}
                    {...register("mobile", { required: true })} 
                  />
                  <TextField
                    select fullWidth label="Assigned Branch"
                    InputLabelProps={{ shrink: true }}
                    value={watchBranch || ""} 
                    onChange={(e) => setValue("defaultBranch", e.target.value)}
                  >
                    <MenuItem value="" disabled>Select Branch</MenuItem>
                    {branches && branches.map((b) => (
                       <MenuItem key={b._id} value={b._id}>
                          {b.branchName || b.name}
                       </MenuItem>
                    ))}
                  </TextField>
               </Stack>
            </Grid>

            {/* COLUMN 3: Access & Role */}
            <Grid item xs={12} md={4}>
               <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Permissions
               </Typography>
               <Stack spacing={3}>
                  <TextField 
                    select fullWidth label="User Role" 
                    InputLabelProps={{ shrink: true }}
                    value={watchRole || "Receptionist"}
                    onChange={(e) => setValue("role", e.target.value)}
                  >
                    <MenuItem value="Administrator">Administrator</MenuItem>
                    <MenuItem value="Doctor">Doctor</MenuItem>
                    <MenuItem value="Receptionist">Receptionist</MenuItem>
                  </TextField>

                  <TextField 
                    select fullWidth label="Current Status" 
                    InputLabelProps={{ shrink: true }}
                    value={watchStatus || "Active"}
                    onChange={(e) => setValue("status", e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
               </Stack>
            </Grid>

            {/* ⚡️⚡️ CONDITIONAL DOCTOR SETTINGS ⚡️⚡️ */}
            {watchRole === 'Doctor' && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">DOCTOR FINANCIAL SETTINGS</Typography>
                </Divider>
                
                <Grid container spacing={3} sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            fullWidth label="Specialization" 
                            placeholder="e.g. Orthodontist"
                            InputLabelProps={{ shrink: true }}
                            {...register("doctorConfig.specialization")} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            fullWidth label="License / Reg Number" 
                            InputLabelProps={{ shrink: true }}
                            {...register("doctorConfig.registrationNumber")} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            fullWidth label="Commission Share (%)" 
                            type="number"
                            InputProps={{ 
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                inputProps: { min: 0, max: 100 }
                            }}
                            InputLabelProps={{ shrink: true }}
                            {...register("doctorConfig.commissionPercentage")} 
                            helperText="Calculated on Net Revenue (Price - Lab Cost)"
                        />
                    </Grid>
                </Grid>
              </Grid>
            )}

            {/* SECURITY NOTICE (Only for new users) */}
            {!user && (
               <Grid item xs={12}>
                 <Box sx={{ 
                   mt: 2, p: 2, bgcolor: '#fff7ed', border: '1px dashed #f97316', 
                   borderRadius: 2, display: 'flex', justifyContent: 'center' 
                 }}>
                   <Typography variant="body2" color="#c2410c">
                     🔑 <strong>Security Notice:</strong> The default password for this new account is <strong>123456</strong>.
                   </Typography>
                 </Box>
               </Grid>
            )}

          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ bgcolor: primaryColor, px: 6, fontWeight: 'bold', '&:hover': { bgcolor: primaryColor } }}
          >
            {user ? "Update Staff" : "Confirm & Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Helper Stack Component
function Stack({ children, spacing }) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>{children}</Box>;
}