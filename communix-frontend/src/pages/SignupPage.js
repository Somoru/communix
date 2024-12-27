import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const SignupContainer = styled.div`
    background: linear-gradient(40deg, white 35%,#C6EBBE 100%);
  background-size: 150% 100%;
  animation: backgroundMove 15s ease infinite;

  @keyframes backgroundMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  min-height: 100vh;
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center; 
  padding: 2rem; 
  box-sizing: border-box; 
`;

const FormContainer = styled.div`
  background-color: #F4F2FA;
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
  color: black; 
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
    box-shadow: 0 0 0 0.2rem rgba(149, 178, 176,0.4); 
  }
`;

const Button = styled.button`
  background-color: black; // Changed to black
  color: #fff;
  padding: 0.75rem 1.5rem; 
  border: none;
  border-radius: 0.25rem; 
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease; 

  &:hover {
    background-color: rgb(100, 100, 100); // gray on hover
  }
`;
axios.defaults.baseURL = 'https://communix-api-bnhee2e2b5dkbrbh.southindia-01.azurewebsites.net/';
//axios.defaults.baseURL = 'https://localhost:5000/';
function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setcPassword] = useState('');

  const [profession, setProfession] = useState('student');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/auth/signup', {
        name,
        email,
        password,
        profession,
        onboardingAnswers: []
      });

      console.log('Signup successful:', response.data);
      // Store the JWT and user ID in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.userId);
      localStorage.setItem('profession', profession);
      navigate('/onboarding');

    } catch (error) {
      console.error('Signup failed:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors[0].msg);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  return (
    <SignupContainer>
      <Navbar />
      <FormContainer>
        <Title>Sign Up</Title>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Name:</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <Label htmlFor="cpassword">Confirm Password:</Label>
            <Input
              type="password"
              id="cpassword"
              value={cpassword}
              onChange={(e) => setcPassword(e.target.value)}
              required
              style={{
                boxShadow: password && cpassword && password !== cpassword ? '0 0 0 0.2rem rgba(255, 0, 0, 0.4)' : 'none'
              }}
            />
          </div>
          <Button type="submit">Sign Up</Button>
          {password && cpassword && password !== cpassword && (
            <div style={{ color: 'red', textAlign: 'center', marginTop: '0.5rem' }}>
              Passwords do not match
            </div>
          )}
        </Form>
      </FormContainer>
    </SignupContainer>
  );
}

export default SignupPage;