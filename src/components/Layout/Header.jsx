import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, InputBase,
  Typography, Avatar, Stack, Tooltip, Badge, Divider, alpha, ListItemIcon,
  Collapse, Paper, List, ListItem, ListItemText, Chip, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useColorMode } from '../../context/ThemeContext';
import { switchBranch, logout } from '../../redux/slices/authSlice';
import { patientService } from '../../api/services/patientService';
import { userService } from '../../api/services/userService';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import io from 'socket.io-client';
import api from '../../api/services/api';

const ENDPOINT = "http://localhost:5000";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 70;

export default function Header({ isCollapsed, handleDrawerToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor } = useColorMode();
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // REDUX STATE
  const { user, branches, activeBranchId } = useSelector((state) => state.auth);
  const activeBranch = branches.find(b => b._id === activeBranchId) || {};
  const currentBranchName = activeBranch.branchName || activeBranch.name || 'Select Branch';

  // UI STATE
  const [branchAnchor, setBranchAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [quickAddAnchor, setQuickAddAnchor] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], doctors: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [unreadCount, setUnreadCount] = useState(0);

  const loggedInUser = JSON.parse(localStorage.getItem('user')) || { _id: 'REPLACE_ME' };

  useEffect(() => {
    if (!loggedInUser || loggedInUser._id === 'REPLACE_ME') return;

    // 1. Fetch initial unread count from the database
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/messages/unread-count');
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };
    fetchUnreadCount();

    // 2. Connect Header to Socket.io to listen for live updates
    const socket = io(ENDPOINT);
    socket.emit("setup", loggedInUser);

    // 3. If a new message arrives and we are NOT on the messages page, bump the counter
    socket.on("message recieved", (newMessageRecieved) => {
      if (location.pathname !== '/messages') {
        setUnreadCount(prev => prev + 1);
      }
    });

    // 4. If we mark messages as read inside the Messages app, refresh the count
    socket.on("messages read", () => {
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  // ─── Search API ───────────────────────────────────────────────
  const fetchSearchResults = useCallback(async (query) => {
    try {
      const [patientsRes, usersRes] = await Promise.all([
        // ⚡️ UPDATED: Uses your patientService
        patientService.getAll({ search: query, limit: 5 }),
        // ⚡️ UPDATED: Uses your userService and passes the role parameter
        userService.getAll({ search: query, role: 'Doctor', limit: 5 }),
      ]);

      // ⚡️ UPDATED: Matches the response structure of your services (.patients and .users)
      const patients = patientsRes?.patients || [];
      const doctors = usersRes?.users || [];

      setSearchResults({ patients, doctors });
    } catch {
      setSearchResults({ patients: [], doctors: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setActiveIndex(-1);

    if (!value.trim()) {
      setSearchOpen(false);
      setSearchResults({ patients: [], doctors: [] });
      clearTimeout(searchDebounceRef.current);
      return;
    }

    setSearchLoading(true);
    setSearchOpen(true);

    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchSearchResults(value.trim());
    }, 300);
  }, [fetchSearchResults]);

  // flat list for keyboard nav
  const allResults = [
    ...searchResults.patients.map(p => ({ type: 'patient', data: p })),
    ...searchResults.doctors.map(d => ({ type: 'doctor', data: d })),
  ];

  const handleResultClick = useCallback((result) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults({ patients: [], doctors: [] });

    if (result.type === 'patient') {
      // patient → go to patients list page filtered by id
      navigate(`/patients?search=${encodeURIComponent(result.data.fullName)}`);
    } else if (result.type === 'doctor') {
      // doctor → go to user management page filtered by name
      navigate(`/settings?tab=users&search=${encodeURIComponent(result.data.name)}`);
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e) => {
    if (!searchOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allResults[activeIndex]) {
        handleResultClick(allResults[activeIndex]);
      } else if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  }, [searchOpen, activeIndex, allResults, searchQuery, handleResultClick, navigate]);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Cmd+K shortcut ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMobileSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Other handlers ───────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBranchSwitch = (branch) => {
    setBranchAnchor(null);
    dispatch(switchBranch(branch._id));
    window.location.reload();
  };

  const safeUser = user || { fullName: 'Guest', name: 'Guest', role: 'Staff' };
  const displayName = safeUser.fullName || safeUser.name;

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  // ─── Highlight matching text ──────────────────────────────────
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: primaryColor, fontWeight: 700 }}>
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
        ml: { md: `${isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` },
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
        transition: 'all 0.3s ease',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ height: HEADER_HEIGHT, display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 }, gap: 1 }}>

        {/* ── LEFT ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flex: 1 }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Button
            onClick={(e) => setBranchAnchor(e.currentTarget)}
            disableElevation
            sx={{
              textTransform: 'none', color: '#1e293b',
              bgcolor: 'white', border: '1px solid #e2e8f0',
              px: { xs: 1, sm: 1.5 }, height: 40, borderRadius: '10px',
              minWidth: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            <LocationOnIcon sx={{ color: primaryColor, mr: { xs: 0, sm: 1 }, fontSize: 20 }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', mt: -0.3 }}>
              <Stack spacing={-0.4} alignItems="flex-start">
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Workspace
                </Typography>
                <Typography variant="body2" fontWeight="700" noWrap sx={{ maxWidth: 140, fontSize: '0.85rem' }}>
                  {currentBranchName}
                </Typography>
              </Stack>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: '#94a3b8', fontSize: 18, ml: 0.5, display: { xs: 'none', sm: 'block' } }} />
          </Button>

          <Menu
            anchorEl={branchAnchor}
            open={Boolean(branchAnchor)}
            onClose={() => setBranchAnchor(null)}
            PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 260, border: '1px solid #e2e8f0', p: 1 } }}
          >
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 800 }}>
              YOUR LOCATIONS
            </Typography>
            {branches.map((branch) => (
              <MenuItem
                key={branch._id}
                onClick={() => handleBranchSwitch(branch)}
                selected={branch._id === activeBranchId}
                sx={{ borderRadius: 2, my: 0.5, py: 1.2 }}
              >
                <ListItemIcon>
                  <BusinessIcon fontSize="small" color={branch._id === activeBranchId ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={branch._id === activeBranchId ? 800 : 500}>
                    {branch.branchName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {branch.branchCode || 'No Code'}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            {safeUser.role === 'Administrator' && (
              <>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => { setBranchAnchor(null); navigate('/settings?tab=clinic'); }} sx={{ borderRadius: 2 }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  <Typography variant="body2" fontWeight="600">Add New Branch</Typography>
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>

        {/* ── CENTER SEARCH ── */}
        <Box
          ref={searchBoxRef}
          sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', flex: 1.5, position: 'relative' }}
        >
          <Box sx={{
            width: '100%', maxWidth: 420, height: 40,
            bgcolor: '#f1f5f9', borderRadius: '10px',
            display: 'flex', alignItems: 'center', px: 1.5,
            border: '1px solid transparent', transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#e2e8f0' },
            '&:focus-within': {
              bgcolor: 'white', border: `1px solid ${primaryColor}`,
              boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
              '&:hover': { bgcolor: 'white' },
            },
          }}>
            <SearchIcon sx={{ color: '#64748b', mr: 1, fontSize: 18 }} />
            <InputBase
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
              placeholder="Search patients, doctors..."
              fullWidth
              sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}
            />
            {searchLoading ? (
              <CircularProgress size={14} sx={{ color: '#94a3b8', ml: 1, flexShrink: 0 }} />
            ) : (
              <Box sx={{
                border: '1px solid #cbd5e1', borderRadius: '6px', px: 0.8, py: 0.3,
                bgcolor: 'white', ml: 1, display: 'flex', alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0,
              }}>
                <Typography variant="caption" fontWeight="800" color="#64748b" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                  ⌘ K
                </Typography>
              </Box>
            )}
          </Box>

          {/* ── SEARCH DROPDOWN ── */}
          {searchOpen && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute', top: 'calc(100% + 8px)',
                left: 0, right: 0, zIndex: 1300,
                borderRadius: 3, border: '1px solid #e2e8f0',
                overflow: 'hidden', maxHeight: 420, overflowY: 'auto',
              }}
            >
              {/* Loading */}
              {searchLoading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={22} sx={{ color: primaryColor }} />
                </Box>
              )}

              {/* No results */}
              {!searchLoading && allResults.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <SearchIcon sx={{ color: '#cbd5e1', fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No results for "{searchQuery}"
                  </Typography>
                </Box>
              )}

              {/* Patients section */}
              {!searchLoading && searchResults.patients.length > 0 && (
                <>
                  <Typography variant="caption" sx={{
                    px: 2, pt: 1.5, pb: 0.5, display: 'block',
                    color: '#64748b', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.06em',
                  }}>
                    PATIENTS
                  </Typography>
                  <List disablePadding>
                    {searchResults.patients.map((patient, i) => (
                      <ListItem
                        key={patient._id}
                        button
                        onClick={() => handleResultClick({ type: 'patient', data: patient })}
                        sx={{
                          px: 2, py: 1, cursor: 'pointer',
                          bgcolor: activeIndex === i ? '#f1f5f9' : 'transparent',
                          '&:hover': { bgcolor: '#f8fafc' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 42 }}>
                          <Avatar sx={{
                            width: 34, height: 34,
                            bgcolor: alpha(primaryColor, 0.1),
                            color: primaryColor, fontSize: 13, fontWeight: 700,
                          }}>
                            {(patient.fullName || patient.name || 'P').charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={highlightMatch(patient.fullName || patient.name, searchQuery)}
                          secondary={`${patient.patientId} · ${patient.mobile} · Age ${patient.age}`}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}
                          secondaryTypographyProps={{ fontSize: '0.73rem', color: '#64748b' }}
                        />
                        <Chip
                          label="Patient"
                          size="small"
                          sx={{
                            bgcolor: alpha(primaryColor, 0.08), color: primaryColor,
                            fontWeight: 700, fontSize: '0.68rem', height: 22, ml: 1,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Divider between sections */}
              {!searchLoading && searchResults.patients.length > 0 && searchResults.doctors.length > 0 && (
                <Divider sx={{ my: 0.5 }} />
              )}

              {/* Doctors section */}
              {!searchLoading && searchResults.doctors.length > 0 && (
                <>
                  <Typography variant="caption" sx={{
                    px: 2, pt: 1.5, pb: 0.5, display: 'block',
                    color: '#64748b', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.06em',
                  }}>
                    DOCTORS
                  </Typography>
                  <List disablePadding>
                    {searchResults.doctors.map((doctor, i) => {
                      const globalIndex = searchResults.patients.length + i;
                      return (
                        <ListItem
                          key={doctor._id}
                          button
                          onClick={() => handleResultClick({ type: 'doctor', data: doctor })}
                          sx={{
                            px: 2, py: 1, cursor: 'pointer',
                            bgcolor: activeIndex === globalIndex ? '#f1f5f9' : 'transparent',
                            '&:hover': { bgcolor: '#f8fafc' },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            <Avatar sx={{
                              width: 34, height: 34,
                              bgcolor: '#dcfce7', color: '#166534',
                              fontSize: 13, fontWeight: 700,
                            }}>
                              {(doctor.fullName || doctor.name || 'D').charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={highlightMatch(doctor.fullName || doctor.name, searchQuery)}
                            secondary={`${doctor.doctorConfig?.specialization || 'Doctor'} · ${doctor.defaultBranch?.branchName || 'Main'}`}
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}
                            secondaryTypographyProps={{ fontSize: '0.73rem', color: '#64748b' }}
                          />
                          <Chip
                            label="Doctor"
                            size="small"
                            sx={{
                              bgcolor: '#dcfce7', color: '#166534',
                              fontWeight: 700, fontSize: '0.68rem', height: 22, ml: 1,
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              )}

              {/* Footer keyboard hints */}
              {!searchLoading && allResults.length > 0 && (
                <Box sx={{
                  px: 2, py: 1, borderTop: '1px solid #f1f5f9',
                  display: 'flex', gap: 2, bgcolor: '#f8fafc', alignItems: 'center',
                }}>
                  {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        border: '1px solid #cbd5e1', borderRadius: '4px',
                        px: 0.8, py: 0.2, bgcolor: 'white',
                        fontSize: '11px', fontWeight: 700, color: '#64748b',
                      }}>
                        {key}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* ── RIGHT ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: { xs: 0.5, sm: 1.5 }, flex: 1 }}>

          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#64748b' }}
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (!mobileSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          <IconButton onClick={() => navigate('/messages')} sx={{ color: 'text.secondary', mr: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <ChatBubbleOutlineIcon />
            </Badge>
          </IconButton>

          {/* Quick Add */}
          <Tooltip title="Quick Actions">
            <IconButton
              onClick={(e) => setQuickAddAnchor(e.currentTarget)}
              sx={{
                bgcolor: alpha(primaryColor, 0.1), color: primaryColor,
                border: `1px solid ${alpha(primaryColor, 0.2)}`,
                width: 38, height: 38,
                '&:hover': { bgcolor: alpha(primaryColor, 0.2) },
              }}
            >
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={quickAddAnchor}
            open={Boolean(quickAddAnchor)}
            onClose={() => setQuickAddAnchor(null)}
            PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 220, p: 1 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 800 }}>
              QUICK ACTIONS
            </Typography>
            <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/patients?add=true'); }} sx={{ borderRadius: 2, py: 1.2 }}>
              <ListItemIcon><PersonAddIcon fontSize="small" color="primary" /></ListItemIcon>
              <Typography variant="body2" fontWeight="600">Add New Patient</Typography>
            </MenuItem>
            <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/calendar?new=true'); }} sx={{ borderRadius: 2, py: 1.2 }}>
              <ListItemIcon><CalendarMonthIcon fontSize="small" color="primary" /></ListItemIcon>
              <Typography variant="body2" fontWeight="600">Book Appointment</Typography>
            </MenuItem>
            {safeUser.role === 'Administrator' && (
              <>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => { setQuickAddAnchor(null); navigate('/settings?tab=users'); }} sx={{ borderRadius: 2, py: 1.2 }}>
                  <ListItemIcon><GroupAddIcon fontSize="small" /></ListItemIcon>
                  <Typography variant="body2" fontWeight="600">Invite Staff</Typography>
                </MenuItem>
              </>
            )}
          </Menu>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: '#64748b', width: 38, height: 38 }}>
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: { xs: 0, sm: 0.5 } }} />

          {/* User profile */}
          <Button
            onClick={(e) => setUserAnchor(e.currentTarget)}
            sx={{
              textTransform: 'none', color: 'text.primary',
              borderRadius: '10px', py: 0.5, px: { xs: 0.5, sm: 1 },
              minWidth: 0, height: 40, '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            <Box sx={{ textAlign: 'right', mr: 1.5, display: { xs: 'none', xl: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.1, fontSize: '0.85rem' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem' }}>
                {safeUser.role}
              </Typography>
            </Box>
            <Avatar sx={{ width: 34, height: 34, bgcolor: primaryColor, fontSize: 13, fontWeight: '900' }}>
              {getInitials(displayName)}
            </Avatar>
          </Button>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            PaperProps={{ elevation: 4, sx: { mt: 1.5, borderRadius: 3, minWidth: 200, p: 1 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1, display: { xl: 'none' } }}>
              <Typography variant="subtitle2" fontWeight="800">{displayName}</Typography>
              <Typography variant="caption" color="text.secondary">{safeUser.role}</Typography>
            </Box>
            <Divider sx={{ my: 1, display: { xl: 'none' } }} />
            <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings?tab=profile'); }} sx={{ borderRadius: 2 }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <Typography variant="body2" fontWeight="600">My Profile</Typography>
            </MenuItem>
            {safeUser.role === 'Administrator' && (
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings?tab=clinic'); }} sx={{ borderRadius: 2 }}>
                <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon>
                <Typography variant="body2" fontWeight="600">Clinic Settings</Typography>
              </MenuItem>
            )}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2 }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2" fontWeight="600">Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* ── MOBILE SEARCH BAR ── */}
      <Collapse in={mobileSearchOpen} timeout="auto" unmountOnExit sx={{ display: { md: 'none' } }}>
        <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9',
            borderRadius: '10px', px: 1.5, height: 44, border: '1px solid #e2e8f0',
            '&:focus-within': {
              borderColor: primaryColor, bgcolor: 'white',
              boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.15)}`,
            },
          }}>
            <SearchIcon sx={{ color: '#64748b', fontSize: 20, mr: 1 }} />
            <InputBase
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search patients, doctors... (Enter)"
              fullWidth
              sx={{ fontSize: '0.95rem' }}
            />
          </Box>

          {/* Mobile dropdown */}
          {searchOpen && (
            <Paper
              elevation={4}
              sx={{
                mt: 1, borderRadius: 3, border: '1px solid #e2e8f0',
                overflow: 'hidden', maxHeight: 360, overflowY: 'auto',
              }}
            >
              {searchLoading && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={20} sx={{ color: primaryColor }} />
                </Box>
              )}
              {!searchLoading && allResults.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No results for "{searchQuery}"</Typography>
                </Box>
              )}
              {!searchLoading && searchResults.patients.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: '#64748b', fontWeight: 800, fontSize: '0.65rem' }}>
                    PATIENTS
                  </Typography>
                  <List disablePadding>
                    {searchResults.patients.map((patient) => (
                      <ListItem key={patient._id} button onClick={() => { handleResultClick({ type: 'patient', data: patient }); setMobileSearchOpen(false); }} sx={{ px: 2, py: 1, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontSize: 12 }}>
                            {(patient.fullName || patient.name || 'P').charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={patient.fullName || patient.name}
                          secondary={`${patient.patientId} · ${patient.mobile}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.72rem' }}
                        />
                        <Chip label="Patient" size="small" sx={{ bgcolor: alpha(primaryColor, 0.08), color: primaryColor, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {!searchLoading && searchResults.patients.length > 0 && searchResults.doctors.length > 0 && <Divider />}
              {!searchLoading && searchResults.doctors.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: '#64748b', fontWeight: 800, fontSize: '0.65rem' }}>
                    DOCTORS
                  </Typography>
                  <List disablePadding>
                    {searchResults.doctors.map((doctor) => (
                      <ListItem key={doctor._id} button onClick={() => { handleResultClick({ type: 'doctor', data: doctor }); setMobileSearchOpen(false); }} sx={{ px: 2, py: 1, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#dcfce7', color: '#166534', fontSize: 12 }}>
                            {(doctor.fullName || doctor.name || 'D').charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={doctor.fullName || doctor.name}
                          secondary={`${doctor.doctorConfig?.specialization || 'Doctor'} · ${doctor.defaultBranch?.branchName || 'Main'}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.72rem' }}
                        />
                        <Chip label="Doctor" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>
          )}
        </Box>
      </Collapse>
    </AppBar>
  );
}