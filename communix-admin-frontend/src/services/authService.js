import axios from 'axios';
import config from '../config';

const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${config.apiBaseUrl}/auth/login`, credentials);
    return response.data.token; // Return the JWT token
  },
};

export default authService;
