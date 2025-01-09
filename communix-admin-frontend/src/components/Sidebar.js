import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/users', label: 'Users' },
    { to: '/communities', label: 'Communities' },
    { to: '/groups', label: 'Groups' },
    { to: '/moderation', label: 'Moderation' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">Admin Panel</div>
      <ul className="sidebar-links">
        {links.map((link) => (
          <li key={link.to} className={location.pathname === link.to ? 'active' : ''}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
