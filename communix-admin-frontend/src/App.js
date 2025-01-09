import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Communities from './pages/Communities';
// import Groups from './pages/Groups';
// import Moderation from './pages/Moderation';
// import Settings from './pages/Settings';
import Login from './pages/Login';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="communities" element={<Communities />} />
        {/*  <Route path="groups" element={<Groups />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
};

export default App;
