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
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="p-4 text-red-600 bg-red-100 border-l-4 border-red-500 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Your Dashboard</h1>
      
      {userData ? (
        <div className="space-y-8">
          <section className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Your Profile</h2>
            <UserProfile user={userData} />
          </section>
          
          <section className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Update Your Rating</h2>
            <RatingForm 
              currentRating={userData.rating} 
              onUpdate={handleRatingUpdate} 
            />
          </section>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No user data available. Please try reloading the page.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;