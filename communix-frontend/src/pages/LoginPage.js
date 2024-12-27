import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const LoginContainer = styled.div`
  background-color: #f8f9fa; 
  min-height: 100vh;
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center; 
  padding: 2rem; 
  box-sizing: border-box; 
`;

const FormContainer = styled.div`
  background-color: #fff;
  padding: 3rem; 
  border-radius: 0.5rem; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
  max-width: 400px; 
  width: 100%; 
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem; 
  font-weight: bold;
  color: #333; 
  margin-bottom: 2rem; 
`;

const Form = styled.form`
  display: flex;
  flex-direction: column; 
  gap: 1.5rem; 
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem; 
  color: #555; 
`;

const Input = styled.input`
  padding: 0.75rem; 
  border: 1px solid #ced4da; 
  border-radius: 0.25rem; 
  width: 100%; 
  box-sizing: border-box; 

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); 
  }
`;

const Button = styled.button`
  background-color: #007bff; 
  color: #fff;
  padding: 0.75rem 1.5rem; 
  border: none;
  border-radius: 0.25rem; 
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease; 

  &:hover {
    background-color: #0056b3; 
  }
`;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      console.log('Login successful:', response.data);
      // TODO: Handle successful login (e.g., store token, redirect)
      // Store the JWT and user ID in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.userId);
      navigate('/onboarding');

    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
  };

  return (
    <LoginContainer>
      <FormContainer>
        <Title>Log In</Title>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Log In</Button>
        </Form>
      </FormContainer>
    </LoginContainer>
  );
}

export default LoginPage;