import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.institution || 'User'}
      </Typography>
      <Typography variant="body1" paragraph>
        This is your institution's dashboard. From here you can:
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button 
          variant="contained" 
          href="/content"
          sx={{ px: 4, py: 2 }}
        >
          Manage Content
        </Button>
        <Button 
          variant="outlined" 
          href="/chat"
          sx={{ px: 4, py: 2 }}
        >
          Test Chatbot
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;