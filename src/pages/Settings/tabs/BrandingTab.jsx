import React from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, Stack, Avatar, InputAdornment, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircleIcon from '@mui/icons-material/Circle';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';

const COLOR_OPTIONS = ['#1976d2', '#0f172a', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0', '#00bcd4'];

export default function BrandingTab() {
  const { primaryColor, changePrimaryColor } = useColorMode();

  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
       <SettingsHeader title="Website Branding" sub="Customize your patient booking portal." color={primaryColor}
        action={<Button variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: primaryColor }}>Publish</Button>} />
       
       <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
             <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: primaryColor }}>LOGO</Avatar>
                <Button size="small" component="label" startIcon={<CloudUploadIcon />} sx={{ color: primaryColor }}>
                   Upload Logo <input type="file" hidden />
                </Button>
             </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
             <Stack spacing={3}>
                <TextField fullWidth label="Website Title" defaultValue="Smile Care Dental" />
                
                <Box>
                   <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Theme Color</Typography>
                   <Stack direction="row" spacing={2}>
                      {COLOR_OPTIONS.map((c) => (
                         <Tooltip title={c} key={c}>
                           <CircleIcon 
                             onClick={() => changePrimaryColor(c)} 
                             sx={{ 
                               color: c, fontSize: 36, cursor: 'pointer', 
                               border: c === primaryColor ? `3px solid ${primaryColor}` : '3px solid transparent',
                               borderRadius: '50%', p: 0.2,
                               boxShadow: c === primaryColor ? '0 0 0 2px #e2e8f0' : 'none',
                               transition: 'all 0.2s'
                             }} 
                           />
                         </Tooltip>
                      ))}
                   </Stack>
                   <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                     Selected Color: <span style={{ color: primaryColor, fontWeight: 'bold' }}>{primaryColor}</span>
                   </Typography>
                </Box>
             </Stack>
          </Grid>
       </Grid>
    </Box>
  );
}