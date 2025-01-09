import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, CircularProgress } from '@mui/material';
import userService from '../services/userService';

const UserProfileModal = ({ user, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await userService.getUserDetails(user.userId);
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setDetails(null); // Prevent rendering errors
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  if (!user) return null;

  return (
    <Modal open={!!user} onClose={onClose}>
      <Box sx={{ width: 600, margin: 'auto', mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          details && (
            <>
              <Typography variant="h5" gutterBottom>
                User Profile
              </Typography>
              <Typography><strong>Name:</strong> {details.name}</Typography>
              <Typography><strong>Email:</strong> {details.email}</Typography>
              <Typography><strong>Role:</strong> {details.role}</Typography>
              <Typography><strong>Onboarding Answers:</strong></Typography>
              <ul>
                {details.onboardingAnswers?.map((item, index) => (
                  <li key={index}>
                    <strong>{item.question}:</strong> {item.answers.join(', ')}
                  </li>
                ))}
              </ul>
              <Typography><strong>Communities:</strong></Typography>
              <ul>
                {details.communities?.map((community) => (
                  <li key={community.communityId}>{community.name}</li>
                ))}
              </ul>
              <Typography><strong>Groups:</strong></Typography>
              <ul>
                {details.groups?.map((group) => (
                  <li key={group.groupId}>{group.name}</li>
                ))}
              </ul>
              <Button onClick={onClose} color="primary" variant="contained">
                Close
              </Button>
            </>
          )
        )}
      </Box>
    </Modal>
  );
};

export default UserProfileModal;
