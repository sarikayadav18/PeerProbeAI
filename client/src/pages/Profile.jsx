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
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">User Profile</h1>
      
      {user ? (
        <UserProfile user={user} />
      ) : (
        <div className="no-data">No user found with ID: {id}</div>
      )}
    </div>
  );
};

export default Profile;