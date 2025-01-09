import React, { useState, useEffect } from 'react';
import { Typography, TextField, Grid, Button } from '@mui/material';
import CommunityTable from '../components/CommunityTable';
import CommunityDetailsModal from '../components/CommunityDetailsModal';
import CreateCommunityModal from '../components/CreateCommunityModal';
import communityService from '../services/communityService';
import '../styles/Communities.css';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [filters, setFilters] = useState({ search: '', privacy: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [error, setError] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await communityService.getCommunities(filters);
        setCommunities(response.data.communities || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to fetch communities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [filters]);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCommunityCreated = () => {
    setFilters({ ...filters }); // Refresh community list
  };

  const handleCloseModal = () => {
    setSelectedCommunity(null);
  };

  return (
    <div className="communities-container">
      <Typography variant="h4" className="communities-title">Community Management</Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            label="Search by name"
            variant="outlined"
            fullWidth
            value={filters.search}
            onChange={handleSearch}
          />
        </Grid>
        <Grid item xs={12} md={6} style={{ textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={() => setOpenCreateModal(true)}>
            Create Community
          </Button>
        </Grid>
      </Grid>

      {error && <Typography color="error">{error}</Typography>}

      <CommunityTable
        communities={communities}
        totalPages={totalPages}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        onViewCommunity={(community) => setSelectedCommunity(community)}
      />

      {selectedCommunity && (
        <CommunityDetailsModal
          community={selectedCommunity}
          onClose={handleCloseModal}
        />
      )}

      <CreateCommunityModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
};

export default Communities;
