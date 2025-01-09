import React, { useState, useEffect } from 'react';
import { Typography, TextField, Grid } from '@mui/material';
import UserTable from '../components/UserTable';
import UserProfileModal from '../components/UserProfileModal';
import userService from '../services/userService';
import '../styles/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await userService.getUsers(filters);
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleDeactivate = async (userId) => {
    try {
      await userService.deactivateUser(userId);
      setFilters({ ...filters }); // Refresh user list
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError('Failed to deactivate user.');
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="users-container">
      <Typography variant="h4" className="users-title">User Management</Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            label="Search by name or email"
            variant="outlined"
            fullWidth
            value={filters.search}
            onChange={handleSearch}
          />
        </Grid>
      </Grid>

      {error && <Typography color="error">{error}</Typography>}

      <UserTable
        users={users}
        totalPages={totalPages}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        onDeactivate={handleDeactivate}
        onViewUser={(user) => setSelectedUser(user)}
      />

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Users;
