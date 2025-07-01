import React from 'react';

const UserList = ({ participants = [], currentUser }) => {
  // Generate random pastel colors for user avatars
  const getUserColor = (userId) => {
    const colors = [
      'bg-pink-200 text-pink-800',
      'bg-purple-200 text-purple-800',
      'bg-indigo-200 text-indigo-800',
      'bg-blue-200 text-blue-800',
      'bg-cyan-200 text-cyan-800',
      'bg-teal-200 text-teal-800',
    ];
    const index = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Get initials from user ID
  const getInitials = (userId) => {
    const parts = userId.split(/[_\-. ]/);
    return parts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <div className="absolute right-4 top-16 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-medium text-gray-200">Collaborators ({participants.length})</h3>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {participants.map((userId) => (
          <div 
            key={userId} 
            className={`flex items-center p-3 hover:bg-gray-700 ${
              userId === currentUser ? 'bg-gray-700 bg-opacity-50' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${getUserColor(userId)}`}>
              {getInitials(userId)}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {userId}
                {userId === currentUser && (
                  <span className="ml-1 text-xs text-gray-400">(You)</span>
                )}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userId === currentUser ? 'Currently editing' : 'Active'}
              </p>
            </div>
          </div>
        ))}
        
        {participants.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400">No other collaborators</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;