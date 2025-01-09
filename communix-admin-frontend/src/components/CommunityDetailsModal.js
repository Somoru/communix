import React from 'react';
import { Modal, Box, Typography, Button, TextField, Grid } from '@mui/material';

const CommunityDetailsModal = ({ community, onClose }) => {
  return (
    <Modal open={!!community} onClose={onClose}>
      <Box sx={{ width: 600, margin: 'auto', mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom>
          Community Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={community.name}
              variant="outlined"
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={community.description || ''}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Privacy"
              value={community.privacy || 'Public'}
              variant="outlined"
              fullWidth
              disabled
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={onClose} color="primary" variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CommunityDetailsModal;
