import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

export default function StatsCardSkeleton({ count = 2 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {[...Array(count)].map((_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* Avatar Skeleton */}
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              flexShrink: 0,
              borderRadius: 1.5,
            }}
          />
          {/* Text Skeletons */}
          <Box sx={{ width: '100%', minWidth: 0 }}>
            {/* The large number */}
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 0.5 }} />
            {/* The caption label */}
            <Skeleton variant="text" width="70%" height={16} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}