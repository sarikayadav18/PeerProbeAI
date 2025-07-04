import React from 'react';

const UserList = ({ participants, currentUser, getUserColor }) => {
  return (
    <div className="user-list">
      <h4>Collaborators ({participants.length})</h4>
      <ul>
        {participants.map(user => (
          <li key={user.id} style={{ color: getUserColor(user.id) }}>
            <span className="user-color-dot" style={{ backgroundColor: getUserColor(user.id) }} />
            {user.id === currentUser ? 'You' : user.name || `User ${user.id}`}
          </li>
        ))}
      </ul>
      <style jsx>{`
        .user-list {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          margin-top: 10px;
        }
        .user-list h4 {
          margin: 0 0 8px 0;
        }
        .user-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .user-list li {
          display: flex;
          align-items: center;
          padding: 4px 0;
        }
        .user-color-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default UserList;