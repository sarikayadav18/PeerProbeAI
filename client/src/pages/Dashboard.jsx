import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateUserRating } from '../api/user';
import UserProfile from '../components/user/UserProfile';
import RatingForm from '../components/user/RatingForm';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (currentUser) {
          const data = await getCurrentUser(currentUser.token);
          setUserData(data);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching current user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [currentUser]);

  const handleRatingUpdate = async (newRating) => {
    try {
      if (!currentUser || !userData) return;
      
      const updatedUser = await updateUserRating(
        userData.id,
        newRating,
        currentUser.token
      );
      
      setUserData(updatedUser);
    } catch (err) {
      setError('Failed to update rating');
      console.error('Rating update error:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Your Dashboard</h1>
      
      {userData ? (
        <>
          <div className="dashboard-section">
            <h2>Your Profile</h2>
            <UserProfile user={userData} />
          </div>
          
          <div className="dashboard-section">
            <h2>Update Your Rating</h2>
            <RatingForm 
              currentRating={userData.rating} 
              onUpdate={handleRatingUpdate} 
            />
          </div>
        </>
      ) : (
        <div className="no-data">
          <p>No user data available. Please try reloading the page.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;