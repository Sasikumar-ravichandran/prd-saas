import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Button, IconButton,
  CircularProgress, Stack, Dialog, DialogContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn'; // ⚡️ NEW: Import Zoom Icon
import { useColorMode } from '../../context/ThemeContext';

import api from '../../api/services/api';
import { useToast } from '../../context/ToastContext';

export default function BeforeAfterGallery({ patientId, existingPhotos = [], onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null); 
  const [compareMode, setCompareMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null); // ⚡️ NEW: Tracks the image to display in full screen

  const { showToast } = useToast();
  const { primaryColor } = useColorMode();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size too large (Max 5MB)', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo'); 

      await api.post(`/patients/${patientId}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Image uploaded successfully!', 'success');
      if (onRefresh) onRefresh(); 
    } catch (error) {
      console.error("Upload failed", error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
      event.target.value = null; 
    }
  };

const handleDelete = async (event, url) => {
    event.stopPropagation(); // Prevents the click from opening the zoom/compare modal
    
    if (!window.confirm("Are you sure you want to permanently delete this photo?")) return;

    try {
      setDeleting(url);
      
      // ⚡️ UPDATED: Pointing to your exact API endpoint
      await api.delete(`/patients/${patientId}/attachment`, {
        data: { fileUrl: url } // Axios requires body payload for DELETE requests to be inside 'data'
      });

      // NOTE: If your router is actually setup as a POST request (router.post), 
      // replace the above api.delete with this instead:
      // await api.post(`/patients/${patientId}/attachment`, { fileUrl: url });

      showToast('Image deleted successfully!', 'success');
      
      // Remove from selected comparison images if it was selected
      if (selectedImages.includes(url)) {
        setSelectedImages(selectedImages.filter(img => img !== url));
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Delete failed", error);
      showToast('Failed to delete image', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // ⚡️ NEW: Handle Zoom click safely without triggering comparison selection
  const handleZoom = (event, url) => {
    event.stopPropagation();
    setZoomedImage(url);
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
                transition: 'all 0.2s ease',
                '&:hover .image-actions': { opacity: 1 } // Show actions on hover (optional enhancement)
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Clinical Photo ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Delete Button (Top Right) */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                <IconButton 
                  size="small" 
                  color="error"
                  disabled={deleting === url}
                  onClick={(e) => handleDelete(e, url)}
                >
                  {deleting === url ? <CircularProgress size={16} color="error" /> : <DeleteOutlineIcon fontSize="small" />}
                </IconButton>
              </Box>

              {/* ⚡️ NEW: Zoom Button (Bottom Right) */}
              <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                <IconButton 
                  size="small" 
                  sx={{ color: primaryColor }}
                  onClick={(e) => handleZoom(e, url)}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ⚡️ NEW: Single Image Zoom Modal */}
      <Dialog
        open={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#0f172a' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <IconButton onClick={() => setZoomedImage(null)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, pb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <Box 
            component="img" 
            src={zoomedImage} 
            sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
          />
        </DialogContent>
      </Dialog>

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
            <Grid item xs={12} md={6} sx={{ borderRight: { md: '2px solid #334155' }, borderBottom: { xs: '2px solid #334155', md: 'none' }, height: { xs: '50%', md: '100%' } }}>
              <Box component="img" src={selectedImages[0]} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Grid>
            <Grid item xs={12} md={6} sx={{ height: { xs: '50%', md: '100%' } }}>
              <Box component="img" src={selectedImages[1]} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}