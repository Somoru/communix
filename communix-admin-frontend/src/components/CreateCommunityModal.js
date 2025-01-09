import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, MenuItem, Grid } from '@mui/material';
import communityService from '../services/communityService';

const CreateCommunityModal = ({ open, onClose, onCommunityCreated }) => {
  const [community, setCommunity] = useState({
    name: '',
    description: '',
    privacy: 'Public',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCommunity({ ...community, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await communityService.createCommunity(community);
      onCommunityCreated();
      onClose();
    } catch (err) {
      console.error('Error creating community:', err);
      setError('Failed to create community. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 500, margin: 'auto', mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom>
          Create Community
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              name="name"
              value={community.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={community.description}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Privacy"
              name="privacy"
              value={community.privacy}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={onClose} color="secondary" variant="outlined" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateCommunityModal;
