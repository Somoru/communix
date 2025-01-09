import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Button } from '@mui/material';

const UserTable = ({ users, totalPages, filters, setFilters, loading, onDeactivate, onViewUser }) => {
  const handlePageChange = (event, newPage) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || 'User'}</TableCell>
              <TableCell>
                <Button onClick={() => onViewUser(user)}>View</Button>
                {user.userId && <Button onClick={() => onDeactivate(user.userId)}>Deactivate</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalPages * 10} // Assuming 10 items per page
        rowsPerPage={10}
        page={filters.page - 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserTable;
