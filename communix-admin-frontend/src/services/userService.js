import axios from 'axios';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    window.location.href = '/login';
  }
  return config;
});

const getUsers = (filters) => apiClient.get('/users', { params: filters });
const getUserDetails = (userId) => apiClient.get(`/users/${userId}`);
const updateUser = (userId, updates) => apiClient.put(`/users/${userId}`, updates);
const deactivateUser = (userId) => apiClient.put(`/users/${userId}/deactivate`);
const banUser = (userId) => apiClient.put(`/users/${userId}/ban`);
const assignRole = (userId, role) => apiClient.put(`/users/${userId}/role`, { role });

const userService = {
  getUsers,
  getUserDetails,
  updateUser,
  deactivateUser,
  banUser,
  assignRole,
};

export default userService;
