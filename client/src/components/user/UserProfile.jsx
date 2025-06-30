import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Name:</span>
          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Username:</span>
          <span className="text-sm font-semibold text-gray-900">{user.username}</span>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Email:</span>
          <span className="text-sm font-semibold text-gray-900 break-all">{user.email}</span>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Rating:</span>
          <span className="text-sm font-semibold text-gray-900 flex items-center">
            {user.rating} <span className="ml-1 text-yellow-500">⭐</span>
          </span>
        </div>

        {/* Uncomment if roles are needed */}
        {/* <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Roles:</span>
          <span className="text-sm font-semibold text-gray-900">
            {user.roles.join(', ')}
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default UserProfile;