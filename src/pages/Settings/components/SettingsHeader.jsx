import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SettingsHeader({ title, sub, action, color }) {
  return (
    <Box
      sx={{
        width: '100%', // 1. Forces the header to span the full width of its container
        mb: 3,
        pb: 2,
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* 2. Explicitly force text-align left to override any parent container settings */}
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="h6" fontWeight="800" sx={{ color: color }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {sub}
        </Typography>
      </Box>

      <Box>
        {action}
      </Box>
    </Box>
  );
}