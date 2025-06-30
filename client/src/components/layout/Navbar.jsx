import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">PeerProbeAI</Link>
      </div>
      
      <div className="navbar-menu">
        {currentUser ? (
          <>
            <div className="navbar-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            
            {currentUser.roles.includes('ADMIN') && (
              <div className="navbar-item">
                <Link to="/admin">Admin Panel</Link>
              </div>
            )}
            
            <div className="navbar-item">
              <span className="navbar-user">
                {currentUser.name} ({currentUser.rating}⭐)
              </span>
            </div>
            
            <div className="navbar-item">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="navbar-item">
              <Link to="/login">Login</Link>
            </div>
            <div className="navbar-item">
              <Link to="/signup">Sign Up</Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;