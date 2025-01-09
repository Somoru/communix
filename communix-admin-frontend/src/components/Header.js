import React from 'react';
import '../styles/Header.css';


const Header = ({ onLogout }) => {
  return (
    <div className="header">
      <h2>Admin Dashboard</h2>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Header;
