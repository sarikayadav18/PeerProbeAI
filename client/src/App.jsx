import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import InterviewPage from './components/interview/InterviewPage'; // Import your InterviewPage component
import { createDocument } from './services/api';
import QuestionForm from './components/question/QuestionForm';
import QuestionList from './components/question/QuestionList';
import TestCaseForm from './components/testcase/TestCaseForm';
import TestCaseList from './components/testcase/TestCaseList';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
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

                <Route path="/interview/:docId" element={
                  <ProtectedRoute>
                    <InterviewPage />
                  </ProtectedRoute>
                } />

                <Route path="/start-interview" element={
                  <ProtectedRoute>
                    <InterviewEntryPoint />
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

                <Route path="/questions/new" element={
                  <ProtectedRoute>
                    <QuestionForm />
                  </ProtectedRoute>
                } />

                <Route path="/questions" element={
                  <ProtectedRoute>
                    <QuestionList />
                  </ProtectedRoute>
                } />

                <Route path="/test-cases/new" element={
                  <ProtectedRoute>
                    <TestCaseForm />
                  </ProtectedRoute>
                } />
                <Route path="/test-cases" element={
                  <ProtectedRoute>
                    <TestCaseList />
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

const InterviewEntryPoint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = user?.token;
  const userId = user?.id;

  useEffect(() => {
    const initializeInterview = async () => {
      try {
        const response = await createDocument();
        // Navigate to the interview page with the new docId
        navigate(`/interview/${response.id}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create interview document');
        setLoading(false);
      }
    };

    initializeInterview();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Setting up interview session...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

export default App;