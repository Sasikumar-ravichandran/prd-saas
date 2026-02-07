import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import SettingsHeader from '../components/SettingsHeader';
import { useColorMode } from '../../../context/ThemeContext';

const AUDIT_LOGS = [
  { id: 1, action: 'Updated Price', detail: 'RCT-01 changed from 4000 to 4500', user: 'Admin', time: 'Today, 10:30 AM' },
  { id: 2, action: 'Added User', detail: 'Created account for Dr. Bench', user: 'Admin', time: 'Yesterday, 4:00 PM' },
];

export default function AuditLogsTab() {
  const { primaryColor } = useColorMode();

  return (
     <Box sx={{ p: 4 }}>
        <SettingsHeader title="Audit Logs" sub="Track system changes." color={primaryColor} />
        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
           <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                 <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>TIME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ACTION</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>DETAIL</TableCell>
                 </TableRow>
              </TableHead>
              <TableBody>
                 {AUDIT_LOGS.map((log) => (
                    <TableRow key={log.id}>
                       <TableCell><Typography variant="caption" color="text.secondary">{log.time}</Typography></TableCell>
                       <TableCell><Typography variant="body2" fontWeight="bold">{log.user}</Typography></TableCell>
                       <TableCell><Typography variant="body2">{log.action}</Typography></TableCell>
                       <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.detail}</Typography></TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </TableContainer>
     </Box>
  );
}