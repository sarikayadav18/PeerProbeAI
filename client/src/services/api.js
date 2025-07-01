import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const createDocument = async (title = 'Untitled Document', content = '') => {
  const response = await api.post('/documents', { title, content });
  return response.data;
};

export const getDocument = async (docId) => {
  const response = await api.get(`/documents/${docId}`);
  return response.data;
};

export const updateDocumentTitle = async (docId, newTitle) => {
  await api.put(`/documents/${docId}/title`, { title: newTitle });
};

export const listDocuments = async () => {
  const response = await api.get('/documents/list');
  return response.data;
};

export const getDocumentHistory = async (docId, sinceRevision = 0) => {
  const response = await api.get(`/documents/${docId}/history?sinceRevision=${sinceRevision}`);
  return response.data;
};

export default api;