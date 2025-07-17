import axios from 'axios';

// Configure axios instance - using Solution #1
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Update with your actual backend URL
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createQuestion = (questionData) => {
  return api.post('/questions', questionData);
};

export const getQuestionsByDocument = (documentId) => {
  return api.get(`/questions/document/${documentId}`);
};

export const getQuestionById = (id) => {
  return api.get(`/questions/${id}`);
};

export const updateQuestion = (id, questionData) => {
  return api.put(`/questions/${id}`, questionData);
};

export const deleteQuestion = (id) => {
  return api.delete(`/questions/${id}`);
};

export const updateQuestionPosition = (id, position) => {
  return api.post(`/questions/${id}/position`, { position });
};