import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Chip, CircularProgress, Alert, Button, Paper, TablePagination
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';
import { auditService } from '../../../api/services/auditService';

export default function AuditLogsTab() {
  const { primaryColor } = useColorMode();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async (currentPage = page, currentLimit = rowsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await auditService.getLogs(currentPage + 1, currentLimit); 
      
      // Handle array vs paginated response safely
      if (Array.isArray(data)) {
        setLogs(data);
        setTotalCount(data.length);
      } else {
        setLogs(data.logs || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchLogs(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    fetchLogs(0, newLimit);
  };

  // Helper to color code actions
  const getActionColor = (action) => {
    if (!action) return 'default';
    if (action.includes('DELETE')) return 'error';
    if (action.includes('CREATE') || action.includes('ADD')) return 'success';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    return 'default';
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
      <Box sx={{ p: { xs: 1, md: 1 }, width: '100%', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
         <SettingsHeader 
            title="Audit Logs" 
            sub="Track sensitive system changes and user activity." 
            color={primaryColor} 
         />
         
         <Paper 
            elevation={0}
            sx={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: 3, 
              mt: 2,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column',
              flex: 1, // Fills available vertical space
              minHeight: 0, // Critical for preventing outer overflow
              overflow: 'hidden'
            }}
          >
            <TableContainer 
              sx={{ 
                flex: 1, // Fills all space above the pagination bar
                overflowX: 'auto',
                overflowY: 'auto'
              }}
            >
              <Table stickyHeader size="small" sx={{ minWidth: 700 }}>
                 <TableHead>
                    <TableRow>
                       <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', color: '#475569', zIndex: 10 }}>TIME</TableCell>
                       <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', color: '#475569', zIndex: 10 }}>USER</TableCell>
                       <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', color: '#475569', zIndex: 10 }}>ACTION</TableCell>
                       <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', color: '#475569', zIndex: 10 }}>ENTITY</TableCell>
                       <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800', color: '#475569', zIndex: 10 }}>DETAIL</TableCell>
                    </TableRow>
                 </TableHead>
                 <TableBody>
                    {logs.map((log) => (
                       <TableRow key={log._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                             <Typography variant="caption" color="text.secondary" fontWeight="600">
                                {new Date(log.createdAt).toLocaleString()}
                             </Typography>
                          </TableCell>
                          <TableCell>
                             <Typography variant="body2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                                {log.userName || log.userId?.fullName || 'System'}
                             </Typography>
                          </TableCell>
                          <TableCell>
                             <Chip 
                                label={log.action} 
                                size="small" 
                                color={getActionColor(log.action)} 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', fontWeight: 'bold', height: 22, borderRadius: 1.5 }}
                             />
                          </TableCell>
                          <TableCell>
                             <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold', color: '#64748b' }}>
                                {log.entity}
                             </Typography>
                          </TableCell>
                          <TableCell>
                             <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                                {log.details}
                             </Typography>
                          </TableCell>
                       </TableRow>
                    ))}
                    {logs.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                             No activity recorded yet.
                          </TableCell>
                       </TableRow>
                    )}
                 </TableBody>
              </Table>
           </TableContainer>

           {/* Fixed Pagination Footer */}
           <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                flexShrink: 0 // Prevents footer from collapsing or moving on scroll
              }}
           />
         </Paper>
      </Box>
  );
}