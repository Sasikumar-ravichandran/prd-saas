import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, MenuItem, Typography, Box, InputAdornment, Divider, IconButton
} from '@mui/material';
import { useForm } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close'; //  Add this

export default function UserModal({ open, onClose, onSave, user, branches, primaryColor }) {


  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const handleFormSubmit = (data) => {
    //  Create a bulletproof payload that satisfies both 'name' and 'fullName' expectations
    const payload = {
      ...data,
      fullName: data.name, // Ensure fullName is sent if backend expects it
      name: data.name      // Ensure name is sent
    };

    console.log("DEBUG: Sending payload to backend:", payload);
    onSave(payload);
  };

  const watchRole = watch("role");
  const watchStatus = watch("status");
  const watchBranch = watch("defaultBranch");

  useEffect(() => {
    if (open) {
      if (user) {
        // PRE-FILL DATA 
        const branchId = user.defaultBranch?._id || user.defaultBranch || "";
        reset({
          name: user.name || user.fullName || '',

          email: user.email || '',
          mobile: user.mobile || '',
          role: user.role || 'Receptionist',
          status: user.status || 'Active',
          defaultBranch: branchId,

          //  NEW: Universal Payroll Settings
          baseSalary: user.baseSalary || 0,
          commissionRate: user.commissionRate || 0,

          // Clinical Details (Doctors only)
          doctorConfig: {
            specialization: user.doctorConfig?.specialization || 'General Dentist',
            registrationNumber: user.doctorConfig?.registrationNumber || ''
          }
        });
      } else {
        // RESET FORM FOR NEW USER
        reset({
          name: '',
          email: '',
          mobile: '',
          role: 'Receptionist',
          status: 'Active',
          defaultBranch: '',
          baseSalary: 0,
          commissionRate: 0,
          doctorConfig: {
            specialization: 'General Dentist',
            registrationNumber: ''
          }
        });
      }
    }
  }, [user, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{
          fontWeight: '800', px: 3, pt: 3,
          borderBottom: '1px solid #e2e8f0', pb: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' //  Added flexbox
        }}>
          {user ? 'Edit Staff Member' : 'Register New Staff'}
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
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

            {/*  UNIVERSAL COMPENSATION SETTINGS  */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">COMPENSATION & PAYROLL</Typography>
              </Divider>

              <Grid container spacing={3} sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2, border: '1px solid #bbf7d0', mt: 1 }}>
                <Grid item xs={12} md={watchRole === 'Doctor' ? 6 : 12}>
                  <TextField
                    fullWidth label="Base / Flat Salary (Monthly)"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    InputLabelProps={{ shrink: true }}
                    {...register("baseSalary", { valueAsNumber: true })}
                    helperText={watchRole === 'Doctor' ? "Fixed monthly pay (Enter 0 if strictly percentage-based)" : "Fixed monthly salary for this staff member"}
                  />
                </Grid>

                {/* Commission Only appears for Doctors! */}
                {watchRole === 'Doctor' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="Commission Share (%)"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 100 }
                      }}
                      InputLabelProps={{ shrink: true }}
                      {...register("commissionRate", { valueAsNumber: true })}
                      helperText="Percentage of procedure revenue (Enter 0 if strictly fixed salary)"
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/*  CONDITIONAL DOCTOR CLINICAL SETTINGS  */}
            {watchRole === 'Doctor' && (
              <Grid item xs={12}>
                <Divider sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">CLINICAL PROFILE</Typography>
                </Divider>

                <Grid container spacing={3} sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="Specialization"
                      placeholder="e.g. Orthodontist"
                      InputLabelProps={{ shrink: true }}
                      {...register("doctorConfig.specialization")}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth label="License / Reg Number"
                      InputLabelProps={{ shrink: true }}
                      {...register("doctorConfig.registrationNumber")}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* SECURITY NOTICE (Only for new users) */}
            {!user && (
              <Grid item xs={12}>
                <Box sx={{
                  p: 2, bgcolor: '#fff7ed', border: '1px dashed #f97316',
                  borderRadius: 2, display: 'flex', justifyContent: 'center'
                }}>
                  <Typography variant="body2" color="#c2410c">
                    🔑 <strong>Security Notice:</strong> The default password for this new account is <strong>123456</strong>. They can change it after logging in.
                  </Typography>
                </Box>
              </Grid>
            )}

          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
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