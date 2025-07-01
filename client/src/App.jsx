import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import CodeEditor from './components/editor/CodeEditor';
import { createDocument } from './services/api';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider> {/* Add SocketProvider here */}
        <Router>
          <div className="app-container">
            <Navbar />
            <div className="content-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard collaborationEnabled={true} />
                  </ProtectedRoute>
                } />
                
                <Route path="/editor" element={
                  <ProtectedRoute>
                    <EditorEntryPoint />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/:id" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

const EditorEntryPoint = () => {
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDocument = async () => {
      try {
        const response = await createDocument();
        setDocId(response.id);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create document');
      } finally {
        setLoading(false);
      }
    };

    initializeDocument();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Initializing editor...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <CodeEditor 
      docId={docId}
      userId='3' // Will be replaced with actual user from context
      initialContent="// Start collaborating!\n// This is a shared code editor"
      language="javascript"
    />
  );
};

export default App;