import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../api/user';
import UserProfile from '../components/user/UserProfile';

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (currentUser) {
          const userData = await getUserById(id, currentUser.token);
          setUser(userData);
        }
      } catch (err) {
        setError('Failed to fetch user profile');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 border-l-4 border-red-500 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">User Profile</h1>
      
      {user ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <UserProfile user={user} />
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-xl shadow-md">
          <p className="text-gray-600">No user found with ID: {id}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;