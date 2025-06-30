import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to PeerProbeAI</h1>
      
      <div className="home-content">
        <p className="home-description">
          PeerProbeAI is a platform for peer assessment and collaboration.
          {currentUser ? (
            <span> You are logged in as {currentUser.name}.</span>
          ) : (
            <span> Join us to start evaluating your peers and improve together.</span>
          )}
        </p>
        
        <div className="home-actions">
          {currentUser ? (
            <Link to="/dashboard" className="home-button">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="home-button">
                Login
              </Link>
              <Link to="/signup" className="home-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;