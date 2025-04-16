import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const { authToken, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Institution Portal
        </Typography>
        {authToken ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/content">
              Content
            </Button>
            <Button color="inherit" component={Link} to="/chat">
              Chat
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;