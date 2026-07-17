import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, TextField, IconButton, 
  List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress, Chip, Tooltip, Menu, MenuItem, alpha
} from '@mui/material';
import { useColorMode } from '../context/ThemeContext';
import { format, isToday, isYesterday } from 'date-fns';
import io from 'socket.io-client';

import api from '../api/services/api';
import { userService } from '../api/services/userService';

// Icons
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GroupsIcon from '@mui/icons-material/Groups';
import DomainIcon from '@mui/icons-material/Domain';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const ENDPOINT = "http://localhost:5000"; 
var socket, selectedChatCompare;

export default function Messages() {
  const { primaryColor } = useColorMode();
  const loggedInUser = JSON.parse(localStorage.getItem('user')) || { _id: 'REPLACE_ME' };

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [search, setSearch] = useState("");
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); 
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Group Creation Menu State
  const [anchorEl, setAnchorEl] = useState(null);

  const messagesEndRef = useRef(null);

  // ⚡️ HELPER: Smart Sorting Logic
  // Prioritizes chats with messages, then sorts by date
  const sortChatsList = (chatList) => {
    return [...chatList].sort((a, b) => {
      // If one chat has a message and the other doesn't, put the one with a message first
      if (a.latestMessage && !b.latestMessage) return -1;
      if (!a.latestMessage && b.latestMessage) return 1;
      
      const dateA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.updatedAt);
      const dateB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.updatedAt);
      return dateB - dateA;
    });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", loggedInUser);
    
    socket.on("online users", (users) => setOnlineUsers(users));
    
    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chatId._id) {
        updateSidebarLatestMessage(newMessageRecieved);
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
        socket.emit("mark as read", { chatId: selectedChatCompare._id, userId: loggedInUser._id });
      }
    });

    socket.on("messages read", (chatId) => {
      if (selectedChatCompare && selectedChatCompare._id === chatId) {
        setMessages(prev => prev.map(m => ({ ...m, readBy: [...m.readBy, 'read'] }))); 
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const chatRes = await api.get('/chats');
        setChats(sortChatsList(chatRes.data)); // Use smart sort

        const userRes = await userService.getAll({ limit: 50 }); 
        setStaffDirectory(userRes.users || []);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/messages/${selectedChat._id}`);
        setMessages(data);
        socket.emit("join chat", selectedChat._id);
        socket.emit("mark as read", { chatId: selectedChat._id, userId: loggedInUser._id });
        selectedChatCompare = selectedChat;
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateSidebarLatestMessage = (newMsg) => {
    setChats(prev => {
      let updated = prev.map(c => c._id === newMsg.chatId._id ? { ...c, latestMessage: newMsg } : c);
      return sortChatsList(updated); // Use smart sort
    });
  };

  const startChat = async (userId) => {
    try {
      const { data } = await api.post('/chats', { userId });
      if (!chats.find((c) => c._id === data._id)) setChats(prev => sortChatsList([data, ...prev]));
      setSelectedChat(data);
      setSearch("");
    } catch (error) {
      console.error("Error creating chat", error);
    }
  };

  // ⚡️ Create Group Function
  const handleCreateGroup = async (type) => {
    setAnchorEl(null); // Close menu
    try {
      const { data } = await api.post('/chats/group', {
        chatName: type === 'clinic' ? 'Clinic Group' : 'Branch Group',
        type: type,
        branchId: type === 'branch' ? loggedInUser.defaultBranch?._id : null
      });
      
      // If it's a new group, add it to the list
      if (!chats.find((c) => c._id === data._id)) {
        setChats(prev => sortChatsList([data, ...prev]));
      }
      setSelectedChat(data);
    } catch (error) {
      console.error("Error creating group chat", error);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!newMessage.trim()) return;
      try {
        const { data } = await api.post('/messages', { content: newMessage, chatId: selectedChat._id });
        setNewMessage("");
        socket.emit("new message", data);
        setMessages([...messages, data]);
        updateSidebarLatestMessage(data);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'p');       
    if (isYesterday(date)) return 'Yesterday';         
    return format(date, 'dd/MM/yyyy');                 
  };

  const getChatDetails = (chat) => {
    if (chat.type === 'clinic') return { name: 'Clinic Group', icon: <DomainIcon />, isGroup: true };
    if (chat.type === 'branch') return { name: chat.chatName || 'Branch Group', icon: <GroupsIcon />, isGroup: true };
    
    const otherUser = chat.participants.find(p => p._id !== loggedInUser._id);
    return { name: otherUser ? (otherUser.name || otherUser.fullName) : 'Unknown', icon: null, isGroup: false, userId: otherUser?._id };
  };

  const privateChatUserIds = chats.filter(c => c.type === 'private').flatMap(c => c.participants.map(p => p._id));
  const unchattedStaff = staffDirectory.filter(user => 
    !privateChatUserIds.includes(user._id) && 
    (user.name || user.fullName).toLowerCase().includes(search.toLowerCase())
  );

  // Check if groups already exist so we can disable the buttons
  const hasClinicGroup = chats.some(c => c.type === 'clinic');
  const hasBranchGroup = chats.some(c => c.type === 'branch');

  return (
    <Paper elevation={0} sx={{ height: { xs: 'calc(100vh - 60px)', md: '85vh' }, mx: { xs: 0, md: 3 }, my: { xs: 0, md: 2 }, borderRadius: { xs: 0, md: 3 }, display: 'flex', overflow: 'hidden', border: { xs: 'none', md: '1px solid #e2e8f0' } }}>
      
      {/* ================= LEFT SIDEBAR ================= */}
      <Box sx={{ width: { xs: '100%', md: '380px' }, borderRight: '1px solid #e2e8f0', display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', bgcolor: '#fff' }}>
        
        <Box p={2.5} borderBottom="1px solid #e2e8f0" bgcolor="#f8fafc">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="800" color="#0f172a">Chats</Typography>
            
            {/* ⚡️ Group Creation Menu */}
            <Tooltip title="Create Groups">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}>
                <GroupAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 200 } }}>
              <MenuItem onClick={() => handleCreateGroup('clinic')} disabled={hasClinicGroup}>
                <DomainIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                {hasClinicGroup ? "Clinic Group (Exists)" : "Create Clinic Group"}
              </MenuItem>
              <MenuItem onClick={() => handleCreateGroup('branch')} disabled={hasBranchGroup}>
                <GroupsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                {hasBranchGroup ? "Branch Group (Exists)" : "Create Branch Group"}
              </MenuItem>
            </Menu>
          </Box>
          <TextField
            fullWidth size="small" placeholder="Search staff or groups..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />,
              sx: { borderRadius: 4, bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' } }
            }}
          />
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {loadingChats ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress size={30} /></Box>
          ) : (
            <>
              {chats.filter(c => getChatDetails(c).name.toLowerCase().includes(search.toLowerCase())).map((chat) => {
                const details = getChatDetails(chat);
                const latestMsg = chat.latestMessage;
                const isMe = latestMsg?.sender?._id === loggedInUser._id || latestMsg?.sender === loggedInUser._id;
                const isRead = latestMsg?.readBy?.length > 1; 

                return (
                  <React.Fragment key={chat._id}>
                    <ListItem button onClick={() => setSelectedChat(chat)} sx={{ p: 2, bgcolor: selectedChat?._id === chat._id ? '#f1f5f9' : 'transparent', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: details.isGroup ? '#0f172a' : primaryColor, width: 48, height: 48 }}>
                          {details.icon ? details.icon : details.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontWeight="700" color="#0f172a" noWrap>{details.name}</Typography>
                            <Typography variant="caption" color={selectedChat?._id === chat._id ? primaryColor : 'text.secondary'} fontWeight="600">
                              {latestMsg ? formatMessageTime(latestMsg.createdAt) : ''} 
                            </Typography>
                          </Box>
                        } 
                        secondary={
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {isMe && latestMsg && <DoneAllIcon sx={{ fontSize: 16, color: isRead ? '#3b82f6' : '#94a3b8' }} />}
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
                              {latestMsg ? (isMe ? `You: ${latestMsg.content}` : latestMsg.content) : 'Tap to start chatting'}
                            </Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                    <Divider sx={{ ml: 9 }} />
                  </React.Fragment>
                );
              })}

              <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ px: 3, py: 1.5, display: 'block', bgcolor: '#f8fafc' }}>
                STAFF DIRECTORY
              </Typography>
              {unchattedStaff.map((user) => (
                <ListItem button key={user._id} onClick={() => startChat(user._id)} sx={{ p: 2, '&:hover': { bgcolor: '#f8fafc' } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: primaryColor }}>{(user.name || user.fullName || 'U').charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={<Typography fontWeight="700">{user.name || user.fullName}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{user.role}</Typography>} />
                </ListItem>
              ))}
            </>
          )}
        </List>
      </Box>

      {/* ================= RIGHT SIDE (CHAT WINDOW) ================= */}
      <Box sx={{ flex: 1, display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', bgcolor: '#f8fafc' }}> 
        {!selectedChat ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" bgcolor="#f8fafc">
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#e2e8f0', color: '#94a3b8', mb: 3 }}><ChatBubbleOutlineIcon fontSize="large" /></Avatar>
            <Typography variant="h5" fontWeight="800" color="#0f172a">Clinic Messenger</Typography>
            <Typography color="text.secondary" mt={1}>Select a chat or staff member to start.</Typography>
          </Box>
        ) : (
          <>
            {/* Chat Header */}
            <Box display="flex" alignItems="center" p={2} borderBottom="1px solid #e2e8f0" bgcolor="#fff" zIndex={10}>
              <IconButton sx={{ display: { md: 'none' }, mr: 1 }} onClick={() => setSelectedChat(null)}>
                <ArrowBackIcon />
              </IconButton>
              
              <Avatar sx={{ bgcolor: getChatDetails(selectedChat).isGroup ? '#0f172a' : primaryColor, mr: 2, width: 40, height: 40 }}>
                {getChatDetails(selectedChat).icon || getChatDetails(selectedChat).name.charAt(0)}
              </Avatar>
              
              <Box textAlign={'left'}>
                <Typography variant="subtitle1" fontWeight="800" color="#0f172a" lineHeight={1.2}>
                  {getChatDetails(selectedChat).name}
                </Typography>
                
                {!getChatDetails(selectedChat).isGroup && (
                  <Typography variant="caption" color={onlineUsers.includes(getChatDetails(selectedChat).userId) ? "success.main" : "text.secondary"} fontWeight="600">
                    {onlineUsers.includes(getChatDetails(selectedChat).userId) ? 'Online' : 'Offline'}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {loadingMessages ? (
                <CircularProgress sx={{ alignSelf: 'center', mt: 5 }} />
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender._id === loggedInUser._id;
                  const isRead = m.readBy && m.readBy.length > 1;

                  return (
                    <Box key={m._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {getChatDetails(selectedChat).isGroup && !isMe && (
                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ ml: 1, mb: 0.2 }}>
                          {m.sender.name || m.sender.fullName}
                        </Typography>
                      )}

                      <Box 
                        sx={{ 
                          bgcolor: isMe ? '#d9fdd3' : '#fff', color: '#111b21', px: 2, py: 1, 
                          borderRadius: isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px', 
                          boxShadow: '0 1px 1px rgb(0 0 0 / 0.1)', maxWidth: { xs: '85%', md: '65%' } 
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{m.content}</Typography>
                        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={0.5} mt={0.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {formatMessageTime(m.createdAt)}
                          </Typography>
                          {isMe && <DoneAllIcon sx={{ fontSize: 14, color: isRead ? '#3b82f6' : '#94a3b8' }} />}
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box p={2} bgcolor="#f0f2f5" display="flex" alignItems="center" gap={2}>
              <TextField 
                fullWidth variant="outlined" placeholder="Type a message" size="small"
                value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={sendMessage}
                sx={{ '& fieldset': { border: 'none' }, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 2, px: 1 } }}
              />
              <IconButton onClick={(e) => sendMessage({ type: 'click' })} sx={{ bgcolor: primaryColor, color: 'white', '&:hover': { bgcolor: '#0f172a' }, width: 44, height: 44 }}>
                <SendIcon fontSize="small" sx={{ ml: 0.5 }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}