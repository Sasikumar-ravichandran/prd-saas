import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
	Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
	IconButton, Typography, Divider, Tooltip, alpha
} from '@mui/material';
import { useColorMode } from '../../context/ThemeContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 74;

const MENU_ITEMS = [
	{ text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
	{ text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
	{ text: 'Patient List', icon: <PeopleIcon />, path: '/patients' },
	{ text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle, isCollapsed, setIsCollapsed }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { primaryColor } = useColorMode();

	const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);

	// The internal content of the drawer
	const DrawerContent = (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			{/* 1. LOGO HEADER */}
			<Box sx={{
				height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', px: 2.5,
				justifyContent: isCollapsed ? 'center' : 'space-between',
				borderBottom: '1px solid #f1f5f9'
			}}>
				{isCollapsed ? (
					<LocalHospitalIcon sx={{ color: primaryColor, fontSize: 32 }} />
				) : (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box sx={{
							width: 38, height: 38, borderRadius: 2, bgcolor: primaryColor,
							display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
							boxShadow: `0 4px 6px -1px ${alpha(primaryColor, 0.4)}`
						}}>
							<LocalHospitalIcon fontSize="small" />
						</Box>
						<Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b', lineHeight: 1, letterSpacing: -0.5 }}>
							Dental<span style={{ color: primaryColor }}>App</span>
						</Typography>
					</Box>
				)}

				{/* Desktop Collapse Button */}
				{!mobileOpen && !isCollapsed && (
					<IconButton onClick={handleCollapseToggle} size="small" sx={{ color: '#94a3b8', bgcolor: '#f8fafc' }}>
						<KeyboardDoubleArrowLeftIcon fontSize="small" />
					</IconButton>
				)}
			</Box>

			{/* Expand Button (When Collapsed) */}
			{isCollapsed && (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
					<IconButton onClick={handleCollapseToggle} size="small" sx={{ color: '#94a3b8' }}>
						<KeyboardDoubleArrowRightIcon fontSize="small" />
					</IconButton>
				</Box>
			)}

			{/* 2. NAVIGATION LINKS */}
			<List sx={{ px: 2, pt: 2, flex: 1 }}>
				{MENU_ITEMS.map((item) => {
					const isActive = item.path === '/'
						? location.pathname === '/'
						: location.pathname.startsWith(item.path);
					return (
						<ListItem key={item.text} disablePadding sx={{ mb: 1, display: 'block' }}>
							<Tooltip title={isCollapsed ? item.text : ""} placement="right" arrow>
								<ListItemButton
									onClick={() => navigate(item.path)}
									sx={{
										minHeight: 48,
										borderRadius: 2,
										justifyContent: isCollapsed ? 'center' : 'initial',
										px: 2.5,
										bgcolor: isActive ? alpha(primaryColor, 0.1) : 'transparent',
										color: isActive ? primaryColor : '#64748b',
										transition: 'all 0.2s',
										position: 'relative',
										'&:hover': {
											bgcolor: isActive ? alpha(primaryColor, 0.15) : '#f8fafc',
											color: isActive ? primaryColor : '#1e293b',
											transform: 'translateX(3px)'
										}
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: isCollapsed ? 0 : 2,
											justifyContent: 'center',
											color: isActive ? primaryColor : '#94a3b8',
										}}
									>
										{item.icon}
									</ListItemIcon>
									<ListItemText
										primary={item.text}
										primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
										sx={{ opacity: isCollapsed ? 0 : 1, whiteSpace: 'nowrap' }}
									/>
									{isActive && !isCollapsed && (
										<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: primaryColor, position: 'absolute', right: 10 }} />
									)}
								</ListItemButton>
							</Tooltip>
						</ListItem>
					);
				})}
			</List>

			{/* 3. FOOTER */}
			<Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#fcfcfc' }}>
				<Tooltip title={isCollapsed ? "Logout" : ""} placement="right">
					<ListItemButton
						sx={{
							borderRadius: 2,
							justifyContent: isCollapsed ? 'center' : 'initial',
							color: '#64748b',
							'&:hover': { bgcolor: '#fee2e2', color: '#ef4444' }
						}}
					>
						<ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center', color: 'inherit' }}>
							<LogoutIcon />
						</ListItemIcon>
						<ListItemText
							primary="Logout"
							primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
							sx={{ opacity: isCollapsed ? 0 : 1 }}
						/>
					</ListItemButton>
				</Tooltip>
			</Box>
		</Box>
	);

	return (
		<Box component="nav" sx={{ width: { md: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}>
			{/* Mobile Drawer */}
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={handleDrawerToggle}
				ModalProps={{ keepMounted: true }}
				sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
			>
				{DrawerContent}
			</Drawer>

			{/* Desktop Drawer */}
			<Drawer
				variant="permanent"
				sx={{
					display: { xs: 'none', md: 'block' },
					'& .MuiDrawer-paper': {
						boxSizing: 'border-box',
						width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
						borderRight: '1px solid #e2e8f0',
						transition: 'width 0.3s',
						overflowX: 'hidden',
						bgcolor: 'white'
					},
				}}
				open
			>
				{DrawerContent}
			</Drawer>
		</Box>
	);
}