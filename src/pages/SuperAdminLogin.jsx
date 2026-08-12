import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
// 1. IMPORT RAW AXIOS INSTEAD OF YOUR CUSTOM API
import axios from 'axios';

export default function SuperAdminLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const cleanEmail = email.trim().toLowerCase();

			// Fix: Ensure we build the correct URL
			let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

			// If the baseURL doesn't end with /api, add it.
			if (!baseURL.endsWith('/api')) {
				baseURL = `${baseURL}/api`;
			}

			const res = await axios.post(`${baseURL}/super-admin/login`, {
				email: cleanEmail,
				password
			});

			console.log(res, '++++++++')

			// Store SaaS tokens securely
			localStorage.setItem('saas_token', res.data.token);
			localStorage.setItem('saas_user', JSON.stringify(res.data));

			navigate('/saas-admin');

		} catch (err) {
			setLoading(false);
			setError(err.response?.data?.message || 'Unauthorized access attempt. Please check credentials.');
		}
	};

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', p: 2 }}>
			<Paper elevation={10} sx={{ maxWidth: 400, width: '100%', p: 4, borderRadius: 3, bgcolor: '#ffffff' }}>
				<Box display="flex" flexDirection="column" alignItems="center" mb={3}>
					<Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
						<AdminPanelSettingsIcon sx={{ color: '#0f172a', fontSize: 30 }} />
					</Box>
					<Typography variant="h5" fontWeight="800" color="#0f172a">
						KlinicHub Admin Portal
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Restricted SaaS Management Access
					</Typography>
				</Box>

				{error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

				<form onSubmit={handleLogin}>
					<Typography variant="caption" fontWeight="700" color="#334155" display="block" mb={0.5}>
						ADMIN EMAIL
					</Typography>
					<TextField
						fullWidth
						size="small"
						variant="outlined"
						placeholder="founder@klinichub.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						sx={{ mb: 2.5 }}
					/>

					<Typography variant="caption" fontWeight="700" color="#334155" display="block" mb={0.5}>
						PASSWORD
					</Typography>
					<TextField
						fullWidth
						size="small"
						type="password"
						variant="outlined"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						sx={{ mb: 3 }}
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						disabled={loading}
						sx={{ py: 1.2, bgcolor: '#0f172a', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}
					>
						{loading ? <CircularProgress size={22} color="inherit" /> : 'Authenticate'}
					</Button>
				</form>
			</Paper>
		</Box>
	);
}