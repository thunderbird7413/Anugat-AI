import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, institution);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Institution Name"
          fullWidth
          margin="normal"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </form>
      <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
        Already have an account? Login
      </Button>
    </Box>
  );
};

export default Register;