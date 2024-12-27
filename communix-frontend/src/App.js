import './App.css';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage'; 
import LoginPage from './pages/LoginPage'; 
import OnboardingPage from './pages/OnboardingPage'; 
import WaitingListPage from './components/WaitingListPage'; 

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* Added SignupPage route */}
        <Route path="/login" element={<LoginPage />} /> {/* Added LoginPage route */}
        <Route path="/onboarding" element={<OnboardingPage />} /> {/* Added OnboardingPage route */}
        <Route path="/waiting-list" element={<WaitingListPage />} /> 
      </Routes>
    </div>
  );
}

export default App;