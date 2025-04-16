import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Card, LinearProgress,
  List, ListItem, ListItemText, IconButton, Avatar, Chip,
  Divider, InputAdornment, Grid, Paper, Badge, CircularProgress, Snackbar,
  Alert
} from '@mui/material';
import { Send, Search, Delete, History, Add } from '@mui/icons-material';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const { authToken } = useAuth();
  const messagesEndRef = useRef(null);
  const [toastOpen, setToastOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('/api/chat/chatHistory', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // console.log("chats", res.data);
      setChatHistory(res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };


  useEffect(() => {
    scrollToBottom();
    fetchChatHistory(); // Load on mount
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = { text: message, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/chat', { question: message }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        confidence: response.data.confidence,
        sources: response.data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      await fetchChatHistory();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        confidence: 0,
        timestamp: new Date()
      }]);
    }

    setMessage('');
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setToastOpen(true);
      fetchChatHistory();
    } catch (error) {
      console.error('Error deleting selected Chat:', error);
    }
  };

  const filteredChatHistory = chatHistory.filter(chat =>
    chat.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left Sidebar */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{
          // borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setMessages([]);
              setSelectedChat(null);
            }}
            sx={{ mb: 2 }}
          >
            New Chat
          </Button>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <List sx={{ overflow: 'auto', flexGrow: 1 }}>
            {(searchQuery ? filteredChatHistory : chatHistory).map((chat) => (
              <ListItem
                button
                key={chat._id}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemText
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  }}
                  primary={chat.question && typeof chat.question === 'string'
                    ? chat.question
                    : Array.isArray(chat.question) && chat.question.length > 0
                      ? chat.question[0].text
                      : 'Untitled'}
                  selected={selectedChat?.id === chat._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    const botMessage = {
                      text: chat.response,
                      sender: 'bot',
                      confidence: chat.confidence,
                      sources: chat.sources,
                      timestamp: new Date()
                    };

                    setMessages([botMessage]);
                  }}
                />
                <IconButton edge="end" size="small">
                  <Delete onClick={() => handleDelete(chat._id)} fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>

        </Box>
      </Grid>

      {/* Main Chat Area */}
      <Grid
        size={{ xs: 12, md: 9 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'background.default',
        }}>
          {/* Chat Header */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'background.paper',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>AI</Avatar>
              <Typography variant="h6">Institutional Assistant</Typography>
            </Box>
            <Box>
              {/* Used Snackbar for toast notification*/}
              <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
                  Deleted Successfully!
                </Alert>
              </Snackbar>
            </Box>
          </Box>

          {/* Chat Messages */}
          <Box sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)'
          }}>
            {messages?.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Card
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
                    boxShadow: 1
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                  {msg.sender === 'bot' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={msg.confidence}
                          sx={{
                            width: '100px',
                            height: '8px',
                            borderRadius: 2,
                            mr: 1
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {msg.confidence}% Confidence
                        </Typography>
                      </Box>
                      {msg.sources && msg.sources.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Sources:
                          </Typography>
                          {msg.sources.map((source, i) => (
                            <Chip
                              key={i}
                              label={`${source.title} (${source.folder})`}
                              size="small"
                              sx={{ mr: 0.5, mt: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  )}
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Card>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question about the institution..."
                  disabled={loading}
                  InputProps={{
                    sx: { borderRadius: 4 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <History color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !message.trim()}
                    sx={{ borderRadius: 4 }}
                  >
                    <Send sx={{ mr: 1 }} /> Send
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChatInterface;