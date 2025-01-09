import axios from 'axios';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const getCommunities = (filters) => apiClient.get('/communities', { params: filters });
const getCommunityDetails = (communityId) => apiClient.get(`/communities/${communityId}`);
const createCommunity = (community) => apiClient.post('/communities', community);

const communityService = {
  getCommunities,
  getCommunityDetails,
  createCommunity,
};

export default communityService;
