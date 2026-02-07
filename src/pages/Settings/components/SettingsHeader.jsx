import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SettingsHeader({ title, sub, action, color }) {
  return (
    <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h6" fontWeight="800" sx={{ color: color }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{sub}</Typography>
      </Box>
      {action}
    </Box>
  );
}