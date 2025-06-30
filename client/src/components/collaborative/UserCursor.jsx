import React from 'react';

const UserCursor = ({ position, color, name }) => {
  return (
    <div 
      className="absolute top-0 h-full"
      style={{ 
        left: `${position * 10}px`, // Adjust based on your editor's character width
      }}
    >
      <div 
        className="absolute top-0 w-0.5 h-6"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute top-6 px-2 py-1 text-xs font-medium text-white rounded-md whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
};

export default UserCursor;