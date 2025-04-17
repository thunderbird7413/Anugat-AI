import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Card, LinearProgress,
  List, ListItem, ListItemText, IconButton, Avatar, Chip,
  Divider, InputAdornment, Grid, Snackbar, Alert, CircularProgress
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
      setChatHistory(res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
    fetchChatHistory();
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
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Grid
        item
        xs={12}
        md={2} // Changed from md={3} to make sidebar narrower
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          borderRight: '1px solid #e0e0e0',
          width: 400, // Set fixed width instead of using grid ratio
          flexShrink: 0 // Prevent width adjustment
        }}
      >
        <Box sx={{ p: 2 }}>
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

          <List>
            {(searchQuery ? filteredChatHistory : chatHistory).map((chat) => (
              <ListItem
                button
                key={chat._id}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemText
                  primary={chat.question && typeof chat.question === 'string'
                    ? chat.question
                    : Array.isArray(chat.question) && chat.question.length > 0
                      ? chat.question[0].text
                      : 'Untitled'}
                  sx={{
                    '&:hover': {
                      cursor: "pointer"
                    },

                  }}
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
                <IconButton edge="end" size="small" onClick={() => handleDelete(chat._id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Grid>

      {/* Chat Area */}
      <Grid
        item
        xs={12}
        md={9}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          width: '100%', // Add explicit width
          flex: 1 // Ensure it takes available space
        }}
      >

        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'background.paper',
        }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>AI</Avatar>
          <Typography variant="h6">Institutional Assistant</Typography>
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

        {/* Messages */}
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)'
        }}>
          {messages?.map((msg, index) => (
            <Box sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              width: '80%', // Add width constraint
              maxWidth: '100%', // Prevent overflow
              background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Card
                sx={{
                  p: 2,
                  // maxWidth: '85%', // Increased from 70%
                  minWidth: '300px', // Add minimum width
                  width: 'fit-content', // Allow content-based width
                  maxWidth: '100%', // Ensure it doesn't overflow container
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
                        sx={{ width: '100px', height: '8px', borderRadius: 2, mr: 1 }}
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
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
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

        {/* Input */}
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
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !message.trim()}
                sx={{ borderRadius: 4 }}
              >
                <Send sx={{ mr: 1 }} /> Send
              </Button>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChatInterface;
