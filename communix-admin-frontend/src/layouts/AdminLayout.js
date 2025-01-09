import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AdminLayout.css';


const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header onLogout={handleLogout} />
        <div className="content-container">
          <Outlet /> {/* Renders child routes */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
