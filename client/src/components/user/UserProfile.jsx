import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <div className="profile-field">
        <span className="field-label">Name:</span>
        <span className="field-value">{user.name}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Username:</span>
        <span className="field-value">{user.username}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Email:</span>
        <span className="field-value">{user.email}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Rating:</span>
        <span className="field-value">{user.rating} ⭐</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Roles:</span>
        <span className="field-value">{user.roles.join(', ')}</span>
      </div>
    </div>
  );
};

export default UserProfile;