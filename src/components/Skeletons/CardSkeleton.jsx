import React from 'react';
import { Box, Paper, Stack, Skeleton, Divider, Grid } from '@mui/material';

export default function CardListSkeleton({ count = 6 }) {
  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, 
        gap: { xs: 1.5, md: 2 }, 
        width: '100%' 
      }}
    >
      {[...Array(count)].map((_, index) => (
        <Paper 
          key={index} 
          elevation={0} 
          sx={{ 
            p: { xs: 1.5, md: 2 }, 
            border: '1px solid #e2e8f0', 
            borderRadius: 3, 
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={36} height={36} />
              <Box>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={50} height={14} />
              </Box>
            </Stack>
          </Stack>
          
          <Divider sx={{ borderStyle: 'dashed' }} />
          
          {/* Details Row (1 column inside the card on mobile to fit text) */}
          <Box>
            <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          
          {/* Footer Actions Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
            <Skeleton variant="text" width={60} height={16} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1 }} />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}