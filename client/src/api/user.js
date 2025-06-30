import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch current user';
  }
};

export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch users';
  }
};

export const getUserById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || `Failed to fetch user with ID: ${id}`;
  }
};

export const updateUserRating = async (id, rating, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}/rating`,
      null, // No request body
      {
        params: { rating },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to update user rating';
  }
};