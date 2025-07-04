import React from 'react';

const UserList = ({ participants, currentUser, getUserColor }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-md mt-3">
      <h4 className="text-lg font-semibold mb-2">
        Collaborators ({participants.length})
      </h4>
      <ul className="space-y-1">
        {participants.map(({ userId }) => (
          <li key={userId} className="flex items-center text-sm">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getUserColor(userId) }}
            />
            {userId == currentUser ? 'You' : `User ${userId}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
