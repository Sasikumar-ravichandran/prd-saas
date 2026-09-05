import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Button, IconButton,
  CircularProgress, Stack, Dialog, DialogContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import { useColorMode } from '../../context/ThemeContext';

import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';

export default function BeforeAfterGallery({ patientId, existingPhotos = [], onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const { showToast } = useToast();
    const { primaryColor } = useColorMode();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Optional but recommended: Add a size limit check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size too large (Max 5MB)', 'error');
      return;
    }

    try {
      setUploading(true);

      // 1. Prepare the file data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo'); //Type 'photo' puts it in the correct gallery array

      // 2. Send directly to your Node.js backend (Bypasses CORS/ISP blocks)
      await api.post(`/patients/${patientId}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Image uploaded successfully!', 'success');
      if (onRefresh) onRefresh(); // Refresh patient data to show the new image
    } catch (error) {
      console.error("Upload failed", error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
      event.target.value = null; // Reset the file input so the user can upload the same file again if needed
    }
  };

  const toggleSelection = (url) => {
    if (selectedImages.includes(url)) {
      setSelectedImages(selectedImages.filter(img => img !== url));
    } else {
      if (selectedImages.length < 2) {
        setSelectedImages([...selectedImages, url]);
      } else {
        showToast('You can only select 2 images for comparison', 'info');
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>

      {/* Action Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="800" color="#0f172a">Clinical Gallery</Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            disabled={selectedImages.length !== 2}
            onClick={() => setCompareMode(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Compare Selected
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            disabled={uploading}
            sx={{ bgcolor: primaryColor, borderRadius: 2, fontWeight: 'bold' }}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
          </Button>
        </Stack>
      </Stack>

      {/* Image Grid */}
      <Grid container spacing={3}>
        {existingPhotos.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '2px dashed #e2e8f0' }}>
              <Typography variant="body1" color="text.secondary" fontWeight="600">
                No clinical photos uploaded yet.
              </Typography>
            </Box>
          </Grid>
        )}

        {existingPhotos.map((url, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              onClick={() => toggleSelection(url)}
              sx={{
                position: 'relative',
                height: 250,
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedImages.includes(url) ? '4px solid #3b82f6' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Clinical Photo ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                <IconButton size="small" color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Comparison Modal */}
      <Dialog
        open={compareMode}
        onClose={() => setCompareMode(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#0f172a' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="white" fontWeight="800">Before & After Comparison</Typography>
          <IconButton onClick={() => setCompareMode(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Grid container sx={{ height: '70vh' }}>
            <Grid item xs={6} sx={{ borderRight: '2px solid #334155', height: '100%' }}>
              <Box component="img" src={selectedImages[0]} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Grid>
            <Grid item xs={6} sx={{ height: '100%' }}>
              <Box component="img" src={selectedImages[1]} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}