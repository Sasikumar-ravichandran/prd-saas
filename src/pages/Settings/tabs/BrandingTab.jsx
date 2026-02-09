import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, TextField, Stack, Avatar, 
  Tooltip, CircularProgress, Alert 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircleIcon from '@mui/icons-material/Circle';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { settingService } from '../../../api/services/settingService';
import { useToast } from '../../../context/ToastContext';

const COLOR_OPTIONS = ['#1976d2', '#0f172a', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0', '#00bcd4'];

export default function BrandingTab() {
  const { primaryColor, changePrimaryColor } = useColorMode();
  const { showToast } = useToast();

  const [websiteTitle, setWebsiteTitle] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const data = await settingService.getClinic();
        if (data) {
          setWebsiteTitle(data.name || '');
          setLogoPreview(data.logo);
          if (data.primaryColor && data.primaryColor !== primaryColor) {
             changePrimaryColor(data.primaryColor);
          }
        }
      } catch (err) {
        console.error("Failed to load branding", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  const handleColorChange = (color) => {
    changePrimaryColor(color);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await settingService.uploadLogo(file);
      setLogoPreview(base64);
    } catch (err) {
      showToast("Failed to process image", "error");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: websiteTitle,
        primaryColor: primaryColor,
        logo: logoPreview
      };
      await settingService.updateClinic(payload);
      showToast("Branding settings published!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: '100%' }}>
       <SettingsHeader 
         title="Website Branding" 
         sub="Customize your patient booking portal." 
         color={primaryColor}
         action={
           <Button 
             variant="contained" 
             startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} 
             onClick={handleSave}
             disabled={saving}
             sx={{ bgcolor: primaryColor }}
           >
             {saving ? "Publishing..." : "Publish"}
           </Button>
         } 
       />
       
       {/* 1 Row Layout: Logo | Title | Color */}
       <Grid container spacing={3} alignItems="flex-start">
          
          {/* 1. LOGO UPLOAD (Left) */}
          <Grid item xs={12} md={3}>
             <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed', height: '100%' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                   <Avatar 
                     src={logoPreview} 
                     sx={{ width: 70, height: 70, mx: 'auto', bgcolor: primaryColor, fontSize: '0.7rem' }}
                   >
                     {!logoPreview && "LOGO"}
                   </Avatar>
                </Box>
                <br/>
                <Button size="small" component="label" startIcon={<CloudUploadIcon />} sx={{ color: primaryColor, fontSize: '0.75rem' }}>
                   Upload Logo <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                </Button>
             </Paper>
          </Grid>
          
          {/* 2. WEBSITE TITLE (Middle) */}
          <Grid item xs={12} md={4}>
             <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1}>
                    WEBSITE / CLINIC NAME
                </Typography>
                <TextField 
                  fullWidth 
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                  placeholder="e.g. Smile Care Dental" 
                  variant="outlined"
                  size="small"
                />
             </Paper>
          </Grid>

          {/* 3. THEME COLOR (Right) */}
          <Grid item xs={12} md={5}>
             <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', height: '100%' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1.5} display="block">
                    THEME COLOR: <span style={{ color: primaryColor }}>{primaryColor}</span>
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                   {COLOR_OPTIONS.map((c) => (
                      <Tooltip title={c} key={c}>
                        <CircleIcon 
                          onClick={() => handleColorChange(c)} 
                          sx={{ 
                            color: c, fontSize: 32, cursor: 'pointer', 
                            border: c === primaryColor ? `3px solid ${primaryColor}` : '3px solid transparent',
                            borderRadius: '50%', p: 0.2,
                            boxShadow: c === primaryColor ? '0 0 0 2px #e2e8f0' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }} 
                        />
                      </Tooltip>
                   ))}
                </Stack>
             </Paper>
          </Grid>

       </Grid>
    </Box>
  );
}