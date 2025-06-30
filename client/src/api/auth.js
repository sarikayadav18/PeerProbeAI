import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Registration failed';
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, credentials);
    return {
      token: response.data.token,
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      name: response.data.name,
      rating: response.data.rating,
      roles: response.data.roles
    };
  } catch (error) {
    throw error.response?.data || 'Login failed';
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};