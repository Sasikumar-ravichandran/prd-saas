import React from 'react';
import { 
  Skeleton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

export default function TableSkeleton({ rowCount = 5, columnCount = 5 }) {
  // Helper to make the skeleton text look like natural, varying data lengths
  const getSkeletonWidth = (colIndex) => {
    if (colIndex === 0) return '60%'; // usually a name or ID
    if (colIndex === columnCount - 1) return '40%'; // usually actions/status
    return colIndex % 2 === 0 ? '70%' : '50%'; // mix up the middle columns
  };

  return (
    <TableContainer 
      component={Paper} 
      elevation={0} 
      sx={{ 
        border: '1px solid #e2e8f0', 
        borderRadius: 3, 
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="skeleton table">
        
        {/* FAKE TABLE HEADER */}
        <TableHead sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          <TableRow>
            {[...Array(columnCount)].map((_, index) => (
              <TableCell key={`header-${index}`}>
                <Skeleton 
                  variant="text" 
                  width={index === 0 ? 120 : 80} 
                  height={24} 
                  sx={{ bgcolor: '#e2e8f0' }} // slightly darker gray for headers
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* FAKE TABLE BODY */}
        <TableBody>
          {[...Array(rowCount)].map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`} sx={{ '&:last-child td': { border: 0 } }}>
              {[...Array(columnCount)].map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  {colIndex === columnCount - 1 ? (
                    // Last column often has an action button/chip, so make it a rounded rectangle
                    <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} />
                  ) : (
                    // Standard text row
                    <Skeleton variant="text" width={getSkeletonWidth(colIndex)} height={20} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}