import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Button } from '@mui/material';

const CommunityTable = ({ communities, totalPages, filters, setFilters, loading, onViewCommunity }) => {
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
            <TableCell>Privacy</TableCell>
            <TableCell>Members</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {communities.map((community) => (
            <TableRow key={community.communityId}>
              <TableCell>{community.name}</TableCell>
              <TableCell>{community.privacy}</TableCell>
              <TableCell>{community.membersCount || 0}</TableCell>
              <TableCell>
                <Button onClick={() => onViewCommunity(community)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalPages * 10}
        rowsPerPage={10}
        page={filters.page - 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CommunityTable;
