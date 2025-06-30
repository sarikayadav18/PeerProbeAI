import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../api/user';
import UserList from '../components/user/UserList';

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser) {
          const data = await getAllUsers(currentUser.token);
          setUsers(data);
        }
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  if (!currentUser || !currentUser.roles.includes('ADMIN')) {
    return (
      <div className="error-message">
        You do not have permission to view this page.
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-panel">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-description">Manage all registered users</p>
      
      {users.length > 0 ? (
        <UserList users={users} />
      ) : (
        <div className="no-data">No users found.</div>
      )}
    </div>
  );
};

export default AdminPanel;