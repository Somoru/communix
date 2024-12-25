import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';


// Import your components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import WaitingListPage from './components/WaitingListPage';

function App() {
  return (
    
      <Router> 
        <div className="app-container">
          <Navbar />
          <Routes> 
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/waiting-list" element={<WaitingListPage />} />
          </Routes>
        </div>
      </Router>
    
  );
}

export default App;