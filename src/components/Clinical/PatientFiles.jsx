import React, { useState } from 'react';
import {
    Box, Button, Typography, Grid, Card, CardMedia, CardContent,
    IconButton, Dialog, CircularProgress, Chip, Stack, Paper,
    DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// PHASE 8: NEW IMPORTS FOR CLOUD UPLOAD
import imageCompression from 'browser-image-compression';
import api from '../../api/services/api'; 

import { useToast } from '../../context/ToastContext';
import { SERVER_URL } from '../../api/services/api';
import { useColorMode } from '../../context/ThemeContext';

export default function PatientFiles({ patient, onRefresh }) {
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); // For Lightbox

    // State for Delete Confirmation Modal
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    const { showToast } = useToast();
    const { primaryColor } = useColorMode();

    const handleFileUpload = async (e) => {
        const originalFile = e.target.files[0];
        if (!originalFile) return;

        if (originalFile.size > 5 * 1024 * 1024) {
            showToast('File size too large (Max 5MB)', 'error');
            return;
        }

        try {
            setUploading(true);
            let finalFile = originalFile;

            // 1. SMART COMPRESSION (Only compress if it's an image)
            if (originalFile.type.startsWith('image/')) {
                showToast('Optimizing image...', 'info');
                const options = {
                    maxSizeMB: 1,           
                    maxWidthOrHeight: 1920, 
                    useWebWorker: true,
                    fileType: 'image/webp'  
                };
                const compressedBlob = await imageCompression(originalFile, options);
                const optimizedFileName = originalFile.name.replace(/\.[^/.]+$/, "") + ".webp";
                finalFile = new File([compressedBlob], optimizedFileName, { type: 'image/webp' });
            }

            // 2. Get secure upload URL from Node backend
            const { data } = await api.post(`/patients/${patient._id}/upload-url`, {
                fileName: finalFile.name,
                fileType: finalFile.type
            });

            // 3. Upload DIRECTLY to Cloudflare R2 / AWS S3
            await fetch(data.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': finalFile.type },
                body: finalFile
            });

            // 4. Save the final CDN URL to the database
            await api.post(`/patients/${patient._id}/save-attachment`, {
                type: 'scan', 
                fileUrl: data.fileUrl
            });

            showToast('File securely uploaded to cloud!', 'success');
            onRefresh(); 
        } catch (error) {
            console.error("Upload failed", error);
            showToast('Upload failed', 'error');
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    // Open the Dialog instead of window.confirm
    const requestDelete = (fileUrl) => {
        setFileToDelete(fileUrl);
        setDeleteDialogOpen(true);
    };

    // Actually perform the delete when user clicks "Yes"
    const confirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            // Calls the new cloud delete route
            await api.delete(`/patients/${patient._id}/attachment`, {
                data: { fileUrl: fileToDelete } 
            });
            showToast('File permanently deleted', 'success');
            onRefresh();
        } catch (error) {
            console.error("Delete failed", error);
            showToast('Failed to delete file', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setFileToDelete(null);
        }
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '';

        // Safely handles both new Cloud URLs (https://...) and old Legacy Local files (/uploads/...)
        const cleanPath = filePath.replace(/\\/g, '/');
        const finalPath = (cleanPath.startsWith('http') || cleanPath.startsWith('/'))
            ? cleanPath
            : `/${cleanPath}`;

        return finalPath.startsWith('http') ? finalPath : `${SERVER_URL}${finalPath}`;
    };

    const images = patient?.attachments?.scans || patient?.attachments?.xrays || [];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>

            {/* HEADER & UPLOAD BUTTON */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box sx={{textAlign:'start'}}>
                    <Typography variant="h6" fontWeight="800" color="#0f172a">Images & Documents</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {images.length} files attached
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    component="label"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    disabled={uploading}
                    sx={{ bgcolor: primaryColor, fontWeight: 'bold', borderRadius: 2, px: 3 }}
                >
                    {uploading ? "Processing..." : "Upload Images"}
                    <input hidden accept="image/*,application/pdf,image/svg+xml" type="file" onChange={handleFileUpload} />
                </Button>
            </Stack>

            {/* GALLERY GRID */}
            {images.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 3, boxShadow: 'none' }}>
                    <InsertDriveFileIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography color="text.secondary" fontWeight="500">No Images or documents uploaded yet.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {images.map((filePath, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } }}>
                                <Box
                                    sx={{ height: 180, bgcolor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                                    onClick={() => setPreviewImage(getFileUrl(filePath))}
                                >
                                    <CardMedia
                                        component="img"
                                        image={getFileUrl(filePath)}
                                        alt={`Scan ${index + 1}`}
                                        sx={{ height: '100%', width: '100%', objectFit: 'contain', opacity: 0.9, transition: '0.3s', '&:hover': { opacity: 1 } }}
                                    />
                                </Box>

                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Chip label={`File #${index + 1}`} size="small" />
                                        <Box>
                                            <IconButton size="small" onClick={() => setPreviewImage(getFileUrl(filePath))}>
                                                <VisibilityIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => requestDelete(filePath)} sx={{ ml: 1 }}>
                                                <DeleteOutlineIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 800 }}>
                    Delete this file?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to permanently delete this file? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" autoFocus sx={{ fontWeight: 'bold', borderRadius: 2 }}>
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* LIGHTBOX (FULLSCREEN PREVIEW) */}
            <Dialog
                open={!!previewImage}
                onClose={() => setPreviewImage(null)}
                maxWidth="lg"
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
            >
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => setPreviewImage(null)}
                        sx={{ position: 'absolute', right: 0, top: -50, color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {previewImage && (
                        <Box sx={{
                            bgcolor: '#fff',
                            borderRadius: 2,
                            p: 1, 
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            maxWidth: '100%',
                            maxHeight: '85vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                            />
                        </Box>
                    )}
                </Box>
            </Dialog>
        </Box>
    );
}