import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import authService from '../services/authService';
import '../styles/Login.css'; // Correct relative path


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await authService.login({ username, password });
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    }
  };

  return (
    <Box className="login-container">
      <Typography variant="h4" component="h1" className="login-title">
        Admin Login
      </Typography>
      {error && <Alert severity="error" className="login-alert">{error}</Alert>}
      <form onSubmit={handleLogin} className="login-form">
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth className="login-button">
          Login
        </Button>
      </form>
    </Box>
  );
};

export default Login;
