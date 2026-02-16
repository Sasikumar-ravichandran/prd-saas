import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Chip, CircularProgress, Alert, Button, Stack
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

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditService.getLogs();
      setLogs(data);
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

  // Helper to color code actions
  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'error';
    if (action.includes('CREATE') || action.includes('ADD')) return 'success';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    return 'default';
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
      <Box sx={{ p: 4, width: '100%' }}>
         <SettingsHeader 
            title="Audit Logs" 
            sub="Track sensitive system changes and user activity." 
            color={primaryColor} 
            action={
              <Button startIcon={<RefreshIcon />} size="small" onClick={fetchLogs}>Refresh</Button>
            }
         />
         
         <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, maxHeight: '70vh' }}>
            <Table stickyHeader size="small">
               <TableHead>
                  <TableRow>
                     <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>TIME</TableCell>
                     <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>USER</TableCell>
                     <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>ACTION</TableCell>
                     <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>ENTITY</TableCell>
                     <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: '800' }}>DETAIL</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {logs.map((log) => (
                     <TableRow key={log._id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                           <Typography variant="caption" color="text.secondary" fontWeight="600">
                              {new Date(log.createdAt).toLocaleString()}
                           </Typography>
                        </TableCell>
                        <TableCell>
                           <Typography variant="body2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                              {log.userName || 'System'}
                           </Typography>
                        </TableCell>
                        <TableCell>
                           <Chip 
                              label={log.action} 
                              size="small" 
                              color={getActionColor(log.action)} 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', fontWeight: 'bold', height: 20 }}
                           />
                        </TableCell>
                        <TableCell>
                           <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 0.5, borderRadius: 0.5 }}>
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
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                           No activity recorded yet.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </TableContainer>
      </Box>
  );
}