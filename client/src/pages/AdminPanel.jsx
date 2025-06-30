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
      <div className="p-4 text-red-600 bg-red-100 border-l-4 border-red-500">
        You do not have permission to view this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 border-l-4 border-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Admin Panel</h1>
      <p className="mb-6 text-gray-600">Manage all registered users</p>
      
      {users.length > 0 ? (
        <UserList users={users} />
      ) : (
        <div className="p-4 text-gray-500 bg-gray-50 rounded-lg">
          No users found.
        </div>
      )}
    </div>
  );
};

export default AdminPanel;